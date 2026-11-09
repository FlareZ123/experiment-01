# Original Aichi rank13 source Dialga-GX Shred: real paid KO and first source Prize

**Agent26 | 9 November 2026 | true pinned native Store, two unchanged candidate 60s, retrospective owner decision fixture.** All results are developmental and no game is certified as paper-qualified.

## Decision-relevant result

A direct, physical attack choice changed the outcome of a frozen source Regidrago line. The original source had already accepted a held Marnie on its second owner turn in a prior preregistered A/B intervention and later equipped its Dialga-GX UPR with **two Basic Fire and Double Dragon Energy**. On real native global turn53 against New Moon Lockbreaker v1, that source selected Overclock, a draw-only attack, while the opponent's 60-HP Unown AOR was Active without damage.

A registered **source-owned** strict local root option instead selected printed **Shred** (Metal+two Colorless, 80 damage, ignores target effects) under identical physical source deal and candidate policy. The pinned engine accepted the attack at **action ordinal230, global turn53**. The native settlement ledger records:
- Exact first differing event: original **AttackAction Overclock** → source **AttackAction Shred** at root230, actor seat1.
- Before Shred: opponent Active Unown AOR **0 damage**, with one Psychic Energy; source Active Dialga-GX UPR **100 damage**, 2 Basic Fire + Double Dragon Energy, Muscle Band.
- Immediately after root: opponent Unown AOR had **80 damage**, above its HP60. During the same attack's settled prompt chain, native root232 is a source **ChoosePrizePrompt**, root233 a candidate **ChoosePokemonPrompt** replacement, and root235 records completion. The native source takes **one genuine Prize**.
- Final source Prizes remaining in matched New Moon control/treatment: **6 → 5** at the same 260 native-root action cap. Candidate has four Prizes remaining in both.
- Recorded source attack names: control Overclock×4; treatment **Shred×1, Overclock×3**. The first Shred and its printed KO settle; all later root choices and opponent replies can legitimately diverge.

| Original opponent and candidate | Source-only Marnie control | Marnie plus source T53 Shred |
| --- | --- | --- |
| Rank13 vs original rank1 champion-reference 60 | Source no attacks, native cap, Prizes [6 candidate,6 source] | **Identical all 260 roots**, no Shred opportunity; capped 6–6 |
| Rank13 vs New Moon Lockbreaker v1 60 | Source 4 settled Overclock draw attacks, capped, [4 candidate,6 source] | Source 1 Shred KO plus 3 Overclock, capped, [4 candidate,5 source] |

Both original source physical openings match preregistered fingerprint **`9f7be638cc3c3bfc59f130092ca8ef55221ca506d6da9bce2cfdc9e80752547f`** and the genuine same source first-player seat in all four arms. Pinned native physical-zone integrity passes. Importantly the source T53 attack was a **non-GX** attack with physical energy and a real KO; it is not an engine's predicted or hypothetical KO. Both games still cap long after an actual 25min official Aichi game would normally be adjudicated.

## Reproducible experiment

Preregistered [source-only exact local Shred substitution](../../aichi-2026/registrations/agent26-rank13-source-dialga-shred-on-unown-20261109.md) before native run, registration commit `6bf03a9b695848dcc01d5d4592117e3a3cd7579f`. Retrospective physical seed `1486727692` chosen by looking at the earlier frozen control; it is not held-out field evidence. Two candidates retain their exact printed 60s and identical real candidate decision algorithms, all two-seat source policies and native roots before turn53 remain fixed.

- Compiled Twinleaf Git submodule pinned **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**, with same three source-profile corrections as the previous Marnie paired run.
- Full manual [GitHub Actions run 42571267461](https://github.com/FlareZ123/experiment-01/actions/runs/42571267461) **SUCCESS**, branch head `52d9ed5ebfe4bf157ca511486e550dd157edc9b5`, archived [full raw four-arm artifact 13653352888](https://github.com/FlareZ123/experiment-01/actions/runs/42571267461/artifacts/13653352888), ZIP SHA256 **`eb6ba01427da498ae3cca8a7550bba3896ff6f58789ca15a245b18eb526bf386`**.
- [Strict source-only owner-view chooser](../../../simulation/twinleaf/2026-11/agent26-rank13-source-dialga-shred-frontier.cjs), [paired real Store runner](../../../simulation/evaluation/2026-11/agent26-rank13-source-shred-native-pair.cjs), [four pure tests](../../../tests/2026-11/agent26-rank13-source-dialga-shred-frontier.test.cjs), plus source-seat opt-in through existing [Agent34 actor adapter](../../../simulation/twinleaf/agent34-actor-only-root-policy.cjs) and [Agent41 runner](../../../simulation/evaluation/agent41-bilateral-v2-development.cjs). Tests passed actual Node22 CI before native test. No new auto CI and no vendor modifications.
- The old [Marnie source policy](agent26-rank13-actual-source-marnie-paired-native-20261109.md) is enabled in both arms. Only one new `sourceScopedDialgaShredT53` intent differs; it was physically accepted. Output rows preserve first difference, source attack settlement, actual source Prize retrieval and subsequent candidate promotion. Both candidate deck identities remain unchanged.

## What this solves and what remains

This fixes a **real missed lethal source attack** on a genuine original Aichi 60 under a frozen physical state. A source AI that simply uses the first printed payable attack can spend turns drawing with Overclock even while Shred is both paid and lethal. Its opponent's apparent robustness was sensitive to the order in which the source bot chose attacks.

The present fix is a narrow, turn53/printing-specific experiment, **not an adaptive general deck-winning policy**. A generally usable solution should select a physically payable, nominally lethal printed move from any source's public board without knowing hidden opponent cards and verify Store payoff. Agent49 already has [source-independent, actor-only potential-KO ranking](../../../simulation/twinleaf/agent49-actor-potential-knockout.cjs) with source-only runner option. That existing module should be tested as a structural replacement under the same fixed 60s and same physical opening; unlike the targeted T53 override, it can address missed KOs across matchups and turns.

Time remains the larger issue. Global turn53 is far outside a realistic 25-minute round, and the source still failed to set up Regidrago VSTAR Apex Dragon for meaningful early pressure. No official clock has been measured and **no paper-qualified game, no 99.5% achievement, no selected final fixed 60** follows from these developmental trajectories.
