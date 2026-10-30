---
name: Demo Project
description: Reusable demo starter in the devl.dev style
colors:
  surface: "#161616"
  card: "#1b1b1b"
  ink: "#f5f5f5"
  ink-hover: "#d9d9d9"
  ink-inverse: "#262626"
  muted: "#a1a1a1"
  hairline: "rgb(255 255 255 / 0.06)"
  border: "rgb(255 255 255 / 0.12)"
  border-strong: "rgb(255 255 255 / 0.22)"
  fill: "rgb(255 255 255 / 0.04)"
  failure: "#e5816f"
  attention: "#d9a441"
typography:
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.33
  mono:
    fontFamily: "Menlo, Consolas, Bitstream Vera Sans Mono, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "8px"
  md: "10px"
  pill: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "24px"
  "6": "32px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ink-inverse}"
    rounded: "{rounded.md}"
    padding: "0 13px"
    height: "36px"
  button-primary-hover:
    backgroundColor: "{colors.ink-hover}"
    textColor: "{colors.ink-inverse}"
  input:
    backgroundColor: "{colors.fill}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "36px"
  chip:
    backgroundColor: "{colors.card}"
    textColor: "{colors.muted}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "16px"
  tooltip:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "16px"
---

# Design System: Demo Project

## Overview

**Creative North Star: "The Quiet Workbench"**

A calm, near-black work surface where content and motion do the talking and the chrome stays out of the way. The reference is devl.dev, built on coss ui (Base UI and Tailwind): small type, hairline outlines, generous empty space, and one well-made moment of motion per view rather than effects everywhere.

Surfaces lift gently off the bench. Cards and panels sit on soft ambient shadows; floating layers cast a deeper one. Interaction is tactile and precise: controls give way slightly when pressed and spring back, and the springs are tuned so nothing wobbles.

**Key Characteristics:**
- Dark, low-contrast neutrals with a single bright ink for emphasis.
- Hairline borders and soft lift instead of heavy fills.
- Sans for reading, mono only for code, data and measurements.
- Motion that reveals content (Blur Rise) and responds to touch (spring press), never decorates.

## Colors

A neutral, almost monochrome palette: warm-free greys on near-black, with two quiet signal colours kept for state.

### Primary
- **Bench Ink** (`ink`): headings, primary text, and the fill of the primary button. The brightest thing on screen; its rarity is what gives it weight.

### Neutral
- **Bench Black** (`surface`): the page background.
- **Raised Charcoal** (`card`): cards, tooltips and chips, one step above the bench.
- **Dimmed Ink** (`muted`): secondary text, descriptions, placeholders.
- **Pressed Ink** (`ink-hover`): hover state of ink-filled controls.
- **Inverse Graphite** (`ink-inverse`): text on ink-filled controls.
- **Hairline** (`hairline`), **Rule** (`border`), **Strong Rule** (`border-strong`): the three outline weights, from resting card edge to field border to emphasised edge.
- **Faint Fill** (`fill`): input wells and subtle hover fills.

### Signal
- **Ember** (`failure`): errors and failed states only.
- **Brass** (`attention`): warnings, degraded or pending states only.

### Named Rules
**The One Light Rule.** Bench Ink is the only bright colour. Ember and Brass appear only when something is actually wrong or pending, never as accents.

## Typography

**Body Font:** the platform sans (`-apple-system`, Roboto, Helvetica Neue, system-ui)
**Mono Font:** Menlo (with Consolas and Bitstream Vera Sans Mono)

**Character:** a quiet native sans that reads as the user's own system, with a mono reserved for anything a machine produced.

### Hierarchy
- **Headline** (600, 30px, 1.2, -0.025em): page and section headings, balanced across lines.
- **Body** (400, 14px, 1.625): descriptions and running text in Dimmed Ink, `text-pretty`, kept to about 65ch.
- **Label** (500, 12px): chips, metadata, small controls.
- **Mono** (400, 12px): code, IDs, timings, measurements.

### Named Rules
**The Honest Mono Rule.** Monospace marks machine output: code, data, units. It is never used to make something look "technical".

## Layout

Content sits in a single narrow column (about 28rem for intros, up to 860px for working views), centred in the viewport with at least 24px of side padding on phones. Spacing comes from a 4px-based scale (4, 8, 12, 16, 24, 32px): tight inside a group, generous between groups, and always more space above a heading than below it. Tailwind v4 utilities are the default way to apply it; the tokens are exposed as `bg-background`, `text-foreground`, `text-muted-foreground`, `bg-card` and `border-border`.

## Elevation & Depth

A lifted system. Surfaces separate from the bench through a soft ambient shadow plus a hairline edge, not through stronger fills. Floating layers (tooltips, popovers, menus) take a deeper, longer shadow. Shadows are always offset downward with a wide blur and never coloured.

### Shadow Vocabulary
- **Rest lift** (`box-shadow: 0 1px 2px rgb(0 0 0 / 0.3), 0 8px 24px -12px rgb(0 0 0 / 0.6)`): cards and panels at rest.
- **Hover lift** (`box-shadow: 0 2px 4px rgb(0 0 0 / 0.3), 0 16px 32px -12px rgb(0 0 0 / 0.65)`): interactive cards on hover.
- **Float** (`box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.75)`): tooltips and other floating layers.

### Named Rules
**The Soft Lift Rule.** Every shadow has a downward offset and a wide blur. No zero-offset glows, no coloured halos, no hard block shadows.

## Shapes

Gently rounded rectangles throughout: 10px for controls and cards, 8px for floating layers, and fully round pills for chips and status dots. Edges are drawn with a one-pixel hairline at most; thick borders and coloured side stripes are not part of the language.

## Components

Tactile and precise: controls respond physically to the pointer, then settle without overshoot.

### Buttons
- **Shape:** gently rounded (10px), 36px tall, 13px side padding.
- **Primary:** Bench Ink fill with Inverse Graphite text, 14px medium.
- **Hover / Focus:** hover shifts to Pressed Ink over 120ms; press scales to 0.97 on a stiff spring (stiffness 380, damping 32); focus shows a 2px Rule-coloured ring offset from the edge.
- **Disabled:** 50% opacity, no press response.

### Chips
- **Style:** Raised Charcoal pill with a hairline edge and Dimmed Ink 12px label.

### Cards / Containers
- **Corner Style:** 10px.
- **Background:** Raised Charcoal on Bench Black.
- **Shadow Strategy:** Rest lift; Hover lift when the card is interactive.
- **Border:** hairline.
- **Internal Padding:** 16px, 24px on wider cards.

### Inputs / Fields
- **Style:** Faint Fill well, Rule border, 10px corners, 36px tall.
- **Focus:** border brightens to Dimmed Ink.
- **Error:** border and message in Ember.

### Blur Rise (signature)
The page's one authored entrance: text drifts up 0.4em and comes into focus from an 8px blur, a word or letter at a time, staggered by 22–35ms and capped at 0.6s in total. Springs use stiffness 170, damping 22, mass 0.7; blur and opacity ease out on `cubic-bezier(0.23, 1, 0.32, 1)`. Used for headings and intros, once per view.

## Do's and Don'ts

### Do:
- **Do** reuse devl.dev / coss ui patterns before inventing new ones, ported to the repo's conventions.
- **Do** keep Bench Ink as the only bright colour on a screen.
- **Do** lift cards with the Rest lift shadow and a hairline edge.
- **Do** give pressable controls the 0.97 spring press.
- **Do** theme the browser surfaces too: text selection, focus rings, scrollbars.

### Don't:
- **Don't** use Ember or Brass as decoration; they mean failure and warning.
- **Don't** add more than one entrance animation per view.
- **Don't** use monospace for headings or marketing copy.
- **Don't** use zero-offset glows, coloured shadows or hard block shadows.
- **Don't** use Inter, Lucide or SF Symbols; icons come from UntitledUI.
