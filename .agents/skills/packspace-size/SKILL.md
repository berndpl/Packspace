---
name: packspace-size
description: Find real product dimensions and emit a Packspace link plus JSON. Use when the user gives a product name or URL, wants a thing sized for Packspace, or asks whether a named product will fit a travel space.
---

# Packspace Size

Turn a product name or URL into a **transport-size payload** Packspace can trust.

## 1. Identify the exact thing

- A URL names the source candidate; fetch it.
- A product name starts a search. Prefer the manufacturer's exact variant page or manual.
- Variant, generation, capacity, and folded state are part of identity when they change dimensions.
- When two plausible variants remain, ask one precise disambiguating question. A payload for the wrong variant is not a partial success.

Complete when one exact product/variant and transport state are identified.

## 2. Find the dimensions

Use this source order:

1. Manufacturer specification page or manual
2. Operator or official retailer listing for the exact variant
3. Reputable retailer listing
4. Secondary source

Find **maximum external dimensions**, including wheels, handles, pedals, hinges, and other protrusions. Read the source's axis order before normalising it:

- `w`: horizontal side-to-side span in the product's transport orientation
- `h`: vertical height in that orientation
- `d`: front-to-back thickness/depth

Convert inches with `1 in = 2.54 cm`; keep one decimal when conversion is not exact.

Set `measured` honestly:

- `product` — the product in its normal transport state
- `folded` — the product's documented folded state
- `shipping_box` — packaging only; never relabel it as the product

Do not average conflicting dimensions. Prefer the source that is more authoritative, variant-specific, and current; disclose the rejected value. When equally authoritative sources still conflict, stop without a payload and explain what must be resolved.

Complete when W×H×D, the measured state, and one source URL are supported by evidence.

## 3. Grade confidence

- `published` — the exact variant's dimensions are explicitly stated by the manufacturer/operator or in its manual
- `estimated` — a credible source marks the dimensions approximate, or the exact size is a documented range
- `inferred` — dimensions are derived from another fact or adjacent model rather than stated for the exact variant

A marketing phrase, image measurement, search snippet, or shipping weight does not upgrade confidence.

Complete when the grade follows the evidence rather than how plausible the number feels.

## 4. Build the payload

Run the bundled builder from the repository root:

```bash
node .agents/skills/packspace-size/scripts/build-payload.mjs \
  --name "Rimowa Essential Cabin S" \
  --width 40 \
  --height 55 \
  --depth 23 \
  --measured product \
  --confidence published \
  --source "https://www.rimowa.com/..."
```

The builder validates all required fields and prints:

1. A one-click `https://berndpl.github.io/Packspace/#...` URL
2. The equivalent `packspace.object/1` JSON fallback

Never hand-assemble or shorten the URL; the builder owns fragment encoding and field order.

Complete when the command exits successfully.

## 5. Report

Use this exact order:

```markdown
## Match

<exact product and state> — <W> × <H> × <D> cm
Source: <linked source> · Confidence: <grade>
<one short caveat only when evidence conflicts, was converted, or is not the product itself>

## Open in Packspace

<builder URL>

## JSON fallback

<builder JSON>
```

### Misses

- **No dimensions found:** name the highest-trust sources checked and stop without a payload.
- **Shipping box only:** say so; output `shipping_box` only when that volume is useful to the user.
- **Unresolved conflict or variant ambiguity:** state the competing facts and the one decision needed. Do not invent a success-shaped payload.

Complete when the user can either open a trustworthy Packspace link or knows exactly why one was not produced.
