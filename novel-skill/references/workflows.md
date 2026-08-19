# Novel workflows

## Create a novel

Ask only the few questions that materially change premise, genre, agency, ending constraints, target length, or narrative voice. Then copy the template and build in this order: manifest; candidate titles and chosen title; story direction; Story Bible; style; characters; locations and rules; long-term arcs; initial soft plots and foreshadowing; locks; current state; Chapter 1 plan. Let the user lock title, cover brief, hard direction, rules, or character Canon before prose starts.

## Plan the next chapter

Read current state, locks, direction, active arcs/plots, open foreshadowing, relevant character/location/rule files, the previous chapter, and older summaries explicitly connected to the plan. Produce:

- chapter purpose and end-state change;
- participating entities and retrieved history;
- beats rather than forced scene fragments;
- emotional curve and pacing;
- arc/plot/foreshadowing actions;
- facts that must not be revealed or contradicted;
- target length, normally the manifest target ±15%, with a reason for a larger exception.

Check the plan against Canon, knowledge boundaries, chronology, story-stage budget, repeated beats, and stale arcs before writing.

## Write and review a chapter

Use the approved or automatically checked plan plus assembled context to generate the whole chapter continuously. A review pass may use a cheaper model or a second self-review. Check contradiction, out-of-character behavior, unearned information, pacing, duplicated plot, style drift, filler, ending continuity, and new facts that require memory updates. Apply only local corrections automatically; surface any fix that changes hard direction or locked Canon.

## Commit narrative state

After prose is accepted:

1. Save `chapters/NNN.md` and `summaries/NNN.json`.
2. Append stable-ID timeline events in story order.
3. Update affected character status, location, knowledge, goals, relationships, and `lastUpdatedChapter`.
4. Update arcs, soft plots, and foreshadowing status/progress.
5. Update `state/current.json` and manifest counts/dates.
6. Run the Validator and repair deterministic errors.

Never infer that prose silently overrides locked Canon. When prose and Canon disagree, report the conflict and ask which source should change.

## Analyze story health

Use summaries, current state, arcs, plots, foreshadowing, and timeline before loading prose. Report evidence by stable ID and chapter. Useful checks include: arcs/plots not advanced recently, foreshadowing age, character absence, relationship changes, reveal pacing, repeated chapter outcomes, target-length variance, and divergence between direction and current state. Recommendations may propose soft-plot changes but cannot rewrite locked direction.
