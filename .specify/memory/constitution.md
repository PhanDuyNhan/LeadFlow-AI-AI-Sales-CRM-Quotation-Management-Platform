<!--
## Sync Impact Report

### Version Change
- Previous: (none — initial ratification)
- New: 1.0.0

### Added Sections
- I. MVP-First Scope
- II. Technology Stack
- III. Security
- IV. Code Quality & Architecture
- V. UI/UX Standards
- VI. AI Integration Strategy
- VII. Testing Standards
- VIII. Deployment & Configuration
- Governance

### Modified Principles
- N/A (initial ratification)

### Removed Sections
- N/A (initial ratification)

### Templates Requiring Updates
- `.specify/templates/plan-template.md` ✅ updated — Option 2 paths changed from `backend/`+`frontend/` to `server/`+`client/`
- `.specify/templates/tasks-template.md` ✅ updated — Path Conventions updated from `backend/src/`+`frontend/src/` to `server/src/`+`client/src/`
- `.specify/templates/spec-template.md` ✅ no changes required — generic structure compatible

### Follow-up TODOs
- None. All fields fully resolved.
-->

# LeadFlow AI Constitution

## Core Principles

### I. MVP-First Scope

The MVP MUST include only the following features:
- Authentication (register, login, logout)
- Lead management (CRUD, status tracking)
- Quotation management (create, send, track)
- Follow-up tasks (create, assign, complete)
- Dashboard analytics (key metrics, charts)
- Rule-based or mock AI features (lead scoring, suggestions)

The following features MUST NOT be built during MVP:
- Real email integration (SMTP/SendGrid/etc.)
- SMS, Zalo, or WhatsApp automation
- Payment gateway integration
- Native mobile application (iOS/Android)
- Multi-tenant SaaS infrastructure
- Advanced drag-and-drop Kanban board

**Rationale**: Scope discipline prevents feature creep, keeps the initial build
focused, and ensures shippable value is delivered before investing in optional
capabilities.

### II. Technology Stack

The project MUST use the following stack exactly.

**Frontend** (`client/`):
- React with Vite as the build tool
- Tailwind CSS for styling
- React Router for client-side routing
- Axios for HTTP requests
- React Hook Form + Zod for form handling and validation
- Recharts for data visualization
- React Hot Toast for notifications

**Backend** (`server/`):
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication tokens
- bcrypt for password hashing
- dotenv for environment configuration
- cors and helmet for HTTP security headers

**Project Root Structure**:
- `client/` — all frontend source code
- `server/` — all backend source code

**Rationale**: A fixed stack eliminates technology decision overhead per feature
and ensures all contributors work from the same dependency baseline.

### III. Security

- Passwords MUST be hashed with bcrypt before storage. Plain-text passwords
  MUST NEVER be stored.
- All protected backend routes MUST require a valid JWT token.
- Password hash fields MUST NEVER be included in API responses to the frontend.
- All sensitive configuration values (database URIs, JWT secrets, API keys)
  MUST be stored in `.env` files and MUST NEVER be committed to version control.
- Admin and user roles MUST be enforced via middleware; role checks MUST NOT
  be handled solely in route handlers.

**Rationale**: Exposing password hashes or secrets in API responses or in source
control represents critical, irreversible security vulnerabilities.

### IV. Code Quality & Architecture

- Backend MUST use the layered architecture: controllers, services, models,
  routes, middleware, and validators.
- Business logic MUST reside in service files. Route handlers MUST NOT contain
  business logic directly.
- Frontend MUST use reusable component patterns; shared UI elements MUST NOT
  be duplicated across pages.
- All API responses MUST conform to one of two standard shapes:
  - Success: `{ success: true, message: string, data: any }`
  - Error: `{ success: false, message: string, errors?: any }`

**Rationale**: Consistent layering makes services independently testable and
prevents response shape divergence across endpoints, which breaks API consumers.

### V. UI/UX Standards

- The UI MUST follow a clean, modern SaaS dashboard aesthetic.
- Every page MUST use appropriate combinations of: sidebar navigation, header,
  card components, data tables, forms, badges, modals, loading states, empty
  states, and toast notifications.
- All layouts MUST be responsive and functional on desktop, tablet, and mobile
  viewports.

**Rationale**: Consistent UI components and responsive design ensure a
professional product experience across devices from the first release.

### VI. AI Integration Strategy

- MVP AI features MUST use rule-based logic or mock/static data. No live
  external AI API calls are required or permitted for MVP.
- All AI logic MUST be isolated within a dedicated AI service module so that
  the underlying implementation can be swapped (e.g., to OpenAI or Claude API)
  without changes to any calling code.

**Rationale**: Isolation future-proofs the AI layer. Mocking in MVP avoids
cost and API dependency while preserving the integration interface intact.

### VII. Testing Standards

- Each implemented feature MUST include documented manual test steps.
- All API endpoints MUST be verifiable using Postman or Thunder Client, with
  documented request/response examples.

**Rationale**: Manual test steps and API documentation serve as the minimum
quality gate, ensuring every endpoint is independently verifiable without
requiring an automated test framework in MVP.

### VIII. Deployment & Configuration

- Frontend MUST deploy to Vercel.
- Backend MUST deploy to Render or Railway.
- Database MUST use MongoDB Atlas (cloud-hosted).
- The repository MUST include a `.env.example` file listing all required
  environment variables with placeholder values.
- The repository MUST include a `README.md` documenting setup, local
  development, and deployment steps.

**Rationale**: A defined deployment target prevents environment drift and
ensures the project is runnable by any contributor from a documented baseline.

## Governance

This constitution supersedes all other project practices. Any feature or
implementation choice that conflicts with a principle herein MUST be escalated
before proceeding — not silently worked around.

**Amendment procedure**:
1. Propose the change in a PR with a written rationale.
2. The amendment MUST reference which principle is affected and why the change
   is necessary.
3. Version MUST be bumped per semantic versioning:
   - MAJOR: principle removal or backward-incompatible redefinition
   - MINOR: new principle or material scope expansion
   - PATCH: clarifications, wording, or non-semantic refinements
4. `LAST_AMENDED_DATE` MUST be updated on every merge.

**Compliance**: All PRs MUST be reviewed against this constitution before
merge. Deviations from Principles I–VIII MUST be justified in writing in the
PR description and captured in the plan's Complexity Tracking table.

**Runtime guidance**: See `CLAUDE.md` for agent-specific development guidance.

**Version**: 1.0.0 | **Ratified**: 2026-05-26 | **Last Amended**: 2026-05-26
