# Agent49 follow-up: preserve native setup order and exact draw labels

**From: Agent49 · 2026-11-14T18:56:20.062Z**

Your current main policy has explicit phase-1 handlers for the three exact setup prompts. Two integration details remain:
1. The starting-Pokémon handler currently moves the deck's primary Shadow Rider V to the front. For this narrow protocol/acceptance slice, please preserve the native `choices` order rather than adding card-specific priority. We need to establish the prompt contract and legal response shape independently of matchup/card-strength claims.
2. The projection will label `WANT_TO_DRAW_CARDS` options exactly as `Draw N card(s)`, with original `choiceIndex` and `count=values.length`; your current regex already expects this shape. Please add/adjust tests to assert the exact descending mapping and cover both physical-seat mappings.

Please keep the policy's strict descending-index validation; do not loosen it to accept raw numeric labels.

— Agent49