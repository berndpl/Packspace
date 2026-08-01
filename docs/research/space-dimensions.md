# Space Dimensions for Packspace v1

_Research date: 2026-08-01 · Repo: berndpl/Packspace · Issue: #2_

## Axis convention

Every dimension below is in **centimetres**, stated as **W × H × D** where:

- **W** = along the vehicle (fore-aft) — the direction you slide a bag in along a shelf
- **H** = vertical — the opening height, usually the binding constraint
- **D** = across the vehicle — the shelf/bin depth, how far back it goes

Where a source states dimensions without an axis convention, that is flagged.

---

## The headline finding

**Operators publish *policy* dimensions precisely and *physical space* dimensions almost never.**

JR Central publishes exact rules for what you're *allowed* to bring (160 cm / 250 cm total dimensions, an 80×60×40 cm compartment cap) but publishes only one physical shelf number (rack depth ≈ 42 cm). Airbus and Boeing publish no public bin interior dimensions at all; airlines publish allowance boxes, not bin geometry.

**Consequence for Packspace:** the verdict cannot be a single number. A bag can physically fit a bin and still break a rule, and vice versa. See [Allowance ≠ physical fit](#allowance--physical-fit) and issue #5 (Define the fit rule).

---

## Shinkansen (Tokaido / Sanyo / Kyushu — JR Central)

### Policy rule — HIGH trust, primary source

Source: [JR Central, Luggage information](https://global.jr-central.co.jp/en/info/oversized-baggage/) (official, fetched 2026-08-01).

Four bands, by **total of three dimensions (L+W+H)**:

| Total dimensions | Where it goes | Reservation |
|---|---|---|
| ≤ 160 cm | At your feet, or the overhead baggage racks | Not required |
| ≤ 160 cm (large/heavy) | Deck baggage storage area | Not required |
| **161–250 cm** | Oversized baggage space behind the last-row seat | **Required** — otherwise a ¥1,000 fee |
| > 250 cm | **Cannot be brought on board** | — |

Additional official limits from the same page:

- Portable personal effects allowance: **2 pieces**, each **≤ 30 kg**, **≤ 250 cm total**, and **no longer than 200 cm** on any single side.
- **Oversized baggage compartment**: one piece of **max 80 × 60 × 40 cm**. ⚠️ JR does not state which figure is which axis.
- Wheelchairs (four-wheeled) are exempt from the limits if roughly **≤120 cm length and height, ≤70 cm breadth**.

This band rule is directly implementable and is the strongest evidence in this document. It also answers the user's "does the folding bike need to be checked in?" question exactly: sum the three dimensions and read off the band.

### Overhead luggage rack — PARTIAL, primary source

- **Depth (D) ≈ 42 cm** — "Tokaido Shinkansen luggage racks offer space stretching back approx. 42 cm" ([JR Central FAQ](https://global.jr-central.co.jp/en/info/oversized-baggage/)). **HIGH trust**, official.
- **Width (W) and opening height (H): not published by JR.** Secondary estimates put the shelf around **90 cm W × 32 cm H**, but no primary source was found. ⚠️ **LOW trust — treat as placeholder.**
- **Green Car**: JR documents 2+2 rather than 2+3 seating but publishes **no dimensional delta** for the rack. ⚠️ **Do not model a Green Car variant on invented numbers.**

### Foot space — PARTIAL, primary source

- JR states foot space "depends on the individual passenger", but that baggage of **≤ 120 cm total dimensions** fits ([JR Central FAQ](https://global.jr-central.co.jp/en/info/oversized-baggage/)). **HIGH trust** as a rule, but it is a *total-dimensions* rule, not a W×H×D box.

### Space behind a seat — WEAK

The brief distinguishes the **bulkhead / first-row** space from the space **behind a single ordinary seat**. JR describes the last-row space functionally (it is the reserved "oversized baggage space") and caps a compartment piece at 80×60×40 cm, but **publishes no dimensions for the behind-seat gap itself**.

- Behind last row: secondary/photographic estimates only, roughly **28 cm W (fore-aft) × 90 cm H × 85 cm D**. ⚠️ **LOW trust.**
- Bulkhead / row 1: **estimated from seat pitch**, roughly **45–55 × 90 × 50**. ⚠️ **VERY LOW trust — this is inference, not measurement.**

**Recommendation:** model the behind-seat space using the official **80 × 60 × 40 cm compartment cap** rather than the estimated gap geometry. It is the number JR actually stands behind, and it is the number that governs whether your bag is accepted.

---

## Aircraft

### The evidence problem

Airbus *Aircraft Characteristics* documents and Boeing cabin specifications do not publish overhead bin **interior** dimensions publicly; the URLs attempted returned 404. Everything in this section that describes physical bin geometry is **secondary and LOW trust.**

| Space | W × H × D (cm) | Trust |
|---|---|---|
| A320 overhead bin, standard (pre-2018 cabin) | 88 × 33 × 45 | ⚠️ LOW — derived, no primary source |
| A320 overhead bin, Airspace cabin (2018+) | 88 × 43 × 45 | ⚠️ LOW — aviation trade reports |
| 737 NG/MAX "Space Bin" | 87 × 38 × 51 | ⚠️ LOW–MEDIUM — Boeing marketing material |
| A320 under-seat (aisle/centre) | 42 × 28 × 47 | ⚠️ LOW — user measurements |
| 737 under-seat | 40 × 26 × 47 | ⚠️ LOW — user measurements |

Note the bin height nearly doubles between the standard and Airspace A320 cabin (33 → 43 cm). **Which cabin you fly is a bigger variable than which airline**, and the passenger cannot know it in advance. This weakens the case for modelling a specific aircraft precisely.

### Allowance rules — HIGH trust

| Rule | W × H × D (cm) | Source |
|---|---|---|
| IATA carry-on guideline | 56 × 45 × 25 | [IATA via Wikipedia](https://en.wikipedia.org/wiki/Carry-on_luggage) |
| American Airlines carry-on (incl. wheels/handles) | 55.9 × 35.6 × 22.9 | [aa.com](https://www.aa.com/i18n/travel-info/baggage/carry-on-baggage.html) |
| American Airlines personal item | 45.7 × 35.6 × 20.3 | aa.com |

---

## Allowance ≠ physical fit

The two can disagree in **both directions**, which is why Packspace needs both answers:

- A bag at the **IATA maximum (56 × 45 × 25)** is policy-compliant, yet **does not lie flat in a standard 33 cm-high A320 bin** — it only fits the newer Airspace cabin.
- That same bag **exceeds American Airlines' 55.9 cm limit** by a millimetre, so it is non-compliant on AA regardless of whether it physically fits.
- On the shinkansen, a bag can **physically sit in the overhead rack** and still be **over the 160 cm band**, requiring a reserved oversized-baggage seat.

Feeds directly into issue #5 (Define the fit rule).

---

## What this means for the map

1. **The shinkansen policy bands are the most trustworthy thing found** and should anchor v1. They also answer the user's actual motivating question about the folding bike.
2. **Physical bin/shelf dimensions are mostly estimates.** Packspace must not render an estimate with the same authority as a published rule — the app needs a **confidence signal**. This is a new decision, not covered by any existing ticket.
3. **Do not build a Green Car variant** or a precise per-aircraft model on invented numbers.

## Sources attempted and blocked

- `jr-central.co.jp` (non-global domain) — connection failed
- Airbus *Aircraft Characteristics* PDF — 404
- Boeing cabin specification documents — not publicly available
- `smart-ex.jp/en/guide/oversized_baggage/` — 404 (the JR Central global site above supersedes it)
