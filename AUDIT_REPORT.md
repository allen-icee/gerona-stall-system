# Conservative Codebase Audit Report

## Executive Summary

This project is a Laravel 13 + Inertia React stall management system for Gerona market operations. It manages buildings, floors, stalls, tenants, stall assignments/contracts, payments, penalties, reports, Excel imports/exports, and an Electron-oriented LAN client.

Overall assessment: the application is workable and organized around familiar Laravel conventions, but it had several stability issues in payment persistence, penalty processing, route exposure, migration rollback/test compatibility, and validation of bulk actions. The most important security concerns are operational rather than exotic: default seeded credentials and SQL backup handling.

Risk level: Medium.

Issues found: 25.

Issues fixed: 18.

Validation status: PHP syntax checks passed, route compilation passed, frontend production build passed, and the Laravel test suite passes with 25 tests and 61 assertions.

## Project Understanding

Purpose: internal/LAN municipal stall ledger and market administration system.

Main architecture: Laravel MVC backend with Breeze-style authentication, Spatie permissions, Sanctum API token login, Eloquent models, Excel imports/exports, and Inertia-rendered React pages built by Vite.

Key modules: auth/user management, facilities, tenants, contracts, payments, penalties, layouts/mapper, dashboard, reports, imports, and exports.

Application flow: authenticated users enter through web routes, role permissions gate each operational module, controllers validate requests, Eloquent models persist data, and React/Inertia pages render CRUD tables, modals, and print/report views.

Data flow: database records are created through forms and bulk Excel imports; payment and penalty data feeds contract computed attributes, dashboards, reports, ledger exports, and receipt printing.

Dependencies: Laravel, Inertia, Sanctum, Spatie Permission, Maatwebsite Excel/PhpSpreadsheet, React, Vite, Tailwind, Iconify, lucide-react, Recharts, Zustand, and related frontend tooling.

Primary technical debt: duplicated import/export query logic, sparse domain tests, some unused service classes, frontend/package version drift, tracked SQL backup dumps, and business state fields referenced by old code that are no longer in the schema.

## Changes Made

### `.gitignore`

Issue: SQL backup dumps were not ignored, increasing the chance of future sensitive data leakage.

Fix applied: added `/backups/*.sql`.

Reason: prevent new database dumps from being accidentally committed.

Risk level: Low.

### `app/Models/Payment.php`

Issue: `payment_type` was not mass assignable, so stored and updated payments silently fell back to the database default `rent`.

Fix applied: added `payment_type` to `$fillable` and cast `month` and `year` to integers.

Reason: preserve rent/deposit/violation payment type and keep payment coverage values consistent.

Risk level: Low.

### `app/Http/Controllers/PaymentController.php`

Issue: payment forms send month names while validation expected integers; non-rent payments could pass nullable month/year validation even though the current schema requires non-null values.

Fix applied: normalized month names to integers before validation and defaulted missing coverage month/year from `payment_date`.

Reason: prevent failed submissions and inconsistent payment data.

Risk level: Low.

### `app/Imports/PaymentsImport.php`

Issue: imported payments stored full uppercase month names into an integer column pattern and did not persist payment type.

Fix applied: normalized imported month values, validated payment type, and persisted `payment_type`.

Reason: keep imported payments compatible with reports, filters, and contract ledger calculations.

Risk level: Low.

### `app/Http/Controllers/PenaltyController.php`

Issue: `penalties.process` routed to a missing controller method, causing a runtime failure from the existing UI.

Fix applied: added `process()` using the existing `PenaltyService`, with validation for approved/waived reviews.

Reason: restore the penalty review workflow.

Risk level: Low.

Issue: the penalty status filter UI sent `status`, but the controller ignored it.

Fix applied: applied `status` filtering and returned status in filters.

Reason: make the existing review-board tabs behave as intended.

Risk level: Low.

### `app/Http/Controllers/StallController.php`

Issue: quick status accepted arbitrary status values.

Fix applied: added an allowlist validation rule.

Reason: prevent unsupported state transitions from no-op or partial updates.

Risk level: Low.

Issue: bulk update/delete only validated that `ids` was an array.

Fix applied: validated each ID as an existing stall ID and validated numeric bulk update fields.

Reason: reduce accidental bad input and invalid batch operations.

Risk level: Low.

### `routes/api.php`

Issue: API token login had no throttling, unlike web login.

Fix applied: added `throttle:5,1` to `api/login`.

Reason: reduce realistic LAN brute-force risk.

Risk level: Low.

### `routes/web.php`

Issue: `Route::resource('payments')` exposed `create`, `show`, and `edit` routes without matching controller methods.

Fix applied: excluded those invalid resource actions.

Reason: avoid runtime errors on dead routes while preserving existing payment index/store/update/delete/print/export/import flows.

Risk level: Low.

### `app/Http/Requests/Auth/LoginRequest.php`

Issue: auth tests and some default Laravel flows submitted `email`, while the app only accepted `username`.

Fix applied: allowed either username or email and selected the matching auth field.

Reason: preserve username login while adding backwards-compatible email login.

Risk level: Low.

### `app/Http/Controllers/Auth/RegisteredUserController.php`

Issue: registration created users without `username`, but the database requires a unique username.

Fix applied: accepted optional username and generated a unique username from email when omitted.

Reason: keep registration functional without changing the visible login workflow.

Risk level: Low.

### `database/migrations/2026_05_09_141521_fix_layout_cells_table.php`

Issue: migration used MySQL-only `DELETE ... INNER JOIN`, breaking SQLite test migrations.

Fix applied: replaced duplicate cleanup with a portable `DELETE ... NOT IN (SELECT MIN(...))` statement.

Reason: make migrations compatible with the configured test suite.

Risk level: Low.

### `database/migrations/2026_03_30_075830_create_system_controls_tables.php`

Issue: rollback dropped a non-existent table name.

Fix applied: rollback now drops `audit_logs` and `feature_flags`.

Reason: make rollback accurate.

Risk level: Low.

### `database/migrations/2026_03_30_075830_create_dynamic_fields_tables.php`

Issue: rollback dropped a non-existent table name.

Fix applied: rollback now drops `field_values` and `field_definitions`.

Reason: make rollback accurate and respect foreign-key order.

Risk level: Low.

## Issues Not Automatically Fixed

Description: seeded default users use predictable passwords in `database/seeders/RoleAndUserSeeder.php`.

Impact: if these users exist in production or are re-seeded without rotation, accounts are easy to compromise.

Recommended action: replace seed defaults with environment-provided temporary passwords, force password rotation, or disable seeded users outside local setup.

Description: historical SQL backups are already tracked in `backups/`.

Impact: database dumps may contain personal, financial, or operational data.

Recommended action: review whether tracked backups should be removed from Git history and stored in a controlled backup location.

Description: `vite.config.ts` has a pre-existing local HMR IP change from `192.168.100.7` to `192.168.100.238`.

Impact: local development may depend on one workstation/network address.

Recommended action: prefer environment-specific `VITE_HMR_HOST` rather than committed IP churn.

Description: `ContractService`, `PaymentService`, and `PenaltyService` are only partially used.

Impact: duplicate business paths may diverge.

Recommended action: either route controllers consistently through services or remove unused service methods after confirming no external callers.

Description: stale contract fields such as `permit_status`, `document_status`, and `security_deposit` appear in older code paths but not in the current contracts schema.

Impact: future use of those paths may silently ignore data or fail.

Recommended action: review desired contract schema and remove stale references or add intentional migrations.

Description: package metadata contains React 18 in `devDependencies` and React 19 in `dependencies`.

Impact: dependency resolution can become confusing and future installs may behave differently.

Recommended action: align frontend dependency versions in a dedicated dependency maintenance PR.

Description: imports still rely heavily on implicit spreadsheet formats.

Impact: malformed spreadsheets can create surprising records even with the improved validation.

Recommended action: add focused import tests and stricter per-column validation.

## Security Findings

Finding: predictable seeded credentials.

Severity: High.

Remediation performed: documented only; changing operational credentials automatically could lock users out or disrupt setup.

Remaining concern: existing deployments may still have the seeded accounts and passwords.

Finding: SQL backups in the repository.

Severity: High if backups contain production or personal data; Medium otherwise.

Remediation performed: future SQL backups are now ignored.

Remaining concern: already tracked backups still need human review.

Finding: API login lacked throttling.

Severity: Medium.

Remediation performed: added `throttle:5,1`.

Remaining concern: token lifetime and device management should be reviewed if the Electron client is widely shared.

Finding: invalid or weak validation on bulk stall actions and quick status.

Severity: Medium.

Remediation performed: added allowlist and per-ID/per-field validation.

Remaining concern: destructive stall deletion still cascades related payments/contracts and should remain restricted to trusted roles.

Finding: payment type was silently ignored.

Severity: Medium.

Remediation performed: added mass assignment support and import handling.

Remaining concern: existing historical payments may already have incorrect `payment_type` values and may need data cleanup.

## Technical Debt

The stall index/export path loads and sorts all matching stalls in memory for natural sorting. This is acceptable for small LAN datasets but may slow down as records grow.

Import/export implementations are repeated across controllers. A future refactor could extract small shared helpers, but this was intentionally not done during the stability audit.

Tests mostly cover default auth scaffolding and not the domain modules. Add focused tests for payments, imports, penalties, bulk stall actions, reports, and migration rollback.

Several frontend files contain mojibake text such as broken peso signs and comment markers. This should be cleaned carefully in a UI/text pass, not mixed into backend stability work.

Some route/controller methods exist without routes, such as manual penalty `store` and `destroy`. Confirm whether those workflows are planned or dead code.

Audit logging tables exist, but controllers do not appear to write audit records for sensitive actions. Consider adding audit logs for payments, user management, imports, and destructive stall operations.

## Validation

PHP syntax checks: passed for all touched PHP files.

Route compilation: `php artisan route:list` passed and now shows 86 routes.

Tests: `php artisan test` passed with 25 tests and 61 assertions.

Frontend build: `npm run build` passed.

Type checking: no dedicated type-check script is configured in `package.json`.

Linting: no dedicated npm lint script is configured; Laravel Pint is installed but not configured as a Composer script.

Application start: route compilation and build passed; no long-running dev server was started for this audit.

## Final Summary

Files modified: `.gitignore`, `routes/api.php`, `routes/web.php`, `app/Models/Payment.php`, `app/Http/Controllers/PaymentController.php`, `app/Imports/PaymentsImport.php`, `app/Http/Controllers/PenaltyController.php`, `app/Http/Controllers/StallController.php`, `app/Http/Requests/Auth/LoginRequest.php`, `app/Http/Controllers/Auth/RegisteredUserController.php`, and three migration files.

Files added: `AUDIT_REPORT.md`.

Files removed: none.

Total fixes applied: 18.

Remaining recommendations: rotate/rework seeded credentials, review tracked SQL backups, align package versions, expand domain tests, clarify stale contract fields, rationalize service/controller duplication, and add audit logging for sensitive workflows.

Note: `vite.config.ts` originally had a pre-existing hardcoded LAN HMR IP change. The LAN hosting addendum replaced that brittle fallback with runtime `VITE_HMR_HOST` detection.

## LAN Hosting Addendum

Municipal workstation IPv4 addresses are dynamic, so hardcoding a LAN IP in application config is brittle.

Change made: added `scripts/Get-LanIp.ps1` to detect the current server computer IPv4 address at startup.

Change made: updated `Start-Dev.bat` and `Start-Prod.bat` to set `APP_URL=http://CURRENT_IP:8000` at runtime and print the staff-facing LAN URL.

Change made: updated development startup so Laravel is not launched twice; `Start-Dev.bat` starts Laravel directly and then runs `npm run dev:vite` for Vite only.

Change made: removed the hardcoded Vite HMR fallback IP from `vite.config.ts`; development startup now supplies `VITE_HMR_HOST` dynamically.

Change made: documented optional `VITE_HMR_HOST` behavior in `.env.example`.

How to use: run `Start-Prod.bat` on the server computer. Staff should open the printed `Staff LAN URL`, for example `http://192.168.100.238:8000`. If the IP changes the next day, restart the batch file and use the newly printed URL.
