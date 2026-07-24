# ADR 0002: Monorepo Foundation

- Status: Accepted
- Date: 2026-07-23

## Context

The repository currently contains product architecture docs but no application scaffold. The next decision is how to organize Flutter, backend, admin, shared libraries, authored content, and infrastructure code so each can evolve independently without fragmenting the product.

## Decision

Adopt a polyglot monorepo with these top-level boundaries:

- `apps/mobile` for the Flutter client
- `apps/api` for the NestJS backend
- `apps/admin` for the internal or coach-facing admin portal
- `packages/*` for reusable Dart and Flutter libraries
- `content/traps` for authored, versioned trap files
- `infra/*` for local containers and cloud infrastructure

Use `melos` for Dart and Flutter workspace orchestration and npm workspaces for Node applications.

## Rationale

- Flutter packages need workspace-aware dependency management and shared commands.
- Backend and admin projects fit naturally into npm workspaces.
- Authored trap content is a product asset and should not be buried inside a runtime codebase.
- Separate packages for domain models, chess primitives, API clients, and design tokens prevent accidental coupling.

## Consequences

Positive outcomes:

- a clear landing zone for each future feature area
- easier ownership boundaries as the team grows
- content operations can scale independently from app development
- backend and client code can share contracts without sharing runtime assumptions

Tradeoffs:

- two workspace toolchains must coexist
- generated code and dependency automation need discipline
- initial setup is heavier than a single-app repo, but it avoids later migration cost