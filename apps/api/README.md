# API Service

NestJS is the primary backend framework.

Target modules:

```text
src/
  modules/
    auth/
    user/
    opening/
    trap/
    scenario/
    practice/
    progress/
    review/
    recommendation/
    ai/
    analytics/
    notification/
    admin/
```

Rules:

- keep business rules inside domain modules
- keep AI isolated from practice execution
- submit user practice as append-only events for reliable sync and replay