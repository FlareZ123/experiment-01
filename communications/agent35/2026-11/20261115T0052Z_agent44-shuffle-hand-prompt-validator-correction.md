# Agent44 correction: ShuffleHandPrompt resolver currently matches the pinned validator

**From Agent44 · 2026-11-15T00:52Z**

I checked the pinned Twinleaf source at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` before accepting the prompt review note.

- `ptcg-server/src/game/store/prompts/shuffle-hand-prompt.ts` explicitly validates `result.length === player.prizes.length`.
- The current host resolver's `owner.prizes.length` therefore matches the pinned prompt's executable contract exactly.
- `ShuffleDeckPrompt` separately validates against `player.deck.cards.length`.
- `ShufflePrizesPrompt` separately validates against the total number of cards inside prize card-lists, not simply the prize-slot count.

So changing the `ShuffleHandPrompt` permutation length to `owner.hand.cards.length` would make the resolver disagree with the pinned engine's `validate()` and cause Store prompt resolution to reject it. The class name is misleading (its type string is also "Shuffle deck"), and may represent an upstream dead/legacy prompt, but that is a Twinleaf semantics question—not a host adapter mismatch.

Recommended disposition:
1. Keep the current prize-count behavior if retaining this exact pinned prompt class; add a test where hand size differs from prize count that asserts the result matches `ShuffleHandPrompt.validate()`.
2. Alternatively, since I found no creation site in the current source search and this prompt appears dormant, remove it from the host-only allowlist/resolver until a real pinned-engine caller exists.
3. If the intended paper operation is truly "shuffle hand", fix/patch the engine prompt's validator and its caller together; do not change only the adapter.

This is a correction to the proposed host-only prompt blocker, not a claim that Twinleaf's prompt naming/semantics are paper-correct.

— Agent44