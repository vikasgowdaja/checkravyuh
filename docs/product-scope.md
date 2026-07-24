# Product Scope

## Vision

Checkravyuh teaches players to learn, recognize, execute, and master chess opening traps through interactive practice.

## Version 1 Scope

The first release is intentionally narrow:

- black traps against white only
- 10 carefully selected opening traps
- guided learning before unguided practice
- interactive practice and quiz flows
- adaptive review, progress, and XP

This scope is small enough to build well and focused enough to validate whether the learning loop works.

## Learning Model

Every trap should be taught as a lesson, not dumped as raw PGN.

Recommended flow:

1. Opening
2. Trap overview
3. Core idea
4. When it works
5. Warning signs
6. Move sequence
7. Interactive board practice
8. Quiz
9. Review
10. Statistics

## Tour Mode

Each trap should support a Duolingo-style guided tour:

1. Welcome
2. Opening
3. Goal
4. Recognize pattern
5. Key position
6. Execute trap
7. Why it works
8. Common mistakes
9. Quiz
10. Review

## Practice Modes

- Guided
- Normal
- Speed
- Blind Recall
- Puzzle

## Shared Backend Model

This is a Backend + Web + Mobile ecosystem.

- the learner web app and Flutter mobile app consume the same API
- lessons, traps, quizzes, and reviews are shared content
- only presentation and offline behavior differ by client

## Backend Modules

- Authentication
- Users
- Openings
- Traps
- Lessons
- Practice
- Review
- Analytics
- Admin
- AI

## Core Entities

### Opening

- id
- name
- eco
- description
- difficulty

### Trap

- id
- openingId
- title
- summary
- difficulty
- estimatedMinutes
- published

### Lesson

- id
- trapId
- title
- stepNumber
- content
- fen
- hint

### Quiz

- question
- fen
- correctMove
- hint

### Review

- user
- trap
- mastery
- nextReview
- attempts
- accuracy

## First 10 Traps

1. Italian Game: Blackburne Shilling Trap
2. Italian Game: Noah's Ark Trap
3. Berlin Defense: Fishing Pole Trap
4. Petrov Defense: Stafford Gambit Trap
5. Vienna Game: Halloween Gambit Refutation
6. Scotch Game: Lolli Trap
7. Queen's Gambit: Elephant Trap
8. London System: Greek Gift-style tactical motif
9. Caro-Kann: Karpov Variation tactical trap
10. Sicilian Defense: simplified Poisoned Pawn sequence

For each trap, store:

- ECO code
- PGN
- starting FEN
- trigger position
- winning continuation
- common mistakes
- tactical motifs
- typical rating range
- engine evaluation
- references

## API Surface

- `GET /openings`
- `GET /openings/{id}`
- `GET /traps`
- `GET /traps/{id}`
- `GET /traps/{id}/lesson`
- `GET /traps/{id}/practice`
- `POST /practice/start`
- `POST /practice/move`
- `POST /practice/finish`
- `GET /review/today`
- `GET /leaderboard`
- `POST /analytics/session`

## Frontend Surfaces

- dashboard
- openings
- opening details
- trap details
- lesson
- practice
- review
- leaderboard
- profile
- settings

## Recommended Development Order

### Sprint 1

- monorepo setup
- NestJS backend
- Next.js frontend
- PostgreSQL foundation
- authentication
- basic UI

### Sprint 2

- opening module
- trap module
- lesson or tour module
- admin portal

### Sprint 3

- interactive chessboard
- move validation
- practice engine
- progress tracking

### Sprint 4

- review scheduler
- gamification
- analytics
- offline synchronization

### Sprint 5

- AI explanations
- recommendations
- Flutter mobile app on the same backend