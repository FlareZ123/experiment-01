# Agent 29: Girafarig LOT Get Lost has a pinned one-card mandatory-choice discrepancy

**21 October 2026. Evidence class:** cross-checked pinned upstream source and supplied Advanced Player's Rulebook, with a historical native trace as a motivating observation. **No corrected native game has been executed. No competitive win-rate inference.**

## Exact source-level finding

The pinned Twinleaf revision is `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` in `vendor/twinleaf`.

1. `ptcg-server/src/sets/08-sun-and-moon/set-lost-thunder/girafarig.ts` defines `Girafarig LOT`, printed `Get Lost` and `Mind Shock`. The former says *Put 2 cards from your opponent's discard pile in the Lost Zone*. Its reducer always creates a `ChooseCardsPrompt` with `opponent.discard`, `GameMessage.CHOOSE_CARD_TO_DISCARD` and `{min:2,max:2}`.
2. `ptcg-server/src/game/store/prompts/choose-cards-prompt.ts` defaults `allowCancel:true`, and `chooseCardsSelectionValid` rejects a non-null result shorter than `min`.
3. `ptcg-server/src/simple-bot/prompt-resolver/choose-cards-prompt-resolver.ts` sets the result to `null` whenever a built selection's length is below the native `min` (two). A one-card public discard therefore cannot be correctly chosen by that resolver for this attack. The prompt itself also accepts null because cancellation is enabled.
4. The provided *Advanced Player's Rulebook*, Section II D-04 **Choose**, says when fewer eligible things exist than the specified number, choose as many as possible. The attack's printed text contains no optional choice. For a discard pile containing exactly one eligible card, paper Get Lost must move that one card to the Lost Zone. If two or more eligible cards exist, the printed choice is mandatory.

This is a **source-level card/rule fidelity defect**, independent of opponent policy quality. It does not establish that any particular historical null prompt occurred with exactly one eligible target.

## Previously recorded native signal, with strict epistemic limit

The separate original rank-11/champion development replay is archived in
`results/twinleaf/agent29-rank11-girafarig-native-attack-prize-conversion-20261021.md`.
Under the v2 first-payable attack-policy treatment, after Girafarig's four settled Mind Shocks won three actual Prizes, Get Lost was chosen repeatedly against a 160-HP Squawkabilly ex without further damage or Prizes. Fourteen late ChooseCardsPrompt results were literally `null` in its old native artifact. Those events come from real Store prompt actions, but the archived format omits the **offered eligible-card count**, so one must not classify all fourteen as illegal. Zero-card targets, incomplete native prompt strategy, and inadequate opponent play are distinct cases.

## Smallest correction and compulsory regression

Implement a research-owned **default-OFF**, reversible hook scoped narrowly to: active exact printing `Girafarig LOT`, current actor-owned `CHOOSE_CARD_TO_DISCARD` ChooseCardsPrompt, input zone *the opponent's public discard*, empty native filter, and the original `min=2,max=2`. Do not patch unrelated discard-to-Lost-Zone cards or vendor files.

For an observed public source pool of size `n`, set the required selection count to `min(2,n)`, and prevent opting out of a mandatory nonempty selection. A both-seat actor-only response may deterministically choose that many original physical card references from the publicly visible source. The native action validator must accept the result, and an independent post-dispatch witness must verify every selected physical card leaves the opponent discard and enters the opponent Lost Zone. A card-name-only diff cannot prove identity preservation when duplicate printings exist.

Required native cases: zero eligible cards; exactly one; exactly two; at least three (exactly two moved); unrelated own-hand `CHOOSE_CARD_TO_DISCARD`; same prompt during a different Active Pokémon; other printing; prompt belonging to the opposite actor; speculative cloned State; and end-of-run prototype restoration after errors. Preserve an unpatched control and negative cases. Document the effect on actual completed prompt chains with frozen source deals before enabling the correction in the single canonical bilateral runner. Run only existing manually dispatched CI, never a push-triggered workflow.

**Open issue:** Other attack and card effects may have the same minimum-count defect. Broader corrective hooks require card-by-card printed rule checks, so this first fix should remain exact-printing restricted.

## Research impact

A permissive null or impossible singleton response can falsely erase a useful denial effect while preserving an apparently settled attack name. This contaminates tactical-policy comparison and any later win-rate claim. A confirmed rules-consistent singleton move is an important precondition, but it alone does not demonstrate better or competent opponent play.

**Status remains 29/32 recovered exact opponent 60s, zero competitively qualified games, no established 99.5% fixed deck.**
