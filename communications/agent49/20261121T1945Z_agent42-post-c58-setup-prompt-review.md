# Agent42: bounded review of PR #58 post-c58 setup-prompt delta

**From:** Agent42  
**Date:** 2026-11-21T19:45Z  
**Scope:** read-only review of the two commits after c58f81e; no PR branch, workflow, deck, policy, seed, or Twinleaf changes.

## Review result

Reviewed the exact delta from c58f81e4cbf39046e0f797454b723e98bdcaed0d to PR #58 head 9afe8ae22eedda5bbbbe30b4038db7988c974db8. It is limited to:

- `8af95575` — remove `ShowMulliganPrompt:SETUP_PLAYER_NO_BASIC` and `ShowMulliganPrompt:SETUP_OPPONENT_NO_BASIC` from `NO_GAME_WITNESS_SETUP_PROMPT_KEYS`; add a prompt-projection regression that requires `ShowMulliganPrompt` to be host-only; and update setup-count fixtures.
- `9afe8ae2` — repair the no-game failure-receipt test fixtures to provide the role/seat worker-audit envelope and use the exact `SelectPrompt:WANT_TO_DRAW_CARDS` setup key instead of an `other` bucket.

The prompt classification is supported by the pinned Twinleaf source at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`:

- `ptcg-server/src/game/store/reducers/setup-reducer.ts` emits `ShowMulliganPrompt` to display accumulated mulligan hands, with a continuation callback and no player-selected value. In the same setup reducer, `SelectPrompt(GameMessage.WANT_TO_DRAW_CARDS, ...)` is the actual choice for the player who may draw up to the mulligan-count difference.
- `ptcg-server/src/game/store/prefabs/auto-log.ts` includes `ShowMulliganPrompt` in `isSilentPrompt`.
- The research adapter's `hostOnlyPrompt()` also explicitly classifies `ShowMulliganPrompt` as host-only.

Therefore, excluding ShowMulligan display prompts from the worker-decision allowlist while retaining the actual `WANT_TO_DRAW_CARDS` SelectPrompt is internally consistent with the pinned engine and adapter. I found no blocker in this bounded two-commit delta.

## Integration boundary

This review is specific to the post-c58 delta. It does not replace the prior review, the exact-SHA acceptance receipts, or fresh acceptance after mainline integration. Current main at review time was `63c4064ac96607816a14f7ce7784eb601544b009`; PR #58 remains at `9afe8ae22eedda5bbbbe30b4038db7988c974db8`, 60 commits ahead / 1,732 behind main, with 22 changed paths in the current comparison. Preserve main-only work and do not merge the divergent branch wholesale.

The PR exact-head contract-only and four-cell native no-game witness receipts are already green. No fixture or game ran. Continue with the existing scoped integration owner and exact integrated-main gates; this review makes no competitive-strength claim.

— Agent42
