# Six-preregistered-Aichi-source-rank K0 owner-root information-boundary survey

**Agent 18, 29 October 2026.** **Native result:** **6/6 fixed original-source pairings passed**, with two genuine first-owner-root checks per pairing (**12 owner roots**). No blocked registered ranks. **Zero competitively qualified games**, and no deck win-rate estimate.

## Research question and preregistration

The previous [original 60-card rank-1/rank-11 native observer control](agent18-aichi-source-k0-native-firstroots-20261029.md) covered one opponent. Does the same initial K0 owner-information-set invariance persist when the unchanged published Aichi rank-1 Shadow Rider Calyrex 60 is paired against a fixed, more heterogeneous subset of exact original opponent lists?

The [pre-execution protocol](../../agents/agent18/20261029-aichi-k0-stratified-native-protocol.md) fixes the source opponents as **ranks 2, 6, 10, 11, 24, 29**, with no post-result substitution, using the official-source original card counts/printings in `results/aichi-2026/full-decklists.json`. Rank 11 is **Absol Garbodor**; the three Iron Thorns placements are different original lists and are counted as three distinct source decks. The original field is 29 known full 60s, with ranks 23, 25 and 28 still missing.

## Method and reproducibility

- [Survey runner](../../simulation/twinleaf/agent18-aichi-k0-stratified-native.cjs) reuses the source-native owner observer in [`agent18-aichi-source-k0-native-root.cjs`](../../simulation/twinleaf/agent18-aichi-source-k0-native-root.cjs).
- Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, common deterministic seed `4246551499`, fixed source champion as physical A and each opponent as B, **48 native root-action cap per game**. Explicit shared flags: strict prompt validation, policy RNG isolation, post-super-alias experimental isolation, and Supporter decision correction.
- Every pairing is run **twice**: unchanged source-game Store and the same Store setup with a temporary passive K0 observer. The wrapper identifies genuine live Store from `AddPlayerAction` and first actual native decode for each owner. It swaps own unseen deck top with a different face-down Prized printing, compares the frozen actor-only observation and first-return actor-only choice, and strictly restores the original two native card references before the genuine pinned bot proceeds.
- Requires two source-real owner roots per pairing, identical owner views/actions under K0 hidden swaps, literal restoration, and parity between observer-on and observer-off result **deck hashes, winner, action count, turn count, end reason, Prize counts**.
- [Manually invoked CI **40972237014**](https://github.com/FlareZ123/experiment-01/actions/runs/40972237014), head `6de2cd2c369f3a50c920131b2477ce4a8866cbb8`, opt-in workflow input `source_k0_survey:true`. Its isolated artifact [**12940727952**](https://github.com/FlareZ123/experiment-01/actions/runs/40972237014/artifacts/12940727952) is named `agent18-original-aichi-k0-six-rank-survey` and preserves every registered rank's machine-readable first-root and failure status. The run and all existing default hidden-order gates **completed successfully**.

## Actual compiled results

| Published opponent rank | Original archetype | Native opponent first-root intent (physical B, turn 1) | Native rank-1 champion first-root intent (physical A, turn 2) | Observer parity |
| ---: | --- | --- | --- | --- |
| 2 | Vileplume Control | Pass | Attach Basic Energy | Pass |
| 6 | Iron Thorns | Attach Special Energy | Attach Basic Energy | Pass |
| 10 | Regidrago | Pass | Attach Basic Energy | Pass |
| 11 | Absol Garbodor | Bench Basic Pokémon | Attach Basic Energy | Pass |
| 24 | Iron Thorns | Attach Special Energy | Attach Basic Energy | Pass |
| 29 | Iron Thorns | Attach Special Energy | Attach Basic Energy | Pass |

For every row, the **two original-60 owner roots** had unchanged actor views and unchanged actor-only intent under the invisible physical deck/Prize exchange, literal native object restoration, and identical native censored outcomes with observer enabled versus disabled. Every root showed **six still-face-down Prizes**; the unseen deck contained either **45 or 46 cards**, as determined by genuine source opening state.

Each native game was intentionally stopped at **48 actions**, with `endReason: action-limit` and no winner. Five pairings ended with the same six Prize cards for both players; the rank-2 Vileplume pairing finished its bounded prefix at **five versus six** Prizes, identically in both observer conditions. This is an observed native partial trajectory, not a completed contest.

The first-root intents above are **actor-only policy proposals**, not a claim that the unmodified native bot chose those same actions, that they were optimal, or that they were all accepted and dispatched. The original bot was left intact in the source-game trajectories; the passive observer's action was computed separately, without substituting it for native decisions.

## Limits and relevance to deck optimization

This is **source-origin prefix information-integrity evidence** for the actor-only observation boundary. It cannot prove full default SimpleTacticsAi privacy, knowledge handling after deck searches (`K1`), fidelity of speculative bot branches, competent play, ability-lock responses, match-up probabilities, tournament outcomes, or whole-field robustness. The six opponent lists include three Iron Thorns variants; the fixed subset is not a representative random sample of the original Top32 field, and its full-game archetype diversity is limited.

The result is useful as a practical regression gate for the shared owner's first-return action arbitration: if an integrated chooser gains a hidden dependency, these paired real-source roots offer reproducible early counterexamples. The next important step for genuine deck evaluation remains validated, independent, both-sided action policies and complete matches over the full published field, with missing list provenance and uncertainty treated explicitly.

**No result in this report establishes a 99.5% game win rate for any fixed deck.**
