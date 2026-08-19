# Viewer fidelity ledger

Concept: `docs/design/viewer-concept.png`  
Latest desktop render: `docs/design/viewer-desktop.png`  
Responsive render: `docs/design/viewer-narrow.png`  
Native comparison viewport: 1536 × 1024

| Comparison point | Concept evidence | Render evidence | Result |
|---|---|---|---|
| App shell | 228px warm-paper sidebar, full-height white workspace | Same two-region shell and border geometry | Matched |
| Brand and header | Red “章法”, large serif title, quiet subtitle, privacy line, outlined folder action | Same hierarchy, copy, placement, and action treatment | Matched |
| Manuscript visual system | Warm white paper, charcoal ink, cinnabar margin rules, olive completion state, hairline borders | Exact token family implemented without gradients or glass effects | Matched |
| Story progress | Three phases, green completed segment, red current marker at 42% | Same phases, rails, marker and numeric position | Matched |
| Active story arcs | Three open editorial rows with thin red progress rails | Same titles, 42/68/24 values, open-row structure | Matched |
| Recent writing | Right-side vertical region, Chapter 27, 4,128 words, dotted red margin | Same anatomy and live summary data | Matched |
| Character and foreshadow ledgers | Three character rows plus 12/7/16 status summary | Same ordering, values, typography and rule lines | Matched |
| Navigation | Seven thin-outline navigation entries with red selected state | Lucide outline icons, same labels and selected margin bar | Matched |
| Required metrics | Required brief named four overview metrics, but generated concept omitted the strip | Added a slim four-value strip below the header | Intentional functional addition |
| Data integrity | Concept showed “最久未推进：41章” while only 27 chapters exist | Demo computes 18 chapters from valid chronology | Intentional correction |
| Responsive continuation | Concept required a collapsing navigation rail | At 1000px the sidebar becomes a scrollable top rail; at 700px content becomes one column | Matched requirement |

Browser verification used the Codex in-app browser. The implementation was checked at 1536 × 1024 and 640 × 900. No material visual mismatch remains; the two intentional differences preserve requirements and valid data rather than changing the design language.
