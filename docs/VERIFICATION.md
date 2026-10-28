# Upgrade verification — 28 October 2026

Production: https://akaa.dev. Implementation merged in PR #2:
https://github.com/akaanakbaik/portofoliov2/pull/2

## Verified behavior

- TypeScript and production builds pass on Node 24.
- 20 backend/routing/SMTP tests and 8 desktop/mobile Playwright tests pass.
- GitHub Actions repeats build, type checking, backend tests, browser tests and
  dependency auditing. The implementation's final PR checks passed before merge.
- npm audit reports zero known vulnerabilities, including development dependencies.
- Real Supabase integration verifies shared settings, optimistic write conflicts,
  publication history and contact message persistence/read/delete. Temporary
  contact fixtures were removed. Password-change tests use isolated fixtures and
  do not change the owner's production password.
- Every AdminDashboard tab was checked at 1440px and 390px widths in dark and
  light themes. Automated WCAG A/AA checks found no violations in the inspected
  states. Keyboard focus trapping, Escape dismissal, restored focus, form
  validation, preview and publication were exercised. This is tested coverage,
  not a claim of complete WCAG certification.
- Production homepage returns full HTML containing the profile, projects,
  canonical metadata and a Person/ProfilePage/WebSite graph. Content remains
  readable with JavaScript disabled and has one H1. Production has no noindex
  header; admin, private preview and unknown pages do. Unknown pages return 404.
- robots.txt, sitemap.xml and the 1200x630 OG image return the expected types.
- SMTP credentials/TLS handshake verification succeeds without sending test mail.
  Fixture tests cover successful delivery, failure/retry, escaping and queueing.
- Cron rejects missing/invalid credentials. An authorized request queries real
  data and persists the successful run. Production configuration schedules it
  Monday and Thursday at 03:00 UTC / 10:00 WIB. Provider pause decisions remain
  outside the application's control.
- Initial client JS is approximately 465 KB uncompressed / 152 KB gzip at build.
  Individual technology SVGs replace the browser's large icon catalog. Six
  unchanged project thumbnails were reduced from 2,087,727 to 122,348 bytes.
- The Supabase gateway is guarded by an application-scoped random token stored
  only on the host; its SHA256 hash is private. Tables have RLS and no direct
  public access. Legacy analytics/cron RPC permissions were revoked after the
  production deployment was verified. The definer gateway remains callable at
  the SQL role level but rejects callers without its backend credential; the
  corresponding advisor notices are expected for this guarded entry point.

## Search Console and operational limits

Firecrawl's SEO Audit skill and the connected Windsor.ai Search Console skill
were used. The connected property is `sc-domain:akaa.dev`. Available recent data
contained downloader-related queries and did not establish portfolio rankings.
Windsor's Search Console connector is read-only: no sitemap submission or Google
indexing request was performed, and no ranking position is guaranteed.

Published content revisions support rollback; they are not a database backup.
Provider backups/PITR depend on the Supabase plan and should be checked before
future destructive changes. No unrelated application tables or policies were
changed. SMTP retries are at-least-once and can duplicate a delivery after an
interrupted acknowledgement; a stable Message-ID is used.
