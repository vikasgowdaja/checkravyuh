# Content Pipeline

## Goal

Trap content must scale independently from application code. The platform should ingest authored files, validate them, version them, and publish signed releases that clients can sync offline.

## Authoring Format

Store authored trap content as YAML under [../content/traps/blackburne_shilling.yaml](../content/traps/blackburne_shilling.yaml)-style files.

Suggested fields:

- `id`: stable machine identifier
- `version`: monotonically increasing content revision
- `opening`: normalized opening metadata
- `difficulty`: authored difficulty band
- `moves`: canonical move order that leads into the scenario
- `solution`: expected best move or continuation
- `hint`: minimal learning prompt
- `explanation`: human-readable tactical explanation
- `scenarios`: scenario variants with FENs and failure branches
- `tags`: motifs, opening family, tactical themes

## Ingestion Stages

1. Parse YAML into a normalized content manifest.
2. Validate schema and required metadata.
3. Normalize move notation and FEN formatting.
4. Run asynchronous Stockfish validation for authored lines and defensive alternatives.
5. Tag and enrich the trap with motifs, rating bands, and release metadata.
6. Persist validated records into catalog tables.
7. Publish a signed content release manifest for mobile sync.

## Validation Rules

- every trap ID must be globally unique
- versions must increase monotonically per trap
- every scenario must include a valid FEN and at least one correct continuation
- hints should guide pattern recognition without giving away the full line immediately
- explanations should focus on tactical ideas, not just move recital

## Release Model

Each published release should include:

- release ID
- checksum
- publication timestamp
- included trap IDs and versions
- backward-compatibility notes where schema evolution matters

## Why This Matters

This keeps authoring, editorial review, engine validation, and mobile distribution decoupled. New trap libraries can ship without app-store releases, and creator or coach workflows become feasible later.