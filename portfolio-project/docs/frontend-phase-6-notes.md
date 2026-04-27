# Frontend Phase 6 Notes

Date: 2026-04-27

This note records the Phase 6 inventories and follow-up design decisions that are intentionally not large rewrites in this phase.

## Image Inventory

Raw image usage before this phase:

- `frontend/src/routes/Home.tsx`: profile image in the first viewport. This is the highest LCP-risk image.
- `frontend/src/routes/Admin.tsx`: project image manager thumbnails.

After the Phase 6 change, `rg '<img' src app` returns no runtime image elements. The two runtime image surfaces now use `next/image`.

`next.config.mjs` image configuration:

- Local images such as `/profile.jpg` need no remote pattern.
- Project upload URLs are expected to come from Supabase Storage, so the configured remote pattern is `https://**.supabase.co/storage/v1/object/public/**`.
- If another CDN is added later, add the narrowest host/path pattern before storing that URL in project image data.

## Admin Flow Map

`Admin.tsx` still owns the data and mutation flows:

- Shell context: auth user/logout, language, router, toast, API error handling.
- Shared state: stats, active tab, technology list, loading flags.
- Projects: list loading, create/edit/delete, image manager, upload progress, project translations.
- Skills: list loading, create/edit/delete modal flow.
- Experiences: list loading, create/edit/delete modal flow.
- Messages: list loading, mark-as-read/delete actions.

The first split is presentation-only:

- `components/admin/tabs/DashboardTab.tsx`
- `components/admin/tabs/ProjectsTab.tsx`
- `components/admin/tabs/SkillsTab.tsx`
- `components/admin/tabs/ExperiencesTab.tsx`
- `components/admin/tabs/MessagesTab.tsx`

Modal forms and mutation handlers remain in `Admin.tsx` for now. The next safe split is to move each tab's data-loading and mutations into tab-specific hooks after there is admin-route test coverage.

Repeated modal focus behavior moved to `src/lib/admin/useAdminModalFocusTrap.ts`. Date formatting moved to `src/lib/admin/format.ts`.

## `site.ts` Split Design

`src/content/site.ts` is still the compatibility entrypoint. Split it by domain behind that same barrel export so callers can migrate gradually:

1. Move shared types and helpers into `src/content/types.ts` and `src/content/localization.ts`.
2. Move `siteConfig`, locale constants, and keywords into `src/content/config.ts`.
3. Move `uiDictionaryDefinitions` into `src/content/i18n/ui.ts`.
4. Move route content into `src/content/home.ts`, `about.ts`, `contact.ts`, `projects.ts`, `seo.ts`, and `resume.ts`.
5. Keep `src/content/site.ts` as a re-export barrel until all imports are migrated.
6. Run `src/test/public-routes.ssr.test.tsx` after each domain move because it directly guards public copy rendering.

## Client Wrapper Strategy

Current simple wrappers:

- `HomeClient.tsx`
- `AboutClient.tsx`
- `ProjectsClient.tsx`
- `ContactClient.tsx`

They exist only to read `useLanguage()` and pass `locale` to route components. Do not remove them by converting all route components to broad client components. The safer strategy is:

1. Keep the wrappers until the App Router pages can read the locale cookie server-side without losing language-toggle persistence.
2. Introduce a single route-locale adapter only if it does not force every page component into the client bundle.
3. Migrate one public route at a time and keep JSON-LD/metadata generation server-owned.
4. Leave admin/auth routes separate because they already require client state.
