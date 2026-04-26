# Admin Authorization

Admin authorization is stored in the database on `users.is_admin`.

`ADMIN_EMAILS` is only a bootstrap input:

- Alembic migration `20260426_0002_admin_auth_audit_lockout` grants `is_admin=true` to existing users whose email is listed in `ADMIN_EMAILS` when the migration runs.
- `backend/create_admin.py` creates or resets admin users from `ADMIN_EMAILS` and sets `is_admin=true`.
- New users created through the admin registration endpoint become admins only if their email is listed in `ADMIN_EMAILS` at creation time.

After bootstrap, removing an email from `ADMIN_EMAILS` does not revoke admin access. Revoke admin access by updating the database:

```sql
UPDATE users SET is_admin = false WHERE lower(email) = lower('<admin-email>');
```

Grant admin access by updating the database or by running the bootstrap script with `ADMIN_EMAILS` and `ADMIN_BOOTSTRAP_PASSWORD` set:

```powershell
cd backend
$env:ADMIN_EMAILS="admin@example.com"
$env:ADMIN_BOOTSTRAP_PASSWORD="<temporary-secure-password>"
python create_admin.py
```

Critical admin mutations write compact records to `admin_action_logs` with actor, action, target, optional details, and timestamp.
