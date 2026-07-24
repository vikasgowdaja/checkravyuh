import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const requiredPaths = [
  '.gitignore',
  'README.md',
  'melos.yaml',
  'package.json',
  'apps/mobile/pubspec.yaml',
  'apps/api/package.json',
  'apps/web/package.json',
  'apps/admin/package.json',
  'packages/shared_models/lib/shared_models.dart',
  'packages/chess_engine/lib/chess_engine.dart',
  'packages/design_system/lib/design_system.dart',
  'packages/api_client/lib/api_client.dart',
  'docs/architecture.md',
  'docs/content-pipeline.md',
  'docs/getting-started.md',
  'docs/product-scope.md',
  'docs/decisions/0001-foundation-stack.md',
  'docs/decisions/0002-monorepo-foundation.md',
  'docs/decisions/0003-shared-client-backend.md',
  'content/traps/blackburne_shilling.yaml'
];

const packageChecks = [
  ['package.json', 'checkravyuh'],
  ['apps/api/package.json', '@checkravyuh/api'],
  ['apps/web/package.json', '@checkravyuh/web'],
  ['apps/admin/package.json', '@checkravyuh/admin']
];

const missingPaths = requiredPaths.filter((relativePath) => !existsSync(resolve(relativePath)));
const packageErrors = [];

for (const [filePath, expectedName] of packageChecks) {
  try {
    const packageJson = JSON.parse(readFileSync(resolve(filePath), 'utf8'));

    if (packageJson.name !== expectedName) {
      packageErrors.push(
        `${filePath}: expected package name \"${expectedName}\", found \"${packageJson.name ?? 'undefined'}\"`
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    packageErrors.push(`${filePath}: ${message}`);
  }
}

if (missingPaths.length > 0 || packageErrors.length > 0) {
  if (missingPaths.length > 0) {
    console.error('Missing required scaffold paths:');
    for (const missingPath of missingPaths) {
      console.error(`- ${missingPath}`);
    }
  }

  if (packageErrors.length > 0) {
    console.error('Package manifest problems:');
    for (const packageError of packageErrors) {
      console.error(`- ${packageError}`);
    }
  }

  process.exit(1);
}

console.log('Scaffold validation passed.');
console.log('The repo structure and workspace manifests are in place.');
console.log('Runnable shells exist for API, learner web, and admin.');
console.log('The Flutter mobile app still requires the local Flutter toolchain.');