# ADR 0001: Foundation Stack

- Status: Accepted
- Date: 2026-07-23

## Context

The product must support Android first without becoming Android-only, remain usable offline, and leave room for adaptive learning, premium features, and content operations. The core risk is not rendering a chessboard. It is keeping content, progress, reviews, and recommendations coherent across devices and weak-network conditions.

## Decision

Adopt the following baseline architecture:

- Flutter as the primary client application stack
- NestJS as the backend application framework
- PostgreSQL as the system of record
- Redis for queues, caching, and rate-limited workloads
- Drift on SQLite for local offline persistence in the client
- REST-first API design for sync and content delivery
- FSRS-style scheduling for spaced repetition
- Stockfish as an asynchronous content-validation dependency, not a foreground engine

## Rationale

### Flutter over Android-only native

- ships to Android, iOS, tablet, desktop, and web from one codebase
- lowers product and experimentation cost during early growth
- keeps the product consistent across platforms where study habits vary

Kotlin Multiplatform with Compose is still a valid future option if organization structure or performance constraints change, but it is not the best default for a content-heavy learning product starting from zero.

### Modular monolith over microservices first

- simpler ownership and deployability
- fewer distributed-systems failure modes during MVP
- easier transactional consistency for progress and reviews
- can still split modules later if boundaries are clean

### REST-first over GraphQL-first

- better fit for offline sync tokens, manifests, and idempotent batch submission
- easier CDN and cache behavior for content delivery
- lower client complexity for background synchronization

GraphQL can be introduced later for dashboard aggregation or internal back-office tooling.

### Drift and SQLite for offline-first storage

- relational data fits content, reviews, attempts, and sync metadata well
- deterministic local queries for due reviews and cached trap content
- mature tooling across Flutter targets

### FSRS over older spaced-repetition formulas

- stronger baseline scheduling quality
- easier to tune from real performance data
- more aligned with adaptive review as the product matures

## Consequences

Positive outcomes:

- faster path to a usable multi-platform product
- fewer rewrites when adding iOS or web later
- clean support for offline practice and deferred sync
- strong base for analytics, coaching, and premium features

Tradeoffs:

- monorepo and build tooling will span Dart and TypeScript ecosystems
- Flutter web should be treated as a secondary target until the mobile experience is strong
- NestJS remains a framework choice, not a scaling strategy by itself; discipline around module boundaries still matters

## Follow-Up Decisions

- choose the client state-management library
- choose managed auth provider
- define content schema versioning rules
- define entitlement model for free, premium, coach, and academy tiers