# Mobile App

Flutter is the primary client application.

Target structure:

```text
lib/
  core/
  features/
    authentication/
    home/
    openings/
    traps/
    practice/
    review/
    profile/
```

Architecture rules:

- feature-first organization
- clean separation between presentation, domain, and data
- offline-first persistence through Drift
- no chess rules inside widget code