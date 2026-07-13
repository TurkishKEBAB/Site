"""Typed request and response schemas for project dossiers."""

from decimal import Decimal
from typing import Annotated, Literal, Union
from urllib.parse import urlparse
import uuid

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class DossierSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class DossierMetricCreate(DossierSchema):
    value: str = Field(..., min_length=1, max_length=255)
    numeric_value: Decimal | None = Field(default=None, ge=0)
    label: str = Field(..., min_length=1, max_length=255)
    note: str | None = Field(default=None, max_length=2_000)
    display_order: int = Field(default=0, ge=0)


class DossierMetricResponse(DossierMetricCreate):
    id: uuid.UUID


C4NodeKind = Literal[
    "person",
    "system",
    "client",
    "container",
    "component",
    "store",
    "queue",
    "external",
]


class DossierC4NodeCreate(DossierSchema):
    kind: C4NodeKind
    title: str = Field(..., min_length=1, max_length=255)
    sub: str | None = Field(default=None, max_length=2_000)
    leaf: bool = False
    tier_order: int = Field(default=0, ge=0)
    display_order: int = Field(default=0, ge=0)


class DossierC4NodeResponse(DossierC4NodeCreate):
    id: uuid.UUID


class DossierC4LevelCreate(DossierSchema):
    label: str = Field(..., min_length=1, max_length=255)
    note: str | None = Field(default=None, max_length=2_000)
    tiers: list[list[DossierC4NodeCreate]] = Field(..., min_length=1, max_length=20)
    display_order: int = Field(default=0, ge=0)

    @model_validator(mode="after")
    def validate_tiers(self):
        if any(not tier for tier in self.tiers):
            raise ValueError("C4 tiers must contain at least one node")
        return self


class DossierC4LevelResponse(DossierSchema):
    id: uuid.UUID
    label: str
    note: str | None = None
    tiers: list[list[DossierC4NodeResponse]]
    display_order: int


class DossierAdrCreate(DossierSchema):
    id: str = Field(..., min_length=1, max_length=64)
    title: str = Field(..., min_length=1, max_length=255)
    status: str = Field(..., min_length=1, max_length=64)
    date: str | None = Field(default=None, max_length=32)
    context: str = Field(..., min_length=1, max_length=10_000)
    decision: str = Field(..., min_length=1, max_length=10_000)
    tradeoff: str | None = Field(default=None, max_length=10_000)
    display_order: int = Field(default=0, ge=0)


class DossierAdrResponse(DossierAdrCreate):
    row_id: uuid.UUID = Field(alias="id")
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class DossierLogEntryCreate(DossierSchema):
    hash: str = Field(..., min_length=1, max_length=64)
    tag: str | None = Field(default=None, max_length=64)
    date: str = Field(..., min_length=1, max_length=32)
    title: str = Field(..., min_length=1, max_length=255)
    note: str | None = Field(default=None, max_length=10_000)
    display_order: int = Field(default=0, ge=0)


class DossierLogEntryResponse(DossierLogEntryCreate):
    row_id: uuid.UUID = Field(alias="id")
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class SequenceMessage(DossierSchema):
    from_: str = Field(alias="from", min_length=1, max_length=255)
    to: str = Field(..., min_length=1, max_length=255)
    label: str = Field(..., min_length=1, max_length=2_000)
    kind: Literal["return"] | None = None
    model_config = ConfigDict(populate_by_name=True)


class C4DiagramData(DossierSchema):
    kind: Literal["c4"]
    levels: list[DossierC4LevelCreate] = Field(default_factory=list, max_length=8)


class SequenceDiagramData(DossierSchema):
    kind: Literal["sequence"]
    actors: list[str] = Field(..., min_length=1, max_length=50)
    messages: list[SequenceMessage] = Field(default_factory=list, max_length=200)


class Entity(DossierSchema):
    name: str = Field(..., min_length=1, max_length=255)
    kind: Literal["table", "class", "abstract", "interface", "enum"] | None = None
    rows: list[str] = Field(default_factory=list, max_length=100)


class SchemaRelation(DossierSchema):
    from_: str = Field(alias="from", min_length=1, max_length=255)
    label: str = Field(..., min_length=1, max_length=64)
    to: str = Field(..., min_length=1, max_length=255)
    model_config = ConfigDict(populate_by_name=True)


class SchemaDiagramData(DossierSchema):
    kind: Literal["schema"]
    tiers: list[list[Entity]] = Field(..., min_length=1, max_length=20)
    relations: list[SchemaRelation] = Field(default_factory=list, max_length=100)


FlowKind = Literal["start", "end", "state", "final", "step", "decision", "error", "store"]


class FlowNode(DossierSchema):
    kind: FlowKind
    title: str = Field(..., min_length=1, max_length=255)
    sub: str | None = Field(default=None, max_length=2_000)
    via: str | None = Field(default=None, max_length=255)


class TiersDiagramData(DossierSchema):
    kind: Literal["tiers"]
    tiers: list[list[FlowNode]] = Field(..., min_length=1, max_length=30)
    notes: list[str] = Field(default_factory=list, max_length=100)


class MatrixRow(DossierSchema):
    label: str = Field(..., min_length=1, max_length=255)
    cells: list[str] = Field(..., min_length=1, max_length=100)


class MatrixDiagramData(DossierSchema):
    kind: Literal["matrix"]
    cols: list[str] = Field(..., min_length=1, max_length=100)
    rows: list[MatrixRow] = Field(..., min_length=1, max_length=100)


DiagramData = Annotated[
    Union[
        C4DiagramData,
        SequenceDiagramData,
        SchemaDiagramData,
        TiersDiagramData,
        MatrixDiagramData,
    ],
    Field(discriminator="kind"),
]


class DossierDiagramCreate(DossierSchema):
    id: str = Field(..., min_length=1, max_length=128)
    kind: Literal["c4", "sequence", "schema", "tiers", "matrix"]
    title: str = Field(..., min_length=1, max_length=255)
    note: str | None = Field(default=None, max_length=2_000)
    data: DiagramData
    display_order: int = Field(default=0, ge=0)

    @model_validator(mode="after")
    def match_kind(self):
        if self.data.kind != self.kind:
            raise ValueError("diagram kind must match diagram data kind")
        return self


class DossierDiagramResponse(DossierDiagramCreate):
    row_id: uuid.UUID = Field(alias="id")
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class DossierGalleryItemCreate(DossierSchema):
    id: str = Field(..., min_length=1, max_length=128)
    src: str = Field(..., min_length=2, max_length=500)
    caption: str = Field(..., min_length=1, max_length=2_000)
    hint: str | None = Field(default=None, max_length=2_000)
    display_order: int = Field(default=0, ge=0)

    @field_validator("src")
    @classmethod
    def validate_src(cls, value: str) -> str:
        parsed = urlparse(value)
        if value.startswith("/") and not value.startswith("//"):
            return value
        if parsed.scheme in {"http", "https"} and parsed.netloc:
            return value
        raise ValueError("gallery source must be a site-relative or http(s) URL")


class DossierGalleryItemResponse(DossierGalleryItemCreate):
    row_id: uuid.UUID = Field(alias="id")
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class ProjectDossierUpsert(DossierSchema):
    impact_en: str = Field(..., min_length=1, max_length=10_000)
    impact_tr: str = Field(..., min_length=1, max_length=10_000)
    metrics: list[DossierMetricCreate] = Field(default_factory=list, max_length=20)
    c4: list[DossierC4LevelCreate] = Field(default_factory=list, max_length=8)
    adrs: list[DossierAdrCreate] = Field(default_factory=list, max_length=50)
    log: list[DossierLogEntryCreate] = Field(default_factory=list, max_length=100)
    diagrams: list[DossierDiagramCreate] = Field(default_factory=list, max_length=30)
    gallery: list[DossierGalleryItemCreate] = Field(default_factory=list, max_length=50)

    @model_validator(mode="after")
    def validate_unique_ids(self):
        for collection_name in ("adrs", "log", "diagrams", "gallery"):
            collection = getattr(self, collection_name)
            ids = [item.id if collection_name != "log" else item.hash for item in collection]
            if len(ids) != len(set(ids)):
                raise ValueError(f"duplicate identifiers in {collection_name}")
        return self


class ProjectDossierResponse(DossierSchema):
    id: uuid.UUID
    project_id: uuid.UUID
    project_slug: str
    impact: str
    metrics: list[DossierMetricResponse]
    c4: list[DossierC4LevelResponse]
    adrs: list[DossierAdrResponse]
    log: list[DossierLogEntryResponse]
    diagrams: list[DossierDiagramResponse]
    gallery: list[DossierGalleryItemResponse]


class AdminProjectDossierResponse(ProjectDossierResponse):
    impact_en: str
    impact_tr: str
