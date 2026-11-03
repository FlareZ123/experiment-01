# Agent20 natural original-rank6 Guzma & Hala owner payment custody replay (3 November 2026)

**Classification:** compiled historical source-game receipt, **not** a prospective deck-ranking sample. Exactly **zero** competitive paper games qualified, **no** selected fixed 60, and **no** 99.5% finding.

## Evidence and immutable run

- [Compiled manually dispatched Actions run 41656514139](https://github.com/FlareZ123/experiment-01/actions/runs/41656514139), **SUCCESS**, Node 22 and pinned Twinleaf **a9905a76a6c4103ba4b6cb9a49e86bad795c5c05**. Branch: `research/agent20-ghala-natural-custody-replay-20261103`, head **464a8ee216a0acd68c3cd2807230114423ea265e**.
- [Raw 2-file archive, artifact 13240596067](https://github.com/FlareZ123/experiment-01/actions/runs/41656514139/artifacts/13240596067), ZIP SHA-256 **86879d4a24837449f791dd54f0a3bf8b240df67ab642cbf88c95658403cdafad**. Files: `agent20-frozen-rank6-canary-v1-output.json` and `agent20-ghala-natural-custody-replay-v1-output.json`. No attempt was filtered.
- Newly created replay code: [read-only Store wrapper](https://github.com/FlareZ123/experiment-01/blob/research/agent20-ghala-natural-custody-replay-20261103/simulation/evaluation/agent20-ghala-natural-custody-replay.cjs) on the linked branch, with [eight focused fail-closed pure tests](https://github.com/FlareZ123/experiment-01/blob/research/agent20-ghala-natural-custody-replay-20261103/tests/agent20-ghala-natural-custody-replay.test.cjs). It reuses Agent7's independently tested reversible [G&H owner-zone observer](../../../simulation/twinleaf/agent7-ghala-owner-zone-lineage.cjs) by copying that exact Git blob into the replay branch, and the previously frozen Agent20 **v1 86-option policy** with its old original source roster and four registered games.
- CI passed **24/24 pure tests** (eight new) and executed four authentic original-source games, two candidate physical seats, and both unchanged candidate 60s. The existing source-pair postgame audit passed.

The v1 source profile, precommitted seeds, and existing selected policy are **unchanged**. Only the read-only outer Store observer and archive linkage are new. This is a controlled replay of **historical selected deals**, not a registered fresh opponent-policy trial and never a competitive win denominator.

## Natural physical-payment observation

A single real `Guzma & Hala CEC` enhanced payment prompt appeared in each of the first two registered native games, both with original **rank6 Iron Thorns in physical source seat B** and the same true original physical deal fingerprint:

`ea76cd9d80563dcaf904b404b39b64c3c9aed8ea5a1bae9b9b843221a853c82f`

| Original rank6 vs candidate | G&H native PlayCard root | Source choice prompt | Original-owner hand before → after | Original-owner discard before → after | Printed two-card payment custody |
| --- | ---: | ---: | --- | --- | --- |
| Champion-reference (6:0:A) | 21 | 23 | 8 → 6 | 0 → 2 | **Verified** |
| New Moon v1 (6:0:A) | 19 | 21 | 8 → 6 | 0 → 2 | **Verified** |

Both *actual* native observer receipts recorded selected two **distinct object-identical owner-hand cards**: `Crushing Hammer POR` and `Team Flare Grunt XY`. Both were in the owner's real hand **and** the native prompt's source at dispatch. Immediately after the synchronous real `ResolvePromptAction`, both references were absent from hand and newly present in the same owner's discard. The Store dispatch completed. Observer game ordinals 0,1 map to source seat B; global turn 3 in both. All two observed source payment prompts passed; **zero** observed invalid source payments. The other two registered games did **not** exhibit a source G&H payment prompt and remain `NOT_ENCOUNTERED` for this particular check. Observed zero failures is not a general payment-correctness finding.

The original prompt archive independently corroborates these exact two cost selections as native `ChooseCardsPrompt` `min:2,max:2`. It also shows the subsequent **Thunder Mountain Prism Star LOT + Double Colorless Energy SUM** search, native play of those two cards, actual Iron Thorns `Volt Cyclone` attack (root 30 and 28), source Prizes 6→5, and the candidate's immediately following native **Pass** (root 36 and 34). The physical paid-zone receipt is now joined to the previously archived resource-to-attack-to-Pass line; the candidate Pass is **not a certified competent response**. The line's source attack/effect and owner-information/legal-prompt gates remain independently unqualified.

## Read-only A/B parity: full physical native transcript

Independently downloaded prior unchanged [frozen paired CI artifact 13151571539](https://github.com/FlareZ123/experiment-01/actions/runs/41465829225/artifacts/13151571539) and compared its `agent20-frozen-rank6-canary-v1-output.json` to this replay's file programmatically. The nested **`rawNativeResult` JSON objects are exactly equal**, as are the **`releaseDisposition`** and **`sourcePhysicalPairAudit`** objects. The top-level `runtime` field differs because the new checkout commit identifies the observer branch; expected.

For each source-seat pair, the independent original-deal comparator still returns exact physical deal equality across the two fixed candidate 60s:

- Candidate physical seat A/source B, seed 430745698: `ea76cd9d...`, both.
- Candidate physical seat B/source A, seed 1207371343: `14b8f7c9...`, both.

Thus this specific added passive observer did **not** change recorded game decisions, setup, native outcomes, attacks, or root traces. The equality is an empirical A/B observation on these four historical attempts, not a proof that all hypothetical states are unaffected.

## Qualification limits and next work

The original historical release still says `PAPER_PAYMENT_VERIFIED:false`, `SOURCE_PAYOFF_WITNESSED:false`, `OPPONENT_CONTINUATION_WITNESSED:false`, `COMPETITIVE_GAME_QUALIFIED:false` for whole-game qualification. **Do not promote any of these** because a single printed two-card G&H cost's natural hand-to-discard transition is now positive. The native engine separately accepted paper-invalid *zero or one* payments in Agent30's prepared Store tests; this observer detects those but does not veto them. A defensive paper guard is still needed for future selected policies, and other native prompts remain unaudited.

The current observer associates its sequential live Store game ordinal with the frozen entrypoint's ordered trial rows; the selected payment cards, original actor seat, global turn, original physical deal and root/native-prompt records independently corroborate the two positive matches here. A general-purpose release should use an explicit trial ID injection rather than relying solely on Store allocation order. A returned native terminal has no actual Aichi 25-minute match clock.

**Next decision-changing work:** ship one actually selected **generic paper-eligibility / payment-aware** two-seat actor policy for rank5, rank11 and rank6 original sources, preserving these G&H natural paid events, the rank5 after-first-turn Battle VIP Pass false offers, the existing Secret Box underpayment negative, and meaningful opponent continuation in one registered source-deal suite. That is broader than an individual root-custody positive control.

Original field admission is still **29/32** verified printed 60s (ranks 23,25,28 missing). The final fixed deck is unselected; aggregate win rate cannot be estimated from these developmental simulations.
## Follow-up independent reproduction and machine attestation (3 November)

The original frozen G&H custody observation was also established independently by Agent7 in [its 2 November source-payment-to-Pass report](../agent7-natural-rank6-ghala-custody-to-pass-reply-20261102.md), including two genuine physical payments. Agent20's new contribution here is an **independent controlled replay with 11 additional adversarial pure attestor cases** that machine-join original exact G&H PlayCard root, owner-source physical cost, native own-deck search, Stadium and Energy physical plays, declared Volt Cyclone, observed source Prize 6→5 and genuine candidate next Pass. All fields must agree before the narrow native-payoff receipt can be true. This is a reproducibility and evidence-contract contribution, rather than a newly discovered card interaction.

The attestor first passed on [compiled CI 41658760913](https://github.com/FlareZ123/experiment-01/actions/runs/41658760913), **35/35 tests, 2/2 source cost-to-native payoff chains**, source branch `research/agent20-ghala-natural-custody-replay-20261103`. It remains marked `competitivelyQualifiedGames:0`.

A subsequent independent **candidate turn4 Stadium counterfactual** added a detached cloned Store probe on those same exact frozen Pass decision states. Both candidates held a different-name Stadium, and both were independently accepted by native Store while the original game still chose Pass. Exact new Stadium physical custody and source Thunder Mountain Prism Star replacement into its Lost Zone were witnessed. See [separate results report](agent20-rank6-turn4-stadium-pass-native-clone-20261103.md).

Final compiled [CI **41661885607**](https://github.com/FlareZ123/experiment-01/actions/runs/41661885607) **SUCCESS** at commit `14a0e0a85633c4c825518b8c74c3e6cdedbfcdbd`, pinned vendor a9905a76, **43/43 tests**, all four historical arms, **2/2 G&H two-card custody**, **2/2 native G&H cost-to-payoff receipts**, **2/2 native Stadium counterfactual physical replacements**. Immutable raw [artifact **13241728820**](https://github.com/FlareZ123/experiment-01/actions/runs/41661885607/artifacts/13241728820), ZIP SHA256 `3148d22cfeb0809e3da52fb95148a59ffdc2c8be2b89dd3259b787b2b0b3535f`. Independent programmatic comparison to older untouched archive **13151571539** found **complete native rawGame/result/release/pair JSON equality**, with only top-level checkout runtime Git metadata different. The cloned test bypasses all live-only auxiliary observer counters while retaining the original real Store's full payment guards. This confirms unchanged observed native game behavior in all four historical trials.

These additional positive mechanics **do not** certify complete original player paper legality, owner-information-safe policy competence, opponent optimal response, official match clock, or any overall game win statistic.

