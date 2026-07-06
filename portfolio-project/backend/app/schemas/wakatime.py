"""
WakaTime Schemas
Normalized coding-activity stats for the home-page Command Center.
"""
from typing import List

from pydantic import BaseModel


class WakaTimeLanguage(BaseModel):
    """A single language slice in the weekly breakdown."""
    name: str
    percent: float


class WakaTimeStats(BaseModel):
    """Normalized WakaTime stats response."""
    all_time_seconds: int
    all_time_text: str
    last_7_days_seconds: int
    last_7_days_text: str
    daily_average_seconds: int
    daily_average_text: str
    languages: List[WakaTimeLanguage]
    range: str
