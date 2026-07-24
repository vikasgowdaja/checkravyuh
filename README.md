# Checkravyuh

Checkravyuh is a dedicated training platform for chess opening traps. The product goal is not to analyze positions like a chess engine or replace a tactics trainer. It is to help players recognize, memorize, and execute opening traps through repetition, adaptive review, and feedback loops that make trap recognition automatic.

## Product Vision

Learn. Recognize. Execute. Master chess opening traps through interactive practice.

The first release focuses on:

- black traps against white
- 10 carefully selected opening traps
- interactive practice
- guided learning
- adaptive review

## Product Positioning

- Focus area: opening trap pattern acquisition
- Primary learning loop: learn -> practice -> score -> review -> recommend
- Differentiator: adaptive sequencing based on missed motifs, inaccurate move choices, and review history

## Foundation Stack

- Clients: Flutter mobile app plus a learner-facing web app
- Backend: one shared NestJS modular monolith for web and mobile clients
- Database: PostgreSQL
- Cache and queues: Redis
- Binary assets: S3-compatible object storage
- Local mobile storage: SQLite via Drift
- Review scheduler: FSRS-style spaced repetition
- Content validation: Stockfish worker outside the user-facing request path

## Architecture Principles

- Offline-first: the app must remain useful without connectivity
- Modular by feature: openings, traps, reviews, recommendations, profile, analytics
- Shared backend: web and Android/mobile clients use the same API and domain services
- Versioned content: trap libraries evolve independently of app releases
- Event-driven internals: analytics, recommendations, and notifications react to domain events
- Service-ready boundaries: start as a modular monolith, split by load and ownership later

## Planned Repository Shape

```text
apps/
  mobile/                 Flutter client
  api/                    NestJS API
  web/                    Next.js learner web app
  admin/                  React admin portal
packages/
  shared_models/          Pure Dart domain entities
  chess_engine/           Chess notation and validation primitives
  design_system/          Shared Flutter widgets and tokens
  api_client/             API bindings for the mobile client
content/
  traps/                  Versioned authored trap files
infra/
  docker/
  terraform/
docs/
  architecture.md
  decisions/
.github/
```

## Workspace Tooling

- `melos` manages Flutter and Dart packages under `apps/mobile` and `packages/*`
- npm workspaces manage `apps/api`, `apps/web`, and `apps/admin`
- authored trap content lives under `content/` so releases can evolve independently from app binaries

## Delivery Order

1. Shared API foundation with authentication, openings, traps, lessons, and practice contracts
2. Learner web app and admin portal on the same backend
3. Practice engine, review scheduling, analytics, and gamification
4. Flutter mobile client consuming the same API and content
5. AI coach and recommendation features

## Reference Docs

- [Architecture](docs/architecture.md)
- [Content Pipeline](docs/content-pipeline.md)
- [Developer Environments](docs/development-environments.md)
- [Getting Started](docs/getting-started.md)
- [Product Scope](docs/product-scope.md)
- [ADR 0001: Foundation Stack](docs/decisions/0001-foundation-stack.md)
- [ADR 0002: Monorepo Foundation](docs/decisions/0002-monorepo-foundation.md)
- [ADR 0003: Shared Client Backend](docs/decisions/0003-shared-client-backend.md)