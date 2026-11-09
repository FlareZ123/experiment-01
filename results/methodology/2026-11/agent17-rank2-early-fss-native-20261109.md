# Original rank2 Vileplume: late-pass bypass with real turn-one Forest Seal Stone

**Agent17, 9 November 2026.** Single matchup, retrospective native development, *zero paper-competitive qualifying games*. The original 60-card Vileplume source, both frozen champion and Hood Shield 60s, their exact originally archived physical source deals, and the native opponent policy are unchanged. This tests a same-deck actor action, not a deck revision.

## Why the source-matched early root matters

Original Hood Shield A first-turn owner hand contained the exact printed `Forest Seal Stone SIT` along with `Stealthy Hood UNB`. Its Active `Shadow Rider Calyrex V CRE` had a free Tool slot. Historical canonical actor made no useful Stone proposal before passing. Generic Tool ranking recorded Stone's theoretical attachment but declined its negative local score, despite the option to gain a full-deck Star Alchemy search immediately and use the turn's remaining actions.

Added an **opt-in, candidate-seat-only** public/owner-visible root in `simulation/twinleaf/2026-11/agent17-forest-seal-early-root.cjs`: when the actor has a named Forest Seal Stone, a Tool-eligible own Pokémon V, no spent public VSTAR power, and an owner deck with cards, it proposes a physical `PlayCardAction` onto a free actual Tool slot. After the Stone is attached and whenever no other supported root action remains, it proposes `UseAbilityAction('Star Alchemy')` targeting that same actual public holder. The native Store processes genuine search prompts, actual payment and rules. The actor does not receive opponent concealed hand, deck order or Prize identities. This is a deliberately narrow intervention, not a universal claim about the optimal turn-one target.

An initial native CI attempt `42590433255` placed the physical Stone correctly on original Hood A turn one, then exposed a missing research audit category for the new Ability root. The previous `rootPhysicalWitness` asserted the intent must be an `attack`. Fixed the *research-side* witness to recognize actual **public VSTAR-use state transition**, with three synthetic regression tests, without altering the Twinleaf submodule. The corrected real-native CI [42591200024](https://github.com/FlareZ123/experiment-01/actions/runs/42591200024) passed all 25 targeted pure tests and completed four 640-action original-source replays. Its [artifact 13661755992](https://github.com/FlareZ123/experiment-01/actions/runs/42591200024/artifacts/13661755992) preserves full root ledgers, actual source matching, complete game outcomes and the action audit.

| Original rank2 physical seed and seat | Historical no intervention at root640 | Forest Seal early alone | Actual Stone/Star Alchemy root |
| --- | --- | --- | --- |
| Champion A, seed50726483 | Source native win T83/root337, [6,6] | Source native win T79/root329, [6,6] | Stone at T49/root208, Star Alchemy T49/root209 |
| **Hood A**, same source physical deal | **Source native win T83/root337, [4,6]** | **Hood native win T55/root271, [0,6]** | **Stone at T1/root9, Star Alchemy T1/root10** |
| Champion B, seed1073445688 | Source native win T87/root365, [6,6] | Source native win T87/root365, [6,6] | No Stone root within game |
| Hood B, same source physical deal | Source native win T67/root313, [6,2] | Source native win T65/root306, [6,3] | Stone at T27/root120, Star Alchemy T27/root121 |

Hood A's exact first-turn chronological native root: T1/R7 bench `Trevenant & Dusknoir-GX`, R8 attach `Psychic Energy`, **R9 attach `Forest Seal Stone` to Active Shadow Rider Calyrex V**, **R10 use actual `Star Alchemy`**, R11–13 settle native wait/choose-card/shuffle prompts, R14 bench `Girafarig`, R15 Pass. The source opponent still follows its original policy and the initial shuffled setup digest is unchanged. The Hood A native result ends with the candidate taking all six Prizes at T55. The current source native opponent only attacked once in this path, compared with 15 attacks against champion A; the altered board/decision trajectory contributed substantially to different late-game dynamics.

## Interpretation and limitations

This gives a concrete counterexample to treating the local proposed Tool's short-term score as its strategic value: a held Stone can generate a paid once-per-game wildcard search that affects subsequent root actions and bench geometry. The initially accessible card became valuable because the actor *actually used it* under Store validation. This also supports early high-value VSTAR choice before opponent lock interrupts future Item/Supporter connectivity.

But native results are **not paper-game win rates**. The final T55 is far beyond a plausible Aichi full-game clock. Star Alchemy's choice target is still selected by the generic native prompt policy and is not proven optimal; no new independently held-out source seeds were tested; later randomness and simulator policy differences can amplify the counterfactual. This is a conditional same-source causal development experiment and should not be added to the original 116-game paired denominator. The 29/32 available source field remains incomplete and the full29 Hood-versus-champion sharp interval [-9,+13] remains unaffected.

## Implementation and follow-up

- [owner-visible early FSS decision](../../../simulation/twinleaf/2026-11/agent17-forest-seal-early-root.cjs), [root-native physical witness](../../../simulation/twinleaf/agent5-owner-root-slice.cjs), [pure root tests](../../../tests/2026-11/agent17-early-forest-seal-root.test.cjs), [VSTAR public witness tests](../../../tests/2026-11/agent17-forest-seal-vstar-native-witness.test.cjs).
- [Native paired runner](../../../simulation/evaluation/2026-11/agent21-rank2-long-control-native.cjs) with `early_forest_seal` default false on the existing [manual workflow](../../../.github/workflows/agent21-rank2-long-control-native.yml). This option does not affect the frozen baseline unless selected.
- Joint interaction of early Stone and late deckout/pre-attack rescue is currently being run separately on the same original source deals. Use actual root actions and outcomes rather than treating separate one-factor improvements as additive.
