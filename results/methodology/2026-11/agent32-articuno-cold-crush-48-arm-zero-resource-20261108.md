# Articuno Cold Crush A/B/A: native zero-resource result, 16 original physical deals

**Agent32, 8 November 2026.** This result reviews the *original preregistered* rank-3 Articuno-GX CES 31 policy treatment against original rank-1 Shadow Rider on the repaired, tested branch. It does not represent a new post hoc seed search or claim paper-qualified gameplay.

## What actually happened

The [manual CI run 42376840950](https://github.com/FlareZ123/experiment-01/actions/runs/42376840950) **succeeded** at `b8bbacd3df4abf1a843fd40364084de346c21c55`. Artifact **13575634872** (`agent32-rank3-articuno-cold-crush-aba`, ZIP sha256 `adaaa57649beff5c024f5fc20c6707ef50466133ea1d2e8bc13099f5645d45a2`) contains the complete 48-arm native ledger. The embedded JSON sha256 is `4b9f1ea62418d7cbf0519c1ee7740a1c2f2306fceaa3cba356edf7c56db3e588`. The only source code committed by Agent2's repair was the runner, its acceptance tests, existing manual workflow, and registration note. Agent32 subsequently merged the tested repair to main through [PR 32](https://github.com/FlareZ123/experiment-01/pull/32), squash commit `95cbfd3e471c26f4939a9f7f9ba7f109d46c7896`.

| Metric | Observed |
| --- | ---: |
| Authenticated original physical seed/seat groups | 16 |
| A-observe / B-intervene / A-repeat attempts | 16 / 16 / 16 |
| Native terminal attempts / action-cap attempts / engine errors | 36 / 12 / 0 |
| Distinct groups with Articuno-GX owner Ability Confirm | **2 / 16** |
| Individual Confirm observations (one per A/B/A variant) | **6** |
| Positive one-Water Cold Crush proposals | **0** |
| Actual accepted Articuno Legendary Ascent confirmations | **0** |
| Physical Water transfers / Cold Crush-GX attacks from treatment | **0 / 0** |
| Groups matching both full physical and original-source deal fingerprints | **16 / 16** |
| Groups with A1/A2 identical native action traces | **16 / 16** |
| Groups with **all A/B/A** root-action ledger SHA256s identical | **16 / 16** |
| Groups with **all A/B/A** terminal/cap status and winner identical | **16 / 16** |

At source physical **seat 1**, seed **290151**, the rank-3 Articuno hand-play Confirm was observed on turn 11, facing an opponent Active with **4** attached Energy. Source had **zero** transferable Basic Water in play, and the proposed policy correctly declined. At source physical **seat 0**, seed **290153**, its Confirm appeared on turn 14, facing **5** opponent Active Energy, with **zero** transferable owner Basic Water. The proposed policy again declined. Both arms were repeated once per A/B/A variant; these six recorded confirmations represent exactly two unique deal exposures.

Across the 16 unique treatment games, 12 naturally reached a native engine terminal (7 winners as native seat 0 and 5 as native seat 1) and 4 reached the 260-root cap. Seat numbers alone cannot be interpreted as rank-3 win counts without each deal's source/actor seat; importantly, all outcomes are identical across A/B/A and therefore are **not treatment wins**. All 48 rows and the 16 complete matched groups were preserved, with `acceptance.passed=true`.

## Decision and actionable successor

**Retire the current threshold-only one-Water Cold Crush policy from the near-term shared-policy release queue.** Lowering the opponent-Active-Energy threshold from 3 to 1 or 2 does not change either observed negative, because the missing resource is owner Basic Water, even as the opponent has 4–5 Energy. More runs of the unchanged Confirm-only overlay will not fix this failure mode.

A *new* treatment, if strategically prioritized, must change **earlier, source-owned Water Energy staging** before the CES Articuno is played, and must show a paper-valid owner Energy attachment or accelerator, correct recipient, physical custody, actual Legendary Ascent Confirm and one-card transfer, GX opportunity cost, Cold Crush settlement, opponent reply, and the source's next own-turn decision. Freeze new physical deals and register that different policy as a distinct intervention; do not reinterpret these zero-intervention arms as evidence for or against the one-Water attack's strategic strength. A native prepared-board Cold Crush fixture already establishes that the card-effect sequence is executable on a supplied board, but it does not establish that real Aichi source play reaches that board.

The currently more consequential common-policy frontier is the independently documented same-deal paid-Perfection `Pass -> UseAbilityAction` native terminal reversal ([Agent24 result](agent24-v8-paid-perfection-native-eight-arm-20261108.md)), subject to its own independent paper and opponent-policy qualification. Prioritize whole-game, original-source conversion over further isolated Articuno threshold sweeps.

## Reproduction and limits

Registration: [rank-3 A/B/A](../agent32-rank3-articuno-cold-crush-aba-registration-20261107.md). Code: `simulation/evaluation/agent32-rank3-articuno-cold-crush-aba.cjs`; policy: `simulation/twinleaf/agent32-articuno-cold-crush-policy.cjs`; choice helper: `simulation/twinleaf/agent32-articuno-cold-crush-choice.cjs`; acceptance tests: `tests/agent32-rank3-articuno-cold-crush-aba.test.cjs`. All candidate and original source 60-card lists were unchanged across A/B/A. The repaired 48-arm study is a bounded native-policy experiment. It has zero competitively qualified games, no full Top-32 opponent coverage, no evidence of the 99.5% target, and no basis for a paper-game win-rate claim.
