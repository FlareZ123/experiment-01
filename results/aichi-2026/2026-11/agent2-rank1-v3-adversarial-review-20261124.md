# Agent2 — rank-1 Shadow Rider policy v3 adversarial source review

**Reviewed main head:** `589248c17f85b1bb6d67effe3661a961a6d2ebe1`  
**Policy blob:** `1c8aef18c6ddd2b45f5aeaa2bf958169301e7dcd`  
**Policy test blob:** `471c998a5bdd121df1c8f786a77d1ac64dc9dabb`  
**Pinned Twinleaf:** `vendor/twinleaf` at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`  
**Review time:** 2026-11-24T12:54:42.161Z

## Scope and evidence boundary

This is an adversarial source/contract review of the current main policy and its tests. It is not a native-game result, a matchup result, or a competitive-strength certificate. I did not change the deck, run a game, or execute the policy test suite. The current policy test file contains 80 tests and has zero `Quick Ball` references.

The published v3 contract report is tied to research revision `8e2c6fe292076cc46099f05fa9f99af8bf0dd6df`, policy blob `e8645a82b1658b30c39115a9905ab922483cffdc`, and test blob `58e29f1b72af9547bae1370fff2d823c1bd255b7`. The current main policy/test blobs above differ, so the earlier receipt does not certify these current blobs. Re-run the contract suite on the current head after the focused fixes below.

## Finding 1 — Quick Ball's mandatory discard is scored as a search

**Confidence: high; directly reproduced from the pinned source and current policy control flow.**

The pinned Quick Ball implementation is `vendor/twinleaf/ptcg-server/src/sets/09-sword-and-shield/set-sword-and-shield/quick-ball.ts`. It:

1. Opens a `ChooseCardsPrompt` with `GameMessage.CHOOSE_CARD_TO_DISCARD` over the player's hand, `min: 1`, `max: 1`, `allowCancel: false`.
2. Discards the selected hand card.
3. Then searches the deck for a Basic Pokémon.

The rank-1 source list itself contains **one Quick Ball FST 237** (`results/aichi-2026/full-decklists.json`). The pinned Twinleaf reprint class `QuickBallFST` extends `QuickBall` in `ptcg-server/src/sets/09-sword-and-shield/set-fusion-strike/other-prints.ts`, so the exact Aichi printing inherits this same mandatory discard prompt. In the current policy, `promptDecision()` around lines 1286–1310 recognizes Quick Ball as a known card-combination source, but only the Mysterious Treasure + hand-source branch uses `discardChoiceScore()`. Quick Ball falls through to `cardSearchScore()`, the ranking intended for cards desired from a search. That score gives high priority to Shadow Rider V / VMAX copies when they are desirable retrievals. On Quick Ball's first prompt, those cards are payment choices, not search targets. This can discard a core Pokémon; if all choices are scored below the minimum, the current fallback is also Mysterious-Treasure-only, so the mandatory Quick Ball prompt can be abandoned.

**Focused correction:** branch on the exact Quick Ball source and prompt phase (effect name, `CHOOSE_CARD_TO_DISCARD`, hand source, actor ownership/visibility, and the 1-of-1 non-cancelable bounds). Use a discard-specific ranking with a forced least-bad legal fallback for this mandatory payment. Keep the subsequent deck-search prompt on `cardSearchScore()`. Add positive/negative cases: sole Shadow Rider V plus a disposable card; duplicate VMAX; a hand where every card is normally protected; and the separate Basic-Pokémon search prompt.

## Finding 2 — Climactic Gate lock detection misses Silent Lab

**Confidence: high; card text, field inventory, and current code agree.**

Current `isGateAbilitySuppressed()` (around line 253) checks Path to the Peak, Wobbuffet, Iron Thorns, and Garbodor. Its Stadium branch only recognizes Path to the Peak. However, `pathLockStatus()` (around line 474) already recognizes both Path to the Peak **and Silent Lab**.

Silent Lab PRC 140 says each Basic Pokémon in play, in each player's hand, and in each player's discard pile has no Abilities. Radiant Eternatus SWSH12pt5 105 is a Basic Pokémon, so its Climactic Gate is suppressed while an effective Silent Lab is in play.

Silent Lab is also a demonstrated Aichi-field card: the source-field Stadium census records **five copies in ranks 9, 13, 15, and 32** ([Agent1's whole-field census](agent1-source-field-stadium-census-reconciliation-20261124.md); see also [Agent46's Stadium coverage](agent46-aichi-stadium-field-coverage-20261114.md)). Those copies are in other Aichi lists, not in the rank-1 Shadow Rider list; they do not prove the candidate deck will play Silent Lab. They do establish a real Expanded/Aichi card identity that a candidate could use. Whenever the candidate side has an effective Silent Lab in play, the rank-1 policy can decide to play Radiant Eternatus expecting a Gate line that the Stadium actually prevents.

**Focused correction:** reuse `pathLockStatus()` for the Gate decision, treating `true` as a lock and `null` as unknown/fail-closed. Add a Gate-specific Silent Lab test with a Radiant Basic and a test where Stadium effects are globally disabled.

## Finding 3 — Gate's Path-to-the-Peak exception reads only the actor's suppression epoch

**Confidence: high; verified against the exact pinned Twinleaf revision.**

Current `isGateAbilitySuppressed()` reads only:

`own.publicTurnRestrictions.stadiumAndToolHaveNoEffectTurnsRemaining`

and treats Path to the Peak as live unless that actor-side value is positive.

The pinned engine does not scope this effect to the actor. In `vendor/twinleaf/ptcg-server/src/game/store/prefabs/stadium-effect.ts`, `IS_STADIUM_EFFECT_BLOCKED()` returns true when **any** player has `stadiumAndToolHaveNoEffectTurnsRemaining > 0`. The pinned `Player` source also documents that Stadium/Tool effects are disabled globally via any player still holding the flag. Both pinned `path-to-the-peak.ts` and `silent-lab.ts` call this helper before applying their Ability lock.

Thus, with Path to the Peak in play, actor epoch 0, and opponent epoch 1, the engine suppresses the Stadium effect but the current policy still treats Path as a live Gate lock. The existing `pathLockStatus()` already checks both actor and opponent epochs, returns false if either is positive, and returns null if the relevant epoch is unknown.

**Focused correction:** share the existing two-player `pathLockStatus()` predicate rather than maintaining a second, actor-only interpretation. Add the opponent-only epoch case; retain a conservative unknown-epoch case.

## Finding 4 — Gate lock identity coverage also misses Active Klefki and Garbodor LTR 68

**Confidence: high; verified from the exact card-pool texts, source identities, and current matcher.**

Two additional source/code mismatches were cross-checked after the initial review:

- **Klefki SVI 96:** its `Mischievous Lock` works while Klefki is Active and removes Abilities from Basic Pokémon in play on both sides, except Mischievous Lock itself. Radiant Eternatus is Basic, so an Active Klefki on the candidate side suppresses Climactic Gate. The current `isGateAbilitySuppressed()` has no Klefki identity or Active-Klefki check.
- **Garbodor LTR 68:** its `Garbotoxin` text is identical to Garbodor BKP 57 and has the same Tool condition. The current `PRINT.garbodor` regex matches only `Garbodor BKP 57`, so it misses LTR 68 even when a Tool is attached. The exact 29-list source inventory has rank 8 with LTR 68 ×2 plus Tools, and rank 16 with LTR 68 ×2 + BKP 57 ×1 plus Tools. The Gate predicate therefore misses rank 8 entirely and misses rank 16 whenever the Tool is attached to an LTR copy.

The same source inventory records Klefki SVI 96 in ranks 4 and 17. These are card-presence facts from other Aichi lists, not evidence that the rank-1 deck itself contains them or that a lock was active in a game. They establish additional legal lock identities a candidate could present to the rank-1 policy.

**Focused correction:** recognize Active Klefki with its Active-only scope; recognize both Garbodor LTR 68 and BKP 57 while preserving the attached-Tool requirement. Add tests for Klefki Active versus Benched, and for Tool-attached LTR/BKP Garbodor versus no-Tool cases.

## Evidence qualification — Ability suppression status is not currently observed as resolved

`simulation/twinleaf/actor-observation-contract.cjs` initializes each visible Ability suppression row as `suppressed: null`, `reasonCode: null`, `sourcePrinting: null`, explicitly marking the status unknown. The v3 runner binds this contract directly as `observe: actorObservation`. The policy's `abilityIsSuppressed()` treats only an explicit `true` as suppressed, so a visible Wobbuffet / Iron Thorns / Garbodor is conservatively presumed live when the observation's suppression status is null.

That conservative choice can be reasonable for declining a risky Gate, but the report should not describe those sources as *observed unsuppressed*. Describe the actual policy behavior as “visible source conservatively presumed live unless an explicit suppression fact is present,” and keep the claim separate from a native resolution test.

## Recommended acceptance cases

1. Quick Ball discard payment and subsequent deck search are distinguished by prompt phase and source zone; mandatory payment always returns one legal token.
2. Silent Lab in play suppresses Radiant Eternatus Gate; the same Stadium is not treated as effective when the pinned global Stadium/Tool suppression epoch is active.
3. Path to the Peak with only the opponent epoch positive does not suppress Gate; unknown epoch remains fail-closed.
4. Active Klefki suppresses Gate; Benched Klefki does not; Tool-attached Garbodor LTR 68 and BKP 57 suppress Gate, while no-Tool copies do not.
5. Existing Active-only Wobbuffet / Iron Thorns cases remain intact.
6. Re-run contract tests against the exact current policy/test blobs; do not treat the older 8e2c receipt as evidence for later blobs.

**Disposition:** send these focused corrections to the policy owner before treating v3 as an independently reviewed Aichi opponent policy. No decklist change or competitive win-rate conclusion follows from this review.

— Agent2
