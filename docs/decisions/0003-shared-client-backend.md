# ADR 0003: Shared Client Backend

- Status: Accepted
- Date: 2026-07-23

## Context

The product now has multiple first-party client surfaces:

- Flutter mobile app for Android and iOS
- React web admin
- possible learner-facing web frontend later

Without an explicit decision, teams often drift into separate web and mobile backends, duplicate domain logic, and inconsistent auth, review, and progress behavior.

## Decision

Use one shared NestJS backend for all first-party clients.

- web frontend and admin surfaces call the same API as the mobile app
- authentication, trap catalog, practice evaluation, review scheduling, progress sync, and recommendations live in one backend
- client differences are handled in presentation, local caching, and offline behavior, not by creating a second backend

## Rationale

- one source of truth for domain behavior keeps learning logic consistent
- product metrics, review scheduling, and recommendations remain comparable across platforms
- contract reuse is easier across mobile and web clients
- the team avoids unnecessary duplicated backend code and operational overhead

## Consequences

Positive outcomes:

- consistent auth and entitlement behavior across clients
- simpler backend ownership and deployment
- faster feature rollout because one API surface serves all clients

Tradeoffs:

- the API contract must be designed carefully for both offline mobile sync and browser-based frontend consumption
- web-specific aggregation needs should be handled thoughtfully so they do not distort mobile-friendly endpoints

## Follow-Up Guidance

- prefer shared REST contracts first
- allow thin web-specific aggregation only if it does not become a second business-logic backend
- keep frontend repos free to diverge in UX while sharing backend semantics