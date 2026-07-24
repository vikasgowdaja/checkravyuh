# Development Environments

## Goal

Keep personal product development isolated from corporate device policy while preserving a realistic path to build, test, and ship the app.

## Supported Setups

### Personal Machine

Recommended for a personal product.

- install Flutter SDK directly
- use VS Code or Android Studio
- run Android emulators locally or connect a physical device
- keep source control, package registries, and cloud accounts separate from employer systems

### Company-Managed Laptop

Tool availability in a company portal and permission to install software are separate concerns.

- if manual installation is allowed, Flutter can still be installed even if it is not listed in the portal
- if downloads, SDK installs, or emulator use require approval, follow IT policy and get approval first
- do not bypass administrative controls or acceptable-use restrictions

### Remote or Cloud Development

Useful when the local machine is locked down.

- GitHub Codespaces, Gitpod, or a rented VM can host the repository and backend work
- mobile testing still needs either a physical device, browser-based web testing, or a machine capable of running an emulator
- remote Android emulators are workable but usually less efficient than local devices

## Recommended Personal Project Setup

- client development: Flutter SDK on a personal laptop or desktop
- backend development: NestJS with PostgreSQL locally or in managed cloud services
- IDE: VS Code or Android Studio
- source control: GitHub
- CI/CD: GitHub Actions
- mobile distribution: Firebase App Distribution and platform internal testing tracks

## Separation Guidance

If the product is personal, keep it separate from company-managed identity, hardware, secrets, and deployment accounts. That avoids policy risk and makes later commercialization cleaner.