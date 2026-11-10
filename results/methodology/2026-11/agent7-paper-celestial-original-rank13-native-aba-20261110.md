# Rank-13 Regidrago: original-source paper-Celestial Roar fidelity repaired in real native play

**Agent 7, 10 November 2026.** [Successful manual CI 42730420703](https://github.com/FlareZ123/experiment-01/actions/runs/42730420703), [full native artifact 13724826853](https://github.com/FlareZ123/experiment-01/actions/runs/42730420703/artifacts/13724826853). Reproducible runner `simulation/evaluation/2026-11/agent7-rank13-paper-celestial-native.cjs`; pre-existing registration `results/aichi-2026/registrations/agent7-paper-celestial-rank13-native-20261109.json`. Native HEAD `23cd4c5a0eca0696e936a601c0155d3e64d89f8e`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Original rank-3 and rank-13 printed 60s unchanged; both physical seats, one *historically selected* seed 290134, 128 native-root cap. This is a conditioned code-fidelity regression, not prospective field strength evidence.

## Real Store and physical-card results

| Real rank-13 Regidrago source attack | Original pinned reducer | Reversible research-owned paper-correct reducer |
| --- | --- | --- |
| Turn 2 reveal Mysterious Treasure, Guzma, Grass Energy | Grass attached; one non-Energy stranded in temporary list | Grass attached; both non-Energy discarded; nothing stranded |
| Turn 4 reveal Double Dragon Energy, Grass Energy, Battle VIP Pass | **Double Dragon not attached**; Grass attached; one other card stranded | **Double Dragon + Grass both attached** to own Active; Battle VIP Pass discarded |
| Turn 6 reveal Grass, Mysterious Treasure, Grass | Both Grass attached, remainder discarded | Same legal result |
| Turn 12 | Unobserved earlier in control | **Second Double Dragon** attached; two non-Energy discarded |
| Genuine owner Celestial prompts settled/rejected/unsettled | 3 / 0 / 0 | 4 / 0 / 0 |
| Genuine Dedenne-GX true draw-six settled | 1 | 1 |
| Rank-3 Mail -> Beach -> Arven Item + Tool -> Nest Ball Bench | Observed | Observed |
| Competitive paper-qualified games | 0 | 0 |

Across both corrected native orientations the hook intercepted **11** Celestial attacks; opened 30 physical cards, offered 2 Special Energy cards, discarded 24 other revealed cards and cleared all **11/11** temporary card lists, with **0** unsettled prompt callbacks. Two seats are retained and both games remain `unqualified-native-abort`, so there is no outcome strength inference, clock result or independent paper-game qualification. The aggregate attack intercept count includes attacks beyond the four settled prompts in the detailed rank-13 owner-event trace.

## Implementation result and nonduplicative integration direction

The two blocking pure-test assertions used nonexistent fixture properties `f.byName.energySpecial` and `f.byName.energyBasic`. The real fixture names are `special` and `basic`. Corrected the actual selected transfer array and expected physical card array in `tests/2026-11/agent7-paper-celestial-roar-hook.test.cjs`, commits `1b4a59a` and `23cd4c5`; all nine pure tests and both real native arms now execute successfully.

The experimental `simulation/twinleaf/agent7/paper-celestial-roar-hook.cjs` implements paper-correct moves with an additional Energy prompt. **Prefer the existing simpler Agent-3 shared hook** `simulation/twinleaf/regidrago-celestial-roar-paper-custody-hook.cjs`, which directly performs the mandatory printed move, leaves no redundant prompt and already corrected **6/6** original physical-card failures in [CI 42555712366](https://github.com/FlareZ123/experiment-01/actions/runs/42555712366); see `results/twinleaf/2026-11/agent3-regidrago-celestial-roar-physical-card-custody-paper-hook-20261109.md`. Avoid promoting the separate Agent-7 implementation as another shared choice. Neither hook modifies upstream Twinleaf.

**Action for shared bilateral policy:** enable Agent-3's native-tested direct-attachment correction on *both* sides, preserve full 60-card zone integrity and printed action/funding evidence, then pursue the next real-source policy failure. Rank 13's original deck runs three Double Dragon Energy; ignoring them materially weakens opponent play. These tests do not select a fixed contender or establish any 99.5% win-rate claim.
