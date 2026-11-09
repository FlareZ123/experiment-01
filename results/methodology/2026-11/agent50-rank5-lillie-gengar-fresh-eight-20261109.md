# Fresh original-rank5 New Moon Lillie/Gengar result: zero policy activation, reproducible structural gate

**Agent50 | 9 November 2026 | prospective native developmental evidence.** All source/candidate sixties remain unchanged. The same original rank-5 source list and one fixed New Moon list were played with pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Eight CSPRNG seeds and balanced physical seats were [frozen before runner implementation](../../aichi-2026/registrations/agent50-rank5-lillie-gengar-fresh-eight-20261109.json).

## Experiment and unselected results

Comparison: a common two-player source policy with owner-only Lillie's Determination after Pass versus the identical policy **plus** existing Gengar/Skyliner/Horror House-GX with opponent public-hand threshold six. The Gengar branch was held constant at its original v1 code and not adapted to the sample.

[Manual CI run 42640840556](https://github.com/FlareZ123/experiment-01/actions/runs/42640840556) **SUCCESS** with pinned server compilation, policy/regression tests and **16 real native Store games**. [Complete 101,933,938-byte uncompressed JSON tape, artifact 13686405676](https://github.com/FlareZ123/experiment-01/actions/runs/42640840556/artifacts/13686405676); compressed ZIP SHA256 `1b3737b5b412eb61cbd751d34ebfdba52716d4386dd18ae31b8a1a0664db351e`, native pair-result digest `fef2e09641626707767378a153c702047ed0b63f046f370bd714250a20dac0d8`. Source, candidate and full initial physical-deal fingerprints matched in **8/8** pairs. Both arms had identical accepted action-ledger SHA256 **8/8**; their physical post-Store tapes had no divergence. Tests ran without engine errors.

| Registered deal | Candidate seat | Lillie-only | Lillie + Gengar | Candidate attack/root observation |
| --- | --- | --- | --- | --- |
| 50601 | A | Source wins (72 roots) | Source wins (72) | No candidate attacks |
| 50602 | B | Source wins (118) | Source wins (118) | Five other attacks |
| 50603 | A | Censored at 320 | Censored at 320 | 28 other attacks |
| 50604 | B | **Candidate wins** (135) | **Candidate wins** (135) | No attacks by either player; native-only win |
| 50605 | A | Censored at 320 | Censored at 320 | No attacks |
| 50606 | B | Censored at 320 | Censored at 320 | 18 other attacks |
| 50607 | A | Source wins (305) | Source wins (305) | No candidate attacks |
| 50608 | B | Source wins (242) | Source wins (242) | 18 other attacks |

Five of eight pairs completed natively in both arms; **one candidate win and four source wins in each**. Three paired groups were action-censored. Completed-game winner reversals: **0**. With censored unknown outcomes explicitly retained, exact paired treatment-minus-control native candidate-win count on the eight physically matched groups remains **[-3,+3]**. These games are developmental under an unqualified policy; **zero independent paper/clock/strategy-certified games** and no inferred win percentage for the Aichi field.

## Concrete cause found in all full physical tapes

The unchanged v1 `chooseGengarHorrorHouseTempo` policy in `simulation/twinleaf/2026-11/agent20-gengar-horror-house-tempo.cjs` only pursues a Benched Gengar if the acting owner's **Active is specifically `Tapu Lele-GX GRI`**. The complete post-Store owner physical tapes show that **none of the eight new games ever had both a Benched `Gengar & Mimikyu-GX TEU` and an Active Tapu Lele**. Five deals did put Gengar onto the Bench, but while Active was Duskull, Mewtwo & Mew-GX, Latias ex, Galarian Articuno V or Trevenant & Dusknoir-GX. Thus the original posthoc Tapu Lele corridor was not available to this v1 policy in these eight games.

A stronger **positive owner-visible intervention opportunity** appeared in registered deal **50603** (candidate seat A): Gengar on Bench and `Telepath [P] Energy M3` in owner hand persisted together for **274 post-Store snapshots**, usually with a Duskull Active. The attached-Gengar energy count stayed zero. The printed Telepathic Psychic Energy gives Psychic while attached, and a Psychic Pokémon such as Gengar is a legal attachment recipient; its on-attachment Bench-search effect requires separate native prompt handling. Existing `agent3-special-energy-frontier.cjs` already models the printed Telepath energy unit, while Gengar v1's `isReady()` recognizes only printings starting with `Psychic Energy `, and its funding choice looks only for Basic Psychic. An observed static opportunity does **not** certify a legal unspent Energy attachment on any particular decision root; the next test must check actual root quota and full owner prompt.

**Proposed next gameplay treatment:** widen Gengar setup from the hardcoded Active Tapu Lele to a **paper-eligible visible Active** with a concrete promotion path, recognize Telepathic Psychic as an attached Energy unit (except when Temple of Sinnoh disables Psychic provision), and choose it for owner Gengar where the native Store and its owner prompts can settle. Make this a separately registered v2; preserve v1 as the frozen fresh control. Prioritize a paid Gengar attack and actual opposing reply rather than another zero-activation panel. The v1 result is a negative **policy coverage** result, not evidence that Gengar or Lillie is intrinsically weak or that New Moon should be selected.

## Reproduction and limitations

- [Runner](../../../simulation/evaluation/2026-11/agent50-rank5-lillie-gengar-fresh-eight.cjs) and [pure tests](../../../tests/2026-11/agent50-rank5-lillie-gengar-fresh-eight.test.cjs); frozen original 60s and seed registration as linked above.
- Native and tape outcomes are independent of rule/clock adjudication. Winner of deal 50604 cannot be assumed to be a competitive paper victory; it had no accepted attacks.
- All 16 attempts remain in the full artifact, with per-attempt/root physical custody receipts; no result was filtered for desired outcome.
- The eight source openings are independently seeded, but their physical decks differ by starting player seat; no paper-level randomization calibration or representative full-field inference is claimed.
