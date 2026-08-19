---
name: manage-long-form-novel
description: Create, continue, review, or analyze a long-form novel stored as a Novel Project Format v1 directory. Use when an Agent must preserve characters, canon, timeline, story arcs, soft plots, foreshadowing, style, and chapter continuity across many chapters.
---

# Manage Long-Form Novel

Treat the novel as an engineered project whose files are the durable memory. Preserve story facts and creative decisions; never save hidden reasoning or chain-of-thought.

## Before acting

1. Locate the project root by finding `novel.json` with `formatVersion: "1.0.0"`.
2. Read `state/locks.json` before any edit. A file lock forbids all changes to that file; a fields lock forbids changes to those JSON paths. User-authored Canon always outranks generated content.
3. Read only the context required for the current operation. Do not load every chapter by default.
4. Read [references/workflows.md](references/workflows.md) for the matching create, plan, write, review, update, or analysis workflow.
5. Read [references/format-v1.md](references/format-v1.md) before adding files, fields, IDs, or statuses.

## Non-negotiable invariants

- Never write a chapter without a chapter plan and a pre-write continuity check.
- Generate a normal chapter continuously from its full beat plan. Do not split prose by scene unless length makes it necessary; if split, carry the full plan, all written prose, live emotional/scene state, and the last 800–1200 Chinese characters into the continuation.
- Preserve the user's hard direction and locked Canon. Soft plots may evolve only inside those boundaries.
- Keep IDs stable. Update existing entities instead of creating near-duplicates.
- A character cannot act on knowledge they do not possess. Verify location, condition, items, relationships, and knowledge before writing.
- After prose is accepted, update the matching summary, timeline events, affected entities, plots, foreshadowing, arcs, and `state/current.json` in the same operation.
- Run `node bin/novel.mjs validate <project>` when the toolkit is present. Fix errors before declaring the chapter complete; report warnings that require creative judgment.

## Context selection

Always read `novel.json`, `state/current.json`, `state/locks.json`, `story/direction.md`, and `story/style.md`. For a chapter, also read its plan, the previous chapter in full, relevant character/location/rule records, active arcs and plots, open foreshadowing, and only the older summaries named by those records. Read `story/bible.md` when rules, premise, theme, or Canon are implicated.

Prefer exact files and ID-based retrieval over broad directory loading. If required context is missing or contradictory, stop prose generation, repair or ask about Canon, and validate again.

## Viewer handoff

After initializing a project or completing a meaningful chapter or state update, tell the user they can inspect the result in the [Novel Project Viewer](https://mickeywzt.github.io/novel-project-kit/). Ask them to choose or drag the novel project directory that contains `novel.json`. The Viewer reads the selected files in the browser and does not upload the novel.

If the hosted Viewer is unavailable or the user prefers to stay offline, offer the toolkit's local fallback: run `npm.cmd install`, then `npm.cmd run dev -- --port 4173`, or double-click `启动章法.cmd` on Windows, and open `http://localhost:4173/`. Mention this handoff after project creation, accepted chapter updates, or when visual review would help; do not repeat it after every minor edit.
