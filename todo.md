# K-APEX Onboarding Portal TODO

## Database & Schema
- [x] Define schema: onboarding_sessions, form_assignments, uploaded_documents, magic_links tables
- [x] Run migration SQL

## Backend / API
- [x] Salesperson: create onboarding session (customer email, type, form package)
- [x] Magic link generation (token generated, URL returned to salesperson)
- [x] Magic link validation (public procedure)
- [x] Customer: get assigned forms and current progress
- [x] Customer: save form field responses (partial/auto-save)
- [x] Customer: submit individual form with typed signature
- [x] Customer: upload supporting document (S3 storage)
- [x] Salesperson: list all onboarding sessions with status
- [x] Completion notification to owner when all forms submitted
- [x] Salesperson: regenerate magic link

## Frontend - Salesperson Portal
- [x] Dashboard layout with K-APEX branding (orange/grey)
- [x] Salesperson login via Manus OAuth
- [x] Dashboard: list of onboarding sessions with status badges and progress bars
- [x] New onboarding: 3-step wizard (customer info → package → confirm)
- [x] Form package selector: Importer / Exporter / Both / Custom
- [x] Magic link display with copy button after session creation
- [x] Session detail view: per-form completion status and routing info
- [x] Regenerate magic link from session detail

## Frontend - Customer Portal
- [x] Magic link landing page (token validation + error states)
- [x] Customer overview with sidebar showing all assigned forms and progress
- [x] Multi-step form wizard with progress bar
- [x] Credit Agreement & Application form (full fields)
- [x] Bank Authorization Release form
- [x] ISF Power of Attorney form (Importer)
- [x] FPPI Written Authorization form (Exporter)
- [x] Shipping Insurance Declaration form (accept/decline choice)
- [x] Typed "I agree" signature capture on each form
- [x] Auto-save on field change (debounced 1.5s)
- [x] Document upload widget for supporting files (PDF, JPG, PNG, DOC up to 10MB)
- [x] Completion confirmation screen

## Branding & Polish
- [x] Upload K-APEX logo to CDN
- [x] Apply orange (#E8601C) and grey color scheme globally via CSS variables
- [x] Dark sidebar with orange accent for salesperson portal
- [x] Form routing placeholder notices (where each form goes)
- [x] Responsive layout

## Testing
- [x] Vitest: onboarding session creation (8 tests passing)
- [x] Vitest: magic link validation
- [x] Vitest: form submission auth guards
- [x] Vitest: auth logout
