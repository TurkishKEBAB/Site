"""Project dossier aggregate models."""

import uuid

from app.database import Base
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, JSON, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func


class ProjectDossier(Base):
    """One admin-managed dossier owned by a portfolio project."""

    __tablename__ = "project_dossiers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    impact_en = Column(Text, nullable=False)
    impact_tr = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    project = relationship("Project", back_populates="dossier")
    metrics = relationship(
        "DossierMetric",
        back_populates="dossier",
        cascade="all, delete-orphan",
        order_by="DossierMetric.display_order",
    )
    c4_levels = relationship(
        "DossierC4Level",
        back_populates="dossier",
        cascade="all, delete-orphan",
        order_by="DossierC4Level.display_order",
    )
    adrs = relationship(
        "DossierAdr",
        back_populates="dossier",
        cascade="all, delete-orphan",
        order_by="DossierAdr.display_order",
    )
    log_entries = relationship(
        "DossierLogEntry",
        back_populates="dossier",
        cascade="all, delete-orphan",
        order_by="DossierLogEntry.display_order",
    )
    diagrams = relationship(
        "DossierDiagram",
        back_populates="dossier",
        cascade="all, delete-orphan",
        order_by="DossierDiagram.display_order",
    )
    gallery_items = relationship(
        "DossierGalleryItem",
        back_populates="dossier",
        cascade="all, delete-orphan",
        order_by="DossierGalleryItem.display_order",
    )


class DossierMetric(Base):
    __tablename__ = "dossier_metrics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dossier_id = Column(UUID(as_uuid=True), ForeignKey("project_dossiers.id", ondelete="CASCADE"), nullable=False, index=True)
    value = Column(String(255), nullable=False)
    numeric_value = Column(Numeric(18, 4), nullable=True)
    label = Column(String(255), nullable=False)
    note = Column(Text, nullable=True)
    display_order = Column(Integer, nullable=False, default=0, index=True)

    dossier = relationship("ProjectDossier", back_populates="metrics")


class DossierC4Level(Base):
    __tablename__ = "dossier_c4_levels"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dossier_id = Column(UUID(as_uuid=True), ForeignKey("project_dossiers.id", ondelete="CASCADE"), nullable=False, index=True)
    label = Column(String(255), nullable=False)
    note = Column(Text, nullable=True)
    display_order = Column(Integer, nullable=False, default=0, index=True)

    dossier = relationship("ProjectDossier", back_populates="c4_levels")
    nodes = relationship(
        "DossierC4Node",
        back_populates="level",
        cascade="all, delete-orphan",
        order_by="(DossierC4Node.tier_order, DossierC4Node.display_order)",
    )


class DossierC4Node(Base):
    __tablename__ = "dossier_c4_nodes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    level_id = Column(UUID(as_uuid=True), ForeignKey("dossier_c4_levels.id", ondelete="CASCADE"), nullable=False, index=True)
    kind = Column(String(32), nullable=False)
    title = Column(String(255), nullable=False)
    sub = Column(Text, nullable=True)
    leaf = Column(Boolean, nullable=False, default=False)
    tier_order = Column(Integer, nullable=False, default=0, index=True)
    display_order = Column(Integer, nullable=False, default=0, index=True)

    level = relationship("DossierC4Level", back_populates="nodes")


class DossierAdr(Base):
    __tablename__ = "dossier_adrs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dossier_id = Column(UUID(as_uuid=True), ForeignKey("project_dossiers.id", ondelete="CASCADE"), nullable=False, index=True)
    identifier = Column(String(64), nullable=False)
    title = Column(String(255), nullable=False)
    status = Column(String(64), nullable=False)
    date = Column(String(32), nullable=True)
    context = Column(Text, nullable=False)
    decision = Column(Text, nullable=False)
    tradeoff = Column(Text, nullable=True)
    display_order = Column(Integer, nullable=False, default=0, index=True)

    dossier = relationship("ProjectDossier", back_populates="adrs")


class DossierLogEntry(Base):
    __tablename__ = "dossier_log_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dossier_id = Column(UUID(as_uuid=True), ForeignKey("project_dossiers.id", ondelete="CASCADE"), nullable=False, index=True)
    commit_hash = Column(String(64), nullable=False)
    tag = Column(String(64), nullable=True)
    date = Column(String(32), nullable=False)
    title = Column(String(255), nullable=False)
    note = Column(Text, nullable=True)
    display_order = Column(Integer, nullable=False, default=0, index=True)

    dossier = relationship("ProjectDossier", back_populates="log_entries")


class DossierDiagram(Base):
    __tablename__ = "dossier_diagrams"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dossier_id = Column(UUID(as_uuid=True), ForeignKey("project_dossiers.id", ondelete="CASCADE"), nullable=False, index=True)
    identifier = Column(String(128), nullable=False)
    kind = Column(String(32), nullable=False)
    title = Column(String(255), nullable=False)
    note = Column(Text, nullable=True)
    data = Column(JSON, nullable=False)
    display_order = Column(Integer, nullable=False, default=0, index=True)

    dossier = relationship("ProjectDossier", back_populates="diagrams")


class DossierGalleryItem(Base):
    __tablename__ = "dossier_gallery_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dossier_id = Column(UUID(as_uuid=True), ForeignKey("project_dossiers.id", ondelete="CASCADE"), nullable=False, index=True)
    identifier = Column(String(128), nullable=False)
    source_url = Column(String(500), nullable=False)
    caption = Column(Text, nullable=False)
    hint = Column(Text, nullable=True)
    display_order = Column(Integer, nullable=False, default=0, index=True)

    dossier = relationship("ProjectDossier", back_populates="gallery_items")
