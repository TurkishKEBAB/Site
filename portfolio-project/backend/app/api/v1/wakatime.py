"""
WakaTime Integration Endpoints
Coding-activity stats for the home-page Command Center.
"""

from app.schemas.wakatime import WakaTimeStats
from app.services.wakatime_service import WakaTimeService
from fastapi import APIRouter, HTTPException, status

router = APIRouter()


@router.get("/stats", response_model=WakaTimeStats)
async def get_wakatime_stats():
    """
    Normalized WakaTime coding stats for the Command Center.
    Public, cached for the configured short refresh window; 503 when unavailable.
    """
    stats = await WakaTimeService().fetch_stats()
    if stats is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="WakaTime stats unavailable",
        )
    return stats
