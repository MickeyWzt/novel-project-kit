# Novel Project Format v1

## Directory contract

```text
novel.json
story/direction.md
story/bible.md
story/style.md
story/arcs.json
characters/<stable-id>.json
world/locations.json
world/rules.json
plots/soft-plots.json
plots/foreshadowing.json
timeline/events.jsonl
plans/NNN.md
chapters/NNN.md
summaries/NNN.json
state/current.json
state/locks.json
```

Chapter-related filenames use a three-digit number and must agree with the numeric `chapter` field in the summary and current state. Markdown is for prose and human-readable direction. JSON is for mutable state. Each non-empty JSONL line is one timeline event.

## IDs and references

Use lowercase kebab-case stable IDs such as `lin-xia`, `arc-memory`, `plot-father`, `f-mirror`, and `event-027-d`. Never encode mutable names or status into IDs. References must point to an existing entity in the correct collection.

## Status vocabularies

- Novel: `planning | draft | revision | complete | archived`
- Arc: `planned | active | paused | resolved | abandoned`
- Soft plot: `candidate | active | dormant | resolved | abandoned`
- Foreshadowing: `open | developing | resolved | abandoned`

`state/current.json` may list only active arcs, active plots, and open/developing foreshadowing. Resolved or abandoned items must be removed from current state.

## Locks and Canon

`state/locks.json` contains file or field locks:

```json
{
  "locks": [
    { "path": "story/direction.md", "scope": "file", "reason": "用户总纲", "lockedAt": "2026-08-19" },
    { "path": "novel.json", "scope": "fields", "fields": ["title", "cover"], "reason": "用户已确认", "lockedAt": "2026-08-19" }
  ]
}
```

Before editing, compare the intended change with every matching lock. Do not remove or weaken locks unless the user explicitly requests it.

## Chapter atomicity

For chapter `NNN`, `plans/NNN.md`, `chapters/NNN.md`, and `summaries/NNN.json` form one unit. The final update also appends timeline events and updates all affected state records. If validation fails, the chapter is not complete.
