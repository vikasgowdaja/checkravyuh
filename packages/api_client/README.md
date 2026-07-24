# API Client

This package will encapsulate generated or hand-written client bindings for the backend.

Rules:

- expose stable repository-facing methods to the mobile app
- keep HTTP serialization concerns here
- generate models from OpenAPI where practical, but map them into domain entities before feature code consumes them