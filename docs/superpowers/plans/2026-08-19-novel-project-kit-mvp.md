# Novel Project Kit MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an end-to-end local-first novel project format, agent skill, deterministic validator CLI, realistic example project, and static browser viewer.

**Architecture:** A shared browser-safe JavaScript core parses a normalized file map and validates Format v1 with JSON Schema plus cross-file rules. A Node CLI adapts filesystem directories to that core; a React + Vite viewer adapts folder selection, drag-and-drop, and a bundled demo to the same core. The Novel Skill and template are distributable artifacts inside the project.

**Tech Stack:** Node.js 24, npm, React 19, TypeScript 5, Vite 7, Ajv, Lucide React, native Node test runner, Playwright/browser QA.

**Spec:** `docs/2026-08-19-novel-project-kit-design.md`

## Global Constraints

- All product work stays inside `novel-project-kit`; do not alter existing root-project files.
- The viewer never uploads, persists, or transmits novel content.
- Format version is exactly `1.0.0`; chapter filenames use three digits.
- User locks in `state/locks.json` override all Agent-generated changes.
- Markdown stores prose; JSON stores structured state; JSONL stores timeline events.
- The Viewer must load a real example project and a user-selected folder.
- No accounts, backend, database, AI API, cover generation, or publishing in v1.

---

### Task 1: Project shell and Format v1 schemas

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`
- Create: `core/schemas/*.schema.json`, `core/format.js`, `core/project.js`, `core/validator.js`, `core/stats.js`
- Test: `tests/core.test.mjs`

**Interfaces:**
- Consumes: normalized `Record<string, string>` file maps.
- Produces: `parseNovelProject(files)`, `validateNovelProject(input)`, `calculateProjectStats(project)`.

- [ ] Write tests for valid parsing, missing files, malformed JSON, dangling references, timeline order, and resolved/open conflicts.
- [ ] Run `npm.cmd test` and confirm the tests fail before implementation.
- [ ] Implement schemas, parser, validation issue shape, and statistics.
- [ ] Run `npm.cmd test` and confirm all core tests pass.

### Task 2: Novel Skill, template, and example project

**Files:**
- Create: `novel-skill/SKILL.md`
- Create: `novel-skill/references/format-v1.md`, `novel-skill/references/workflows.md`
- Create: `novel-skill/assets/novel-project-template/**`
- Create: `examples/yesterday-awake/**`
- Create: `scripts/scaffold-example.mjs`

**Interfaces:**
- Consumes: Format v1 names and statuses from Task 1.
- Produces: a copyable starter project and a 27-chapter valid demo project.

- [ ] Define selective-read workflows for create, plan, write, review, update, validate, and story-health analysis.
- [ ] Define lock handling, Canon priority, context budgets, and continuous whole-chapter generation.
- [ ] Add a minimal one-chapter project template.
- [ ] Generate the realistic 27-chapter example and run `node bin/novel.mjs validate examples/yesterday-awake` after Task 3.
- [ ] Run the installed skill `quick_validate.py` against `novel-skill`.

### Task 3: Validator CLI

**Files:**
- Create: `bin/novel.mjs`, `core/node-files.js`
- Test: `tests/cli.test.mjs`

**Interfaces:**
- Consumes: directory paths plus the shared core API.
- Produces: `novel validate <dir> [--json]`, `novel stats <dir>`, and `novel init <dir>`.

- [ ] Write CLI integration tests for success, failure, JSON output, statistics, and template initialization.
- [ ] Run the CLI tests and confirm they fail before implementation.
- [ ] Implement filesystem loading, human-readable diagnostics, JSON mode, stats, and safe empty-directory initialization.
- [ ] Run all tests and validate the template and demo.

### Task 4: Static local Viewer

**Files:**
- Create: `src/main.tsx`, `src/App.tsx`, `src/styles.css`
- Create: `src/components/AppShell.tsx`, `src/components/Sidebar.tsx`, `src/components/ProjectLoader.tsx`
- Create: `src/views/OverviewView.tsx`, `src/views/ChaptersView.tsx`, `src/views/CharactersView.tsx`, `src/views/ArcsView.tsx`, `src/views/TimelineView.tsx`, `src/views/ForeshadowingView.tsx`, `src/views/WorldView.tsx`
- Create: `src/lib/browser-files.ts`, `src/lib/demo.ts`, `scripts/build-demo-bundle.mjs`

**Interfaces:**
- Consumes: `parseNovelProject`, `validateNovelProject`, and a bundled/user-selected file map.
- Produces: seven navigable views, folder selection, directory drag-and-drop, and visible validation diagnostics.

- [ ] Implement demo bundling and browser file adapters.
- [ ] Build the shell and exact concept-derived design tokens.
- [ ] Implement the overview, progress rail, story-arc rows, recent writing, character status, and foreshadow ledger.
- [ ] Implement chapters, characters, arcs, timeline, foreshadowing, and world views with selected/detail behavior.
- [ ] Add loading, empty, partial-error, drag, keyboard-focus, and responsive states.
- [ ] Run `npm.cmd run build` and fix all TypeScript/Vite errors.

### Task 5: End-to-end verification and documentation

**Files:**
- Create: `README.md`, `THIRD_PARTY_NOTICES.md`, `docs/design/fidelity-ledger.md`
- Update: implementation files only when verification exposes a mismatch.

**Interfaces:**
- Consumes: all prior deliverables.
- Produces: reproducible setup, usage, validation evidence, and visual QA evidence.

- [ ] Run fresh `npm.cmd test`, `npm.cmd run build`, demo validation, template validation, and stats commands.
- [ ] Start the static viewer, verify demo load and all seven navigation destinations in Browser/IAB; use Playwright only if Browser/IAB is unavailable or unreliable.
- [ ] Exercise a real folder-selection path or equivalent browser file-input upload and confirm content changes without network upload.
- [ ] Capture desktop and narrow screenshots; inspect the desktop screenshot and concept with `view_image`.
- [ ] Record at least five concept/render comparisons, fix material mismatches, and rerun the full verification set.
