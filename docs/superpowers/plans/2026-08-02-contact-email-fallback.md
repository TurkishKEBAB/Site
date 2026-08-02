# Contact Email Fallback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the database-backed admin inbox the reliable destination for valid contact submissions while keeping SMTP optional and improving admin visibility.

**Architecture:** The contact endpoint commits a `ContactMessage` before attempting two independent, best-effort SMTP notifications. SMTP credentials become optional; the response reports storage success and combined notification status. The existing authenticated admin contact API remains the source for a richer admin table that displays the full message and an encoded reply link.

**Tech Stack:** FastAPI, Pydantic v2, SQLAlchemy, aiosmtplib, pytest, Next.js App Router, React, TypeScript, Vitest, Testing Library.

## Global Constraints

- Never bypass CAPTCHA when `CAPTCHA_ENABLED` is true.
- Never expose SMTP credentials or client IP/user-agent values in the public response.
- Preserve the existing admin authentication dependency and contact rate limit.
- Use existing PostgreSQL `contact_messages` storage; do not add a paid provider or a new persistence service.
- Write the failing test before each production behavior change and run the smallest relevant test command before implementation.
- Keep backend and frontend behavior commits separate unless a generated API contract must change with both.
- Use Conventional Commits with English subjects.

---

### Task 1: Store valid contact submissions independently of SMTP

**Files:**
- Modify: `portfolio-project/backend/app/schemas/contact.py` (`ContactMessageBase`, `ContactMessageResponse`)
- Modify: `portfolio-project/backend/app/api/v1/contact.py` (`submit_contact_message`)
- Test: `portfolio-project/backend/tests/test_contact_messages.py`

**Interfaces:**
- `ContactMessageBase.subject` accepts the frontend's existing optional-subject behavior and normalizes the default to an empty string.
- `ContactMessageResponse` adds `email_sent: bool` while retaining `success`, `message`, and `message_id`.
- `submit_contact_message` returns `email_sent=False` when either notification is unavailable or fails, without rolling back the committed message.

- [ ] **Step 1: Write the failing backend regression tests**

Add `import pytest` if the module does not already import it, then add these
tests to `backend/tests/test_contact_messages.py` using the existing pytest
`monkeypatch` fixture:

```python
def test_submit_contact_message_allows_blank_subject_and_stores_message(
    client, admin_headers, monkeypatch
):
    class DummyEmailService:
        async def send_contact_form_confirmation(self, **kwargs):
            return False

        async def send_admin_notification(self, **kwargs):
            return False

    monkeypatch.setattr("app.api.v1.contact.EmailService", DummyEmailService)
    response = client.post(
        "/api/v1/contact/",
        json={
            "name": "Blank Subject",
            "email": "blank@example.com",
            "subject": "",
            "message": "This message must appear in the admin inbox.",
        },
    )
    assert response.status_code == 201
    assert response.json()["email_sent"] is False

    messages = client.get("/api/v1/contact/", headers=admin_headers)
    assert messages.status_code == 200
    assert messages.json()["total"] == 1
    assert messages.json()["messages"][0]["email"] == "blank@example.com"
    assert messages.json()["messages"][0]["message"] == (
        "This message must appear in the admin inbox."
    )


def test_submit_contact_message_reports_smtp_success(client, monkeypatch):
    class DummyEmailService:
        async def send_contact_form_confirmation(self, **kwargs):
            return True

        async def send_admin_notification(self, **kwargs):
            return True

    monkeypatch.setattr("app.api.v1.contact.EmailService", DummyEmailService)

    response = client.post(
        "/api/v1/contact/",
        json={
            "name": "Delivered User",
            "email": "delivered@example.com",
            "subject": "Delivery",
            "message": "Both notification messages should report success.",
        },
    )

    assert response.status_code == 201
    assert response.json()["email_sent"] is True
```

- [ ] **Step 2: Run the tests and confirm the expected red failure**

Run from `portfolio-project/`:

```powershell
$env:PYTHONPATH='backend'; python -m pytest backend/tests/test_contact_messages.py -q -o addopts=''
```

Expected: the blank-subject request returns `422`, and the current response does not contain `email_sent`.

- [ ] **Step 3: Implement the smallest backend contract change**

In `schemas/contact.py`, change the subject field to:

```python
subject: str = Field(default="", max_length=500)
```

Add this response field:

```python
email_sent: bool
```

In `api/v1/contact.py`, commit the message before delivery as it already does, then attempt both notification methods independently. Track `email_sent` as true only when both methods return true; catch and log exceptions per notification so an exception in the confirmation path cannot prevent the admin notification attempt. Return:

```python
{
    "success": True,
    "message": "Your message has been received and is visible in the admin panel.",
    "message_id": message.id,
    "email_sent": email_sent,
}
```

- [ ] **Step 4: Run the focused backend tests and confirm green**

Run:

```powershell
$env:PYTHONPATH='backend'; python -m pytest backend/tests/test_contact_messages.py -q -o addopts=''
```

Expected: all contact endpoint tests pass, including the two new tests.

- [ ] **Step 5: Commit the backend persistence contract**

```powershell
git add portfolio-project/backend/app/schemas/contact.py portfolio-project/backend/app/api/v1/contact.py portfolio-project/backend/tests/test_contact_messages.py
git commit -m "fix(backend): persist contact submissions without smtp"
```

### Task 2: Make SMTP delivery optional and observable in logs

**Files:**
- Modify: `portfolio-project/backend/app/config.py` (`Settings.SMTP_USERNAME`, `Settings.SMTP_PASSWORD`)
- Modify: `portfolio-project/backend/app/services/email_service.py` (`EmailService.send_email`)
- Modify: `portfolio-project/backend/.env.example`
- Modify: `portfolio-project/backend/README.md`
- Modify: `portfolio-project/CI_CD_SETUP.md`
- Test: `portfolio-project/backend/tests/test_email_service.py` (create if absent)

**Interfaces:**
- `Settings.SMTP_USERNAME` and `Settings.SMTP_PASSWORD` are `Optional[str]` with `None` defaults.
- `EmailService.send_email(...) -> bool` returns `False` with a warning when credentials are incomplete, without calling `aiosmtplib.send`.

- [ ] **Step 1: Write the failing service test**

Create `backend/tests/test_email_service.py`:

```python
import pytest

from app.services.email_service import EmailService


@pytest.mark.asyncio
async def test_send_email_skips_smtp_when_credentials_are_missing(monkeypatch):
    monkeypatch.setattr("app.services.email_service.settings.SMTP_USERNAME", None)
    monkeypatch.setattr("app.services.email_service.settings.SMTP_PASSWORD", None)

    calls = 0

    async def fail_if_called(*args, **kwargs):
        nonlocal calls
        calls += 1
        raise AssertionError("SMTP must not be called without credentials")

    monkeypatch.setattr("app.services.email_service.aiosmtplib.send", fail_if_called)

    result = await EmailService().send_email(
        to_email="recipient@example.com",
        subject="Subject",
        body="Body",
    )

    assert result is False
    assert calls == 0
```

- [ ] **Step 2: Run the new test and confirm it fails**

```powershell
$env:PYTHONPATH='backend'; python -m pytest backend/tests/test_email_service.py -q -o addopts=''
```

Expected: the current implementation attempts SMTP with missing credentials instead of returning early.

- [ ] **Step 3: Implement optional SMTP configuration**

Use `Optional[str] = None` for both SMTP credential settings. At the beginning of `EmailService.send_email`, before constructing the MIME message or calling `aiosmtplib.send`, add:

```python
if not self.smtp_username or not self.smtp_password:
    logger.warning("SMTP notifications are disabled because credentials are missing")
    return False
```

Keep the existing exception handling and return value contract. Update `.env.example` and `CI_CD_SETUP.md` to state that SMTP is optional and the admin inbox remains available without it; do not include any real credential value.

- [ ] **Step 4: Run service and endpoint tests**

```powershell
$env:PYTHONPATH='backend'; python -m pytest backend/tests/test_email_service.py backend/tests/test_contact_messages.py -q -o addopts=''
```

Expected: all selected tests pass and no SMTP call is made without credentials.

- [ ] **Step 5: Commit the optional SMTP behavior**

```powershell
git add portfolio-project/backend/app/config.py portfolio-project/backend/app/services/email_service.py portfolio-project/backend/.env.example portfolio-project/CI_CD_SETUP.md portfolio-project/backend/tests/test_email_service.py
git commit -m "fix(backend): make smtp delivery optional"
```

### Task 3: Show full contact messages and reply actions in the admin panel

**Files:**
- Modify: `portfolio-project/frontend/src/components/admin/types.ts` (`AdminCopy`)
- Modify: `portfolio-project/frontend/src/routes/Admin.tsx` (localized `message` and `reply` labels)
- Modify: `portfolio-project/frontend/src/components/admin/tabs/MessagesTab.tsx`
- Modify: `portfolio-project/frontend/src/components/admin/tabs/AdminTabs.test.tsx`

**Interfaces:**
- `MessagesTab` receives `text.message` and `text.reply` in addition to its current labels.
- Each message row renders the full `message.message` with preserved line breaks and a `mailto:<sender>` link whose subject and body are URL-encoded.

- [ ] **Step 1: Write the failing admin rendering test**

In the existing message-tab test, add a multiline message and assert the body and reply link:

```tsx
expect(screen.getByText(/Hello\s+Please reply with next steps\./)).toBeInTheDocument();
const graceRow = screen.getByText("Grace").closest("tr");
expect(within(graceRow as HTMLTableRowElement).getByRole("link", { name: "Reply" })).toHaveAttribute(
  "href",
  expect.stringContaining("mailto:grace@example.com?subject=Re%3A%20Platform"),
);
```

Add `message: "Message"` and `reply: "Reply"` to `messageText` so the test matches the expanded component contract. Run the focused test before implementing the UI and confirm the reply link is missing.

- [ ] **Step 2: Implement the minimal admin UI**

Add `message` and `reply` to `AdminCopy`, provide Turkish and English values in `Admin.tsx`, and extend `MessagesTab` to render a message column. Build the reply URL from the current message:

```tsx
const replySubject = message.subject ? `Re: ${message.subject}` : "Re: Portfolio contact";
const replyBody = `\n\n--- Original message ---\n${message.message}`;
const replyHref = `mailto:${message.email}?subject=${encodeURIComponent(replySubject)}&body=${encodeURIComponent(replyBody)}`;
```

Render the body in a `whitespace-pre-wrap` container and the reply anchor beside it. Keep the existing read/delete actions and admin-only API flow unchanged.

- [ ] **Step 3: Run the focused admin tests**

```powershell
npm run test -- --run src/components/admin/tabs/AdminTabs.test.tsx
```

Expected: all admin tab tests pass and the new body/reply assertions are green.

- [ ] **Step 4: Commit the admin inbox UI**

```powershell
git add portfolio-project/frontend/src/components/admin/types.ts portfolio-project/frontend/src/routes/Admin.tsx portfolio-project/frontend/src/components/admin/tabs/MessagesTab.tsx portfolio-project/frontend/src/components/admin/tabs/AdminTabs.test.tsx
git commit -m "feat(frontend): show contact details in admin inbox"
```

### Task 4: Align frontend response types and generated API contracts

**Files:**
- Modify: `portfolio-project/frontend/src/services/contactService.ts` (`ContactSubmitResponse`)
- Regenerate: `portfolio-project/backend/openapi.json`
- Regenerate: `portfolio-project/frontend/src/services/apiTypes.generated.ts`

**Interfaces:**
- `ContactSubmitResponse.email_sent` is a required boolean matching the backend response schema.

- [ ] **Step 1: Write the type-level expectation**

Create `frontend/src/services/contactService.test.ts` with this compile-time
expectation so a successful response includes `email_sent`:

```ts
import { describe, expect, it } from "vitest";

import type { ContactSubmitResponse } from "./contactService";

describe("contact service contract", () => {
  it("includes SMTP delivery status in a submit response", () => {
    const response: ContactSubmitResponse = {
      success: true,
      message: "Received",
      message_id: "message-1",
      email_sent: false,
    };

    expect(response.email_sent).toBe(false);
  });
});
```

- [ ] **Step 2: Run the type-level test and confirm it fails before the interface change**

Run from `frontend/`:

```powershell
npm run test -- --run src/services/contactService.test.ts
```

Expected: TypeScript reports that `email_sent` is not part of `ContactSubmitResponse`.

- [ ] **Step 3: Update the service interface and regenerate contracts**

Add `email_sent: boolean` to `ContactSubmitResponse`, then run from `portfolio-project/`:

```powershell
$env:PYTHONPATH='backend'; python backend/scripts/export_openapi.py --output backend/openapi.json
Set-Location frontend
npm run gen:api
```

- [ ] **Step 4: Verify no generated drift remains**

```powershell
Set-Location ..
$env:PYTHONPATH='backend'; python backend/scripts/export_openapi.py --output backend/openapi.json
git diff --exit-code -- backend/openapi.json
Set-Location frontend
npm run check:api-types
```

Expected: both commands exit 0 without changing generated files after the first generation.

- [ ] **Step 5: Commit the API contract alignment**

```powershell
git add portfolio-project/frontend/src/services/contactService.ts portfolio-project/frontend/src/services/contactService.test.ts portfolio-project/backend/openapi.json portfolio-project/frontend/src/services/apiTypes.generated.ts
git commit -m "chore(api): refresh contact response contract"
```

### Task 5: Run full verification and audit the requested behavior

**Files:**
- No production files; inspect the final diff and test artifacts.

- [ ] **Step 1: Run backend quality verification**

```powershell
Set-Location portfolio-project
$env:PYTHONPATH='backend'; python -m pytest -q
```

Expected: exit code 0 and coverage remains at or above the repository's configured threshold.

- [ ] **Step 2: Run frontend quality verification**

```powershell
Set-Location frontend
npm run lint
npm run type-check
npm run test
npm run build
```

Expected: each command exits 0 with no lint errors, type errors, test failures, or build failures.

- [ ] **Step 3: Review the final diff and worktree**

```powershell
Set-Location ..\..
git diff origin/main...HEAD --check
git status --short --branch
git log --oneline --decorate -6
```

Confirm that valid submissions are stored before optional SMTP, blank subjects are accepted, CAPTCHA failures still reject before storage, admin users can see sender/email/full body, and the reply link targets the sender.

- [ ] **Step 4: Commit no additional unrelated changes**

Leave the user’s original `feature/frontend-cv-about` worktree untouched. Report the isolated branch, commits, test evidence, and any external deployment environment variables still required for production.
