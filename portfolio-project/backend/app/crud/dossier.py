"""CRUD operations for the project dossier aggregate."""

from collections import defaultdict
import uuid
from typing import Any, Optional

from app.models.dossier import (
    DossierAdr,
    DossierC4Level,
    DossierC4Node,
    DossierDiagram,
    DossierGalleryItem,
    DossierLogEntry,
    DossierMetric,
    ProjectDossier,
)
from app.models.project import Project
from app.schemas.dossier import (
    AdminProjectDossierResponse,
    ProjectDossierResponse,
    ProjectDossierUpsert,
)
from sqlalchemy.orm import Session, joinedload


def _dossier_query(db: Session):
    return db.query(ProjectDossier).options(
        joinedload(ProjectDossier.project),
        joinedload(ProjectDossier.metrics),
        joinedload(ProjectDossier.c4_levels).joinedload(DossierC4Level.nodes),
        joinedload(ProjectDossier.adrs),
        joinedload(ProjectDossier.log_entries),
        joinedload(ProjectDossier.diagrams),
        joinedload(ProjectDossier.gallery_items),
    )


def _serialize_dossier(
    dossier: ProjectDossier,
    language: str = "en",
    include_sources: bool = False,
) -> dict[str, Any]:
    impact = dossier.impact_tr if language == "tr" and dossier.impact_tr else dossier.impact_en
    metrics = [
        {
            "id": metric.id,
            "value": metric.value,
            "numeric_value": metric.numeric_value,
            "label": metric.label,
            "note": metric.note,
            "display_order": metric.display_order,
        }
        for metric in sorted(dossier.metrics, key=lambda item: item.display_order)
    ]

    c4_levels = []
    for level in sorted(dossier.c4_levels, key=lambda item: item.display_order):
        tiers: dict[int, list[dict[str, Any]]] = defaultdict(list)
        for node in sorted(level.nodes, key=lambda item: (item.tier_order, item.display_order)):
            tiers[node.tier_order].append(
                {
                    "id": node.id,
                    "kind": node.kind,
                    "title": node.title,
                    "sub": node.sub,
                    "leaf": node.leaf,
                    "tier_order": node.tier_order,
                    "display_order": node.display_order,
                }
            )
        c4_levels.append(
            {
                "id": level.id,
                "label": level.label,
                "note": level.note,
                "tiers": [tiers[key] for key in sorted(tiers)],
                "display_order": level.display_order,
            }
        )

    result: dict[str, Any] = {
        "id": dossier.id,
        "project_id": dossier.project_id,
        "project_slug": dossier.project.slug,
        "impact": impact,
        "metrics": metrics,
        "c4": c4_levels,
        "adrs": [
            {
                "id": adr.identifier,
                "title": adr.title,
                "status": adr.status,
                "date": adr.date,
                "context": adr.context,
                "decision": adr.decision,
                "tradeoff": adr.tradeoff,
                "display_order": adr.display_order,
            }
            for adr in sorted(dossier.adrs, key=lambda item: item.display_order)
        ],
        "log": [
            {
                "hash": entry.commit_hash,
                "tag": entry.tag,
                "date": entry.date,
                "title": entry.title,
                "note": entry.note,
                "display_order": entry.display_order,
            }
            for entry in sorted(dossier.log_entries, key=lambda item: item.display_order)
        ],
        "diagrams": [
            {
                "id": diagram.identifier,
                "kind": diagram.kind,
                "title": diagram.title,
                "note": diagram.note,
                "data": diagram.data,
                "display_order": diagram.display_order,
            }
            for diagram in sorted(dossier.diagrams, key=lambda item: item.display_order)
        ],
        "gallery": [
            {
                "id": item.identifier,
                "src": item.source_url,
                "caption": item.caption,
                "hint": item.hint,
                "display_order": item.display_order,
            }
            for item in sorted(dossier.gallery_items, key=lambda item: item.display_order)
        ],
    }
    if include_sources:
        result["impact_en"] = dossier.impact_en
        result["impact_tr"] = dossier.impact_tr
    return result


def get_dossier_by_project_slug(
    db: Session,
    slug: str,
    language: str = "en",
) -> Optional[ProjectDossierResponse]:
    dossier = (
        _dossier_query(db)
        .join(Project, Project.id == ProjectDossier.project_id)
        .filter(Project.slug == slug)
        .first()
    )
    if not dossier:
        return None
    return ProjectDossierResponse.model_validate(_serialize_dossier(dossier, language))


def get_dossier_by_project_id(
    db: Session,
    project_id: uuid.UUID,
) -> Optional[AdminProjectDossierResponse]:
    dossier = _dossier_query(db).filter(ProjectDossier.project_id == project_id).first()
    if not dossier:
        return None
    return AdminProjectDossierResponse.model_validate(
        _serialize_dossier(dossier, include_sources=True)
    )


def upsert_dossier(
    db: Session,
    project_id: uuid.UUID,
    payload: ProjectDossierUpsert,
) -> AdminProjectDossierResponse:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise ValueError("Project not found")

    dossier = db.query(ProjectDossier).filter(ProjectDossier.project_id == project_id).first()
    try:
        if dossier is None:
            dossier = ProjectDossier(
                project_id=project_id,
                impact_en=payload.impact_en,
                impact_tr=payload.impact_tr,
            )
            db.add(dossier)
            db.flush()

        dossier.impact_en = payload.impact_en
        dossier.impact_tr = payload.impact_tr
        dossier.metrics = [
            DossierMetric(
                value=item.value,
                numeric_value=item.numeric_value,
                label=item.label,
                note=item.note,
                display_order=item.display_order,
            )
            for item in payload.metrics
        ]

        dossier.c4_levels = []
        for level_index, level_data in enumerate(payload.c4):
            level = DossierC4Level(
                label=level_data.label,
                note=level_data.note,
                display_order=level_data.display_order if level_data.display_order is not None else level_index,
            )
            for tier_index, tier in enumerate(level_data.tiers):
                for node_index, node_data in enumerate(tier):
                    level.nodes.append(
                        DossierC4Node(
                            kind=node_data.kind,
                            title=node_data.title,
                            sub=node_data.sub,
                            leaf=node_data.leaf,
                            tier_order=tier_index,
                            display_order=node_data.display_order if node_data.display_order is not None else node_index,
                        )
                    )
            dossier.c4_levels.append(level)

        dossier.adrs = [
            DossierAdr(
                identifier=item.id,
                title=item.title,
                status=item.status,
                date=item.date,
                context=item.context,
                decision=item.decision,
                tradeoff=item.tradeoff,
                display_order=item.display_order,
            )
            for item in payload.adrs
        ]
        dossier.log_entries = [
            DossierLogEntry(
                commit_hash=item.hash,
                tag=item.tag,
                date=item.date,
                title=item.title,
                note=item.note,
                display_order=item.display_order,
            )
            for item in payload.log
        ]
        dossier.diagrams = [
            DossierDiagram(
                identifier=item.id,
                kind=item.kind,
                title=item.title,
                note=item.note,
                data=item.data.model_dump(mode="json", by_alias=True),
                display_order=item.display_order,
            )
            for item in payload.diagrams
        ]
        dossier.gallery_items = [
            DossierGalleryItem(
                identifier=item.id,
                source_url=item.src,
                caption=item.caption,
                hint=item.hint,
                display_order=item.display_order,
            )
            for item in payload.gallery
        ]
        db.commit()
    except Exception:
        db.rollback()
        raise

    saved = get_dossier_by_project_id(db, project_id)
    if saved is None:
        raise RuntimeError("Dossier could not be reloaded after save")
    return saved


def delete_dossier(db: Session, project_id: uuid.UUID) -> bool:
    dossier = db.query(ProjectDossier).filter(ProjectDossier.project_id == project_id).first()
    if not dossier:
        return False
    try:
        db.delete(dossier)
        db.commit()
    except Exception:
        db.rollback()
        raise
    return True
