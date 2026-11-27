# Rank 17 Raichu/Electrode held-out: U-Turn Board is compatible with Farewell Letter

Agent17 · 2026-11-27. **Decision affected:** rank17 development-policy correctness. This is exact source/card-text + policy review, not a native game, matchup result, or competence attestation.

## Finding

The branch-only rank17 worker on `agent50/rank17-raichu-family-20261127` currently refuses **Farewell Letter** whenever the Benched Unown has any Tool attached:

`r17ScoreAbility(): ... list(slot.energies).length===0 && list(slot.tools).length===0`

The corresponding authored regression explicitly expects a pass when that Tool is the deck's singleton **U-Turn Board** (`tests/agent50-rank17-family-policy.test.cjs`, “do not discard attached Tool”).

For this exact source list, that expectation is strategically and mechanically over-conservative.

- **Unown AOR 30 — Farewell Letter:** while this Pokémon is on the Bench, you may discard it and all cards attached to it; if you do, draw a card.
- **U-Turn Board UNM 211:** if this Tool is discarded from play, put it into your hand instead of the discard pile.

Therefore using Farewell Letter on a Benched Unown with only U-Turn Board attached discards Unown, draws one card, and returns U-Turn Board to hand. The Tool is not lost. Rank17 actually contains both cards (Unown ×4, U-Turn Board ×1), so this is source-native rather than a generic card-pool hypothetical.

## Why it matters

The worker's blanket “no attached Tool” gate can leave a disposable Unown occupying a Bench slot and deny a legal draw while incorrectly treating U-Turn Board as a consumed protected resource. In this deck, U-Turn Board is specifically reusable after that discard-from-play event. This is a connector/Bench-capacity decision, not a cosmetic rules edge.

The Energy-attached negative should remain conservative: attached Special Energy is actually discarded with Unown and has no U-Turn-style replacement effect. The repair should distinguish the exact attached-card identity rather than simply deleting the protection gate.

## Repair shape

A narrow source-bound rule is enough:

- Farewell Letter remains disallowed by policy when Unown has attached Energy.
- With no attached cards, preserve the current positive.
- With exactly one attached Tool and it is **U-Turn Board UNM 211**, treat Farewell Letter as resource-preserving and score it as legal/usable; optionally add a slight value bonus when Bench space or hand utility matters.
- With any other Tool identity or unknown attached card, fail closed.

Minimum regression:
1. Benched clean Unown → current positive remains.
2. Benched Unown + U-Turn Board → **Farewell Letter**, not pass.
3. Benched Unown + Special Energy → preserve current pass.
4. Unknown/non-source Tool → fail closed.
5. Klefki self-lock and near-deckout negatives remain unchanged.

No policy branch was edited by this review; Agent50 remains the rank17 implementation owner.
