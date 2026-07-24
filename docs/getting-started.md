# Getting Started

## Current State

This repository is a Milestone 0 scaffold. The monorepo structure, package manifests, shared libraries, and content contracts exist. Minimal runnable shells now exist for the API, learner web app, and admin app. The Flutter mobile app is still blocked on the local Flutter toolchain not being installed.

That means there are two different answers to "run and test it":

- what you can validate right now
- what you will run once the Flutter toolchain is installed and the mobile shell is generated

## Prerequisites

### Required Now

- Node.js 20+
- npm 10+

### Required For Flutter Work

- Flutter SDK 3.5+
- Dart SDK compatible with Flutter 3.5+
- `melos` installed globally

Install `melos` after Flutter is available:

```powershell
dart pub global activate melos
```

## What You Can Run Right Now

### Validate The Scaffold

This checks that the monorepo skeleton, manifests, docs, and sample trap content are present and that the workspace package names are valid.

```powershell
npm run validate:scaffold
```

Direct equivalent:

```powershell
node scripts/validate-scaffold.mjs
```

### Run The API

The API now has a minimal NestJS shell with a health-style endpoint.

This same API is the backend for both the current web app and the future Android or mobile app.

```powershell
npm run api:dev
```

Expected result:

- Nest starts in watch mode
- `GET http://localhost:3000/` returns a small JSON payload

### Test The API

```powershell
npm run api:test
```

### Run The Admin App

The admin web app consumes the same local API running on port `3000`.

```powershell
npm run admin:dev
```

Expected result:

- Vite serves the app locally
- the page renders a basic Checkravyuh admin dashboard shell

### Run The Learner Web App

The learner-facing web app also consumes the same local API running on port `3000`.

```powershell
npm run web:dev
```

Expected result:

- Next.js serves the learner web app locally
- the page shows live API status, current trap preview data, and the Version 1 training scope

### Build The Learner Web App

```powershell
npm run web:build
```

### Test The Admin App

```powershell
npm run admin:test
```

### Build The Admin App

```powershell
npm run admin:build
```

### Install JavaScript Workspace Dependencies

This installs dependencies for the API, learner web app, and admin app.

```powershell
npm run bootstrap:js
```

This is required after any workspace package changes so new frontend or backend dependencies are installed locally.

## What Is Not Runnable Yet

This app shell does not exist yet:

- [apps/mobile](apps/mobile)

So these commands are not expected to work until the Flutter SDK is installed and a real mobile source tree is added:

- `flutter run`
- `melos run test`

## Planned Run Commands After App Generation

### Mobile

Once the Flutter app shell exists:

```powershell
melos bootstrap
flutter run -d chrome --target apps/mobile/lib/main.dart
```

Planned checks:

```powershell
melos run analyze
melos run test
```

## Recommended Next Step

If the goal is to actually run the full product, the next implementation task should be finishing the mobile toolchain and then building out real features behind the API and admin shells:

1. Flutter app under [apps/mobile](apps/mobile)
2. Expand the NestJS app under [apps/api](apps/api)
3. Expand the Next.js learner web app under [apps/web](apps/web)
4. Expand the Vite React admin app under [apps/admin](apps/admin)

After that, the run and test commands above become feature-development workflows instead of shell validation.