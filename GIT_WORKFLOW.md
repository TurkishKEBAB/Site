# Git Workflow

This document is the working standard for branch naming, commit messages, and history cleanup in this repository.

## Source Of Truth

- `main` is the only long-lived development base.
- Do not continue new work on `Codex_Implementation`.
- Treat `Codex_Implementation` as an archived integration branch that may contain useful commits but should not remain the active branch for daily development.

## Branch Naming

Use one of these formats:

- `feature/<area>-<short-topic>`
- `fix/<area>-<short-topic>`
- `refactor/<area>-<short-topic>`
- `chore/<area>-<short-topic>`
- `docs/<area>-<short-topic>`
- `test/<area>-<short-topic>`
- `ci/<area>-<short-topic>`
- `build/<area>-<short-topic>`

Examples:

- `feature/frontend-public-pages`
- `fix/backend-refresh-token`
- `chore/github-governance-automation`
- `ci/backend-quality-gate`

Rules:

- Use lowercase only.
- Use dashes, not spaces or underscores.
- Keep branch names task-scoped.
- One branch should solve one reviewable problem.

## Commit Convention

Use Conventional Commits.

Format:

```text
type(scope): short summary
```

Allowed types:

- `feat`
- `fix`
- `refactor`
- `chore`
- `docs`
- `test`
- `ci`
- `build`

Examples:

- `feat(frontend): add public projects page layout`
- `fix(auth): handle expired refresh token`
- `refactor(api): split github service helpers`
- `chore(github): add repository governance and triage automation`
- `test(backend): add regression coverage for admin projects`

Rules:

- Write commit messages in English.
- Keep the subject under roughly 72 characters when practical.
- Do not use vague summaries like `update`, `improve`, `misc`, or `cleanup` without context.
- One commit should represent one logical change.
- Split formatting, refactor, and behavior changes unless they are inseparable.

## Merge Strategy

- Open small PRs from `main`.
- Prefer `Squash and merge` for feature branches.
- Keep merge commits out of day-to-day feature work unless an integration branch is intentional.
- Do not stack unrelated work on one branch.

## Codex_Implementation Migration Plan

Current branch-specific commits on `Codex_Implementation`:

1. `8e20f68` `build(repo): clean baseline snapshot (squashed history)`
2. `600ca22` `chore(github): strengthen branch governance and PR automation`
3. `99607f2` `chore(github): add stale workflow, release drafter, and issue templates`

Recommended action:

1. Drop `8e20f68` from future work.
   Reason: it is a giant baseline snapshot commit, not a clean logical change, and it should not be preserved as an active development base.
2. Replace `600ca22` and `99607f2` with one clean commit on a fresh branch from `origin/main`.
   Replacement commit:
   `chore(github): add repository governance and triage automation`
3. Start all future work from `main` in fresh task branches.

## Clean Branches To Use

Use these branches instead of `Codex_Implementation`:

1. `chore/github-governance-automation`
   Purpose: GitHub governance, issue templates, release drafter, stale workflow, labeler, CODEOWNERS, and related repository process changes.
2. New branches from `main` for any additional work:
   - `feature/frontend-public-pages`
   - `fix/backend-auth-refresh`
   - `refactor/frontend-query-hooks`

## Daily Workflow Commands

Start new work:

```powershell
git switch main
git fetch origin
git reset --hard origin/main
git switch -c feature/<area>-<topic>
```

Commit work:

```powershell
git status
git add <files>
git commit -m "feat(scope): short summary"
```

Push a new branch:

```powershell
git push -u origin feature/<area>-<topic>
```

Update a feature branch safely:

```powershell
git fetch origin
git rebase origin/main
```

Open a clean replacement branch from an old commit set:

```powershell
git switch main
git fetch origin
git reset --hard origin/main
git switch -c chore/<area>-<topic>
git cherry-pick <commit>
```

Squash local commits before push if needed:

```powershell
git reset --soft origin/main
git commit -m "chore(scope): short summary"
```

## History Cleanup Rules

- Never rewrite shared branch history unless you explicitly intend to replace that branch.
- If a branch is already pushed and reviewed, prefer creating a clean replacement branch from `main`.
- Use `git push --force-with-lease` only when you are intentionally replacing your own remote branch and understand the impact.
- Do not continue work on branches that contain snapshot commits or mixed-topic integration history.

## Recommended Current Action

1. Keep `Codex_Implementation` unchanged as historical reference.
2. Continue GitHub automation work from `chore/github-governance-automation`.
3. Create all new implementation branches directly from `main`.
4. Use squash merge when merging those branches.