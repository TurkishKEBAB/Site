"""Public reads and admin mutations for project dossiers."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_admin
from app.crud import dossier as dossier_crud
from app.models.user import User
from app.schemas.dossier import (AdminProjectDossierResponse,
                                 ProjectDossierResponse, ProjectDossierUpsert)
from app.services.admin_audit import record_admin_action

router = APIRouter()


@router.get("/projects/{project_id}", response_model=AdminProjectDossierResponse)
async def get_admin_dossier(
    project_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    dossier = dossier_crud.get_dossier_by_project_id(db, project_id)
    if not dossier:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dossier not found")
    return dossier


@router.put("/projects/{project_id}", response_model=AdminProjectDossierResponse)
async def save_admin_dossier(
    project_id: uuid.UUID,
    payload: ProjectDossierUpsert,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    existed = dossier_crud.get_dossier_by_project_id(db, project_id) is not None
    try:
        dossier = dossier_crud.upsert_dossier(db, project_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    record_admin_action(
        db,
        actor=current_user,
        action="project_dossier.update" if existed else "project_dossier.create",
        target_type="project_dossier",
        target_id=dossier.id,
        details={"project_id": str(project_id)},
    )
    return dossier


@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_admin_dossier(
    project_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    dossier = dossier_crud.get_dossier_by_project_id(db, project_id)
    if not dossier:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dossier not found")
    if not dossier_crud.delete_dossier(db, project_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dossier not found")
    record_admin_action(
        db,
        actor=current_user,
        action="project_dossier.delete",
        target_type="project_dossier",
        target_id=project_id,
        details={"project_id": str(project_id)},
    )
    return None


@router.get("/{project_slug}", response_model=ProjectDossierResponse)
async def get_public_dossier(
    project_slug: str,
    response: Response,
    language: str = Query("en", pattern="^(tr|en)$"),
    db: Session = Depends(get_db),
):
    dossier = dossier_crud.get_dossier_by_project_slug(db, project_slug, language)
    if not dossier:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dossier not found")
    response.headers["Cache-Control"] = "public, max-age=60, stale-while-revalidate=300"
    return dossier
