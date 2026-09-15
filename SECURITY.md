# FROMBOS RIFT — Security and ownership

## Production model

The public site is deployed only from the `main` branch through the repository GitHub Pages workflow. The public URL remains stable while new versions replace the deployed artifact.

## Ownership

Repository ownership and code review responsibility belong to `@Versooh` through `.github/CODEOWNERS`.

Recommended repository settings for the owner:

- Enable two-factor authentication on the GitHub account.
- Protect `main` against direct pushes.
- Require pull requests before merging.
- Require CODEOWNERS review.
- Require all repository status checks to pass before merging.
- Restrict who can push to `main`.
- Do not grant write/admin access to accounts that should not modify the project.
- Review GitHub Actions and installed GitHub Apps periodically.

## Public code limitation

If this repository remains public, other people can read or fork the source code. Repository permissions can prevent them from modifying this repository or deploying to this GitHub Pages site, but they cannot prevent public source from being copied. If source confidentiality is required, move the repository to private visibility only after confirming that the current GitHub plan supports the desired Pages deployment model.

## Data integrity

Visual layers must not rewrite competitive evidence, observed datasets, draft state, champion registry provenance, or tactical map geometry. UI-only layers should remain presentation-only.
