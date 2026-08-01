# Packspace design choices

**Applied:** 2026-08-01  
**Platform / target:** Web app  
**Chosen style:** `notes-plontsch`, adapted to Packspace  
**Distinct tint:** Survey cyan `#5ad2ff`

Packspace keeps its local Blueprint measurement language. The personal default contributes the
flat, restrained system; Packspace supplies the technical canvas, survey-cyan tint, semantic
verdict colours, recognisable travel environments, and an instrument-like control layout.

## Taste decisions

| What changed | Principle | Why | Tradeoff / precedence |
|---|---|---|---|
| Shinkansen and plane selections now render inside procedural half-cabin cutaways with one seat bank, the checked row plus quieter rows before and after, the aisle edge, windows, floors, walls, lights, racks, bins, and under-seat hardware. | P1 bespoke expressive surfaces; local direction | The measured volume now reads as a place a person can inhabit, while the removed half and faded neighboring rows keep the user's own seat and storage area unobstructed. | The cabin is representative, not evidence-grade geometry. The measured volume and its confidence styling remain the authoritative layer. |
| The measured volume is placed and rotated into the corresponding real-world location: overhead, under-seat, front-row, or rear baggage area. | C2 honesty about provenance | Context should clarify the measurement rather than imply that a floating box is a literal cabin model. | Policy envelopes remain visibly described as allowances, not measured cavities. |
| The left panel is now a compact object tray. Brompton, MacBook Air, iPhone, bike-rider, and alpaca presets are visual cards; dimensions, sources, sharing, and JSON stay behind one `Object details` disclosure. | C1 restraint / subtraction | Object switching is the frequent action, while payload mechanics are occasional. | Detailed provenance takes one explicit reveal. |
| The right panel combines symbolic environment cards with projection and Front / Side / Top snaps. Free remains the direct canvas interaction rather than a redundant button. | C1 function earns emphasis | Space and camera choices belong together, and orbit/pan already provide the unsnapped state. | The selected snap no longer labels every manually adjusted camera position. |
| Changing environments preserves the live camera. Packspace only reframes when the new object placement is off-canvas or materially covered by interface panels. | C1 calm; P1 spatial continuity | Comparing spaces should feel like changing the room around the object, not teleporting the viewer. | A visibility fallback may snap to the current named view, or Front from an unsnapped view, when continuity would hide the object. |
| `Copy link` remains the one filled action inside object details. JSON input, sources, and the manual URL are secondary or disclosed. | C1 restraint / subtraction | Sharing is the primary handoff; fallback mechanics should remain available without dominating the view. | Manual URL discovery takes one extra click. |
| Blueprint, Paper, and Terminal appearances update both DOM and WebGL colours, while Mono, Sans, and Serif independently change typography. | C3 coherence with controlled exploration | The switcher enables quick visual comparison without letting the 3D scene and interface drift into separate themes. | Paper is a designed light palette rather than an automatic inversion; choices persist locally. |
| Verdicts retain green / amber / red while interaction and measurement use cyan. | C2 honesty; local Blueprint decision | Confidence, interaction, and outcome must not compete in the same colour channel. | The palette has more than one accent, but every colour has one job. |
| Focus rings, 44 px primary targets, live status text, and reduced-motion camera snapping are explicit. | C1 calm includes assistive technology | A quiet interface still needs legible state changes and predictable motion. | Reduced-motion users get immediate rather than eased camera snaps. |
| Perspective and orthographic projection remain independent from Front / Side / Top snaps. | C1 function earns emphasis | Perspective gives room feel; orthographic removes foreshortening when judging dimensions. | Entering orthographic from an unsnapped camera chooses Front so the projection starts from a legible axis. |

### Already aligned

- Source links, per-axis confidence, and policy limitations already made provenance visible.
- The grid, always-on dimensions, orthographic snaps, and 168 cm human already served functional
  scale rather than decoration.
- Camera motion was already deterministic and damped.

## Style tokens

| Group | Resolved value | Source | Why |
|---|---|---|---|
| Type | Mono, Sans, Serif system stacks | Project Website family influence | `Aa`-style switching stays local and dependency-free while allowing typography comparison. |
| Blueprint | `#081522` canvas, `#5ad2ff` accent | Local identity | The default dark technical drawing remains Packspace's canonical appearance. |
| Paper | `#ece8df` canvas, `#167493` accent | Designed light variant | A warm drawing-paper field preserves measurement contrast without mechanically inverting every token. |
| Terminal | `#04110b` canvas, `#67ff9d` accent | Technical alternate | A green phosphor vocabulary offers a more explicit instrument aesthetic. |
| Scene synchronisation | Theme-specific grid, structure, seats, windows, space, human, and verdict colours | Local implementation | WebGL context, overlays, and controls read as one environment under every appearance. |
| Verdicts | Theme-resolved pass / caution / fail tokens | Local fit semantics | Outcome remains immediately distinguishable without fixing one palette across all appearances. |
| Radius | 3–5 px | Local Blueprint override | Technical panels and controls should feel drawn, not soft or card-like. |
| Spacing | 4 / 8 / 12 / 16 / 24 px; 44 px touch target | Chosen style | Keeps density compact while preserving interaction size. |
| Material | No shadows or backdrop blur | Chosen style | Flat layers are calmer and avoid unnecessary compositing cost over WebGL. |

## Overrides

- **Local cabin direction supersedes the earlier “wireframe void only” decision.** Blueprint now
  describes the measurement overlay, not the absence of an environment.
- **Packspace navy/cyan supersedes Catppuccin lavender and surfaces.** Reusing those values would
  erase the project's existing identity.
- **Blueprint remains canonical, but no longer dark-only.** Paper and Terminal are intentionally
  authored palettes that carry the same semantic roles into both interface and scene.
- **Preset references do not imply equal evidence.** Apple and Brompton cards use published
  dimensions; bike-rider and alpaca cards are deliberately marked inferred or estimated.
- **Small technical radii supersede the chosen style's 8 px card radius.**

## Fidelity boundary

The procedural cabins are the first fidelity stage. Their repeated parts are deliberately isolated
in `TravelEnvironment.tsx` so researched proportions, richer materials, textures, and eventually
vehicle-specific assets can replace the blockout without changing fit geometry or payload logic.
As fidelity increases, cabin dimensions must remain labelled as representative unless backed by
the same evidence standard as the selected fit volume.
