# Fresh original rank-5 Mew/Genesect owner Quick Ball target comparison

**Agent37 | 9 November 2026 | Independent seeded native development | zero paper-qualified games**

## Question and frozen intervention

Does preferentially selecting an absent Mew V or Genesect V from the original Aichi rank-5 source's native Quick Ball search improve the actual source attack and Prize sequence outside the two previously inspected source deals?

The initial retrospective comparison found one full native engine-winner reversal under targeted Mew selection. That seed was already exposed and is **excluded** from this experiment. Fresh preregistration: [four independently generated seeds, two physical seats](../../aichi-2026/registrations/agent37-rank5-quickball-search-independent-20261109.json). Eight complete source-versus-contender games were repeated under the two search policies. Each source/candidate deck stayed exactly unchanged; controls use native owner-only generic search, treatments change only the native owner-visible Mew/Genesect Quick Ball choice. Shared source evolution, paid DCE mobility, Genesect draw, Quick Ball root and real hand-discard prompt policy were identical in both arms.

- Runner: `simulation/evaluation/2026-11/agent37-rank5-fresh-quickball-owner-search-native.cjs`
- Original source printed60 SHA-256: `a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05`
- Frozen registration SHA-256: `b105680b5b1df05085afcc9e2f9e4d02da2e5728a19a551ac5c4d12b326e3fe7`
- Reference candidate: original rank-1 Shadow Rider complete 60; second candidate: unchanged New Moon Lockbreaker v1 complete 60.
- Developmental frozen common profile: `simulation/evaluation/agent41-frozen-bilateral-development-v2.json`. Pinned native Store revision from that manifest: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- [Completed manually dispatched native CI 42585170421](https://github.com/FlareZ123/experiment-01/actions/runs/42585170421) SUCCESS. The [all-16 raw attempt archive](https://github.com/FlareZ123/experiment-01/actions/runs/42585170421/artifacts/13658917006) includes root action, search prompt, native attack settlement, Prize and physical-source fingerprints for **all** arms; archive ZIP SHA-256 `eacebc1ddd90ddeeef993dbd2932a77445110d28881733226ae12ed3b35c46b8`.

## Observed native results

All **16/16** registered attempts executed, without batch errors. All **8/8** paired comparisons matched both the original-source physical-deal fingerprint and the full physical initial-deal fingerprint. Six pairs reached native terminal in both arms; two pairs reached the action limit in both arms. Zero pairwise native winner reversals occurred.

| Original source seat, candidate, new repeat | Generic source attacks | Mew-target source attacks | Pair disposition | Native winner change |
| --- | ---: | ---: | --- | --- |
| Seat 1, champion, repeat 1 | 0 | 0 | both terminal | none |
| Seat 1, New Moon, repeat 1 | 0 | 0 | both terminal | none |
| Seat 0, champion, repeat 1 | 4 | 4 | both terminal | none |
| Seat 0, New Moon, repeat 1 | 0 | 0 | both action-capped | unresolved |
| **Seat 1, champion, repeat 2** | **0** | **1** | both terminal | none |
| Seat 1, New Moon, repeat 2 | 0 | 0 | both action-capped | unresolved |
| Seat 0, champion, repeat 2 | 0 | 0 | both terminal | none |
| Seat 0, New Moon, repeat 2 | 0 | 0 | both terminal | none |

The control source declared four attacks across these eight native games. The targeted source declared five. Actual settled source attacks also increased four to five. In the repeat-2 seat-1 champion pairing, the generic path selected Dedenne-GX from the actual Quick Ball owner deck prompt on source global turn 27, then declared no attack. The targeted path selected **Mew V FST** from the same initial physical deck, later put **Mew VMAX FST** into the Active Spot with **Double Colorless Energy** attached and **Genesect V FST** on the Bench, and declared **Cross Fusion Strike** at global turn 29. The actual Store processed its prompt chain through completion root 159, with no clock-epoch crossing. The source took one Prize: its remaining Prize count changed from six to five. The native source was already declared winner in both arms: the generic terminal had final Prize counts `[6,6]`, targeted `[6,5]`. Therefore this is an authentic **attack and Prize** improvement, with **zero changed native game winners**.

In repeat-1 seat-0 versus champion, generic owner search already produced four source attacks, unchanged by the target preference. Both native outcomes were original-source wins, ending `[0,4]` in seat-aligned remaining Prizes.

## Decision and limits

The older retrospective winner reversal is **not replicated** by this independent small panel. Prioritizing the actual missing Mew attacker can rescue an additional attack and Prize on a fresh source physical deal; this is a meaningful owner-decision policy improvement. No game winner changed in the six fully terminal paired comparisons. The two double-censored comparisons cannot establish a ranking; the sample is sparse for matchup-strength inference. This is one original opponent, two fixed candidate matchups, four newly registered initial source deals, and a developmental common policy that remains unqualified for competitive Japanese paper Extra.

**Keep the new owner Quick Ball target treatment opt-in and preserve every original attempt.** Prioritize the next source gameplay bottleneck: the existing generic mandatory-discard chooser optimizes uniqueness of printings but does not directly value protecting the original four Double Colorless Energy needed for the Mew attack line or avoid wasting critical Supporters. Test actual full-turn and cross-turn Energy custody, opponent responses and completed Prize conversion before integrating a common policy. Do not rerun these same fresh seeds as independent validation or claim a new deck selection from this experiment.

Competitive paper games qualified: **0**. Final fixed 60 selected: **none**. 99.5% field target demonstrated: **no**.
