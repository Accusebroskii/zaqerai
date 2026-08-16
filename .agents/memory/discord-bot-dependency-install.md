---
name: Discord bot dependency installation
description: Workspace package installation behavior when adding a dependency to an artifact package
---

When adding a package to a single artifact in this pnpm workspace, the package manager helper may target the workspace root and fail; use the artifact-scoped pnpm add command instead.

**Why:** Root installs are blocked by pnpm's workspace-root safety check, while the artifact needs to own its runtime dependency.

**How to apply:** Run `pnpm --filter @workspace/<artifact> add <package>` only after the package helper has failed for this workspace-scoped case.