"""Seed data security regression tests."""

import pytest
from app.models.user import User
from seed_data import seed_admin_user


def test_seed_admin_user_requires_explicit_password(
    db_session,
    monkeypatch,
    capsys,
):
    monkeypatch.delenv("SEED_ADMIN_PASSWORD", raising=False)

    with pytest.raises(RuntimeError, match="SEED_ADMIN_PASSWORD is required"):
        seed_admin_user(db_session)

    captured = capsys.readouterr()
    assert "Generated seed admin password" not in captured.out
    assert db_session.query(User).count() == 0


def test_seed_admin_user_uses_environment_password(db_session, monkeypatch):
    monkeypatch.setenv("SEED_ADMIN_PASSWORD", "explicit-seed-password")

    user = seed_admin_user(db_session)

    assert user.email == "yigitokur@ieee.org"
    assert db_session.query(User).count() == 1
