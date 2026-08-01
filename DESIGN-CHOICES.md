# Packspace design choices

**Applied:** 2026-08-01  
**Platform / target:** Web app  
**Chosen style:** `notes-plontsch`, adapted to Packspace  
**Distinct tint:** Survey cyan `#5ad2ff`

Packspace keeps its local Blueprint measurement language. The personal default contributes the
flat, monospaced, restrained system; Packspace supplies the dark technical canvas, survey-cyan
tint, semantic verdict colours, and recognisable travel environments.

## Taste decisions

| What changed | Principle | Why | Tradeoff / precedence |
|---|---|---|---|
| Shinkansen and plane selections now render inside procedural half-cabin cutaways with one seat bank, the checked row plus quieter rows before and after, the aisle edge, windows, floors, walls, lights, racks, bins, and under-seat hardware. | P1 bespoke expressive surfaces; local direction | The measured volume now reads as a place a person can inhabit, while the removed half and faded neighboring rows keep the user's own seat and storage area unobstructed. | The cabin is representative, not evidence-grade geometry. The measured volume and its confidence styling remain the authoritative layer. |
| The measured volume is placed and rotated into the corresponding real-world location: overhead, under-seat, front-row, or rear baggage area. | C2 honesty about provenance | Context should clarify the measurement rather than imply that a floating box is a literal cabin model. | Policy envelopes remain visibly described as allowances, not measured cavities. |
| A flat information panel separates controls from the 3D scene, and mid-size framing shifts the cabin into the unobstructed field. | C1 restraint / subtraction | Readability comes from one quiet surface and better composition instead of glow, blur, or more chrome. | The panel hides a small part of the canvas; camera framing compensates. |
| `Copy link` is the one filled action. JSON input, sources, and the manual URL are secondary or disclosed. | C1 restraint / subtraction | Sharing is the primary handoff; fallback mechanics should remain available without dominating the view. | Manual URL discovery takes one extra click. |
| All interface copy uses one monospaced voice. | C3 coherence | The controls, evidence, and measurements should feel like one instrument. | Long policy text wraps sooner than it would in a proportional face. |
| Verdicts retain green / amber / red while interaction and measurement use cyan. | C2 honesty; local Blueprint decision | Confidence, interaction, and outcome must not compete in the same colour channel. | The palette has more than one accent, but every colour has one job. |
| Focus rings, 44 px primary targets, live status text, and reduced-motion camera snapping are explicit. | C1 calm includes assistive technology | A quiet interface still needs legible state changes and predictable motion. | Reduced-motion users get immediate rather than eased camera snaps. |
| Perspective and orthographic projection are independent from Front / Side / Top / Free viewpoints. | C1 function earns emphasis | Perspective gives room feel; orthographic removes foreshortening when judging dimensions. | The camera control gains one compact segmented row. |

### Already aligned

- Source links, per-axis confidence, and policy limitations already made provenance visible.
- The grid, always-on dimensions, orthographic snaps, and 168 cm human already served functional
  scale rather than decoration.
- Camera motion was already deterministic and damped.

## Style tokens

| Group | Resolved value | Source | Why |
|---|---|---|---|
| Typeface | System monospace stack | Chosen style | Carries the personal default's single-voice mono system without a font download. |
| Canvas | `#081522` / deep `#050c13` | Local Blueprint | Preserves the technical-drawing identity and keeps luminous geometry legible. |
| Surfaces | `rgb(8 21 34 / 94%)`, flat, 1 px hairlines | Chosen style + local | Flatness comes from `notes-plontsch`; the navy values come from Packspace. |
| Accent | `#5ad2ff` | Distinct Packspace tint | Reads as survey light, measurement ink, focus, and the selected camera state. |
| Text | `#d8f3ff` strong, `#acd3e3` body, `#789fb2` muted | Local Blueprint | A cool ramp keeps hierarchy quiet while improving small-text contrast. |
| Environment | Steel blue structure, cyan-lit windows, blue train seats, slate plane seats | Local cabin direction | Recognisable materials separate the room from the brighter measured object without claiming photorealism. |
| Verdicts | `#67dba8`, `#f6bd5a`, `#ff7d73` | Local fit semantics | Pass, conditional/rotated, and fail remain immediately distinguishable. |
| Radius | 3–5 px | Local Blueprint override | Technical panels and controls should feel drawn, not soft or card-like. |
| Spacing | 4 / 8 / 12 / 16 / 24 px; 44 px touch target | Chosen style | Keeps density compact while preserving interaction size. |
| Material | No shadows or backdrop blur | Chosen style | Flat layers are calmer and avoid unnecessary compositing cost over WebGL. |

## Overrides

- **Local cabin direction supersedes the earlier “wireframe void only” decision.** Blueprint now
  describes the measurement overlay, not the absence of an environment.
- **Packspace navy/cyan supersedes Catppuccin lavender and surfaces.** Reusing those values would
  erase the project's existing identity.
- **Dark-only supersedes the personal default's light variant.** The current 3D lighting,
  confidence lines, and cabin materials are authored as one dark technical canvas; an appearance
  switch remains opt-in work rather than an automatic inversion.
- **Small technical radii supersede the chosen style's 8 px card radius.**

## Fidelity boundary

The procedural cabins are the first fidelity stage. Their repeated parts are deliberately isolated
in `TravelEnvironment.tsx` so researched proportions, richer materials, textures, and eventually
vehicle-specific assets can replace the blockout without changing fit geometry or payload logic.
As fidelity increases, cabin dimensions must remain labelled as representative unless backed by
the same evidence standard as the selected fit volume.
