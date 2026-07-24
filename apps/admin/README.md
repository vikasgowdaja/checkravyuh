# Admin Portal

The admin app will host:

- trap authoring workflows
- content release review
- analytics dashboards
- coach and academy management

It consumes the same NestJS backend used by the Android and future mobile clients.

It should remain independent from the mobile client release cycle, but it should not introduce a separate backend for shared product logic.