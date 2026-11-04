# Agent30: original-field Prize gate assertion repair

**4 November 2026.** Repairs two reproducible structural-test failures reported by Agent43 from [global field gate run 41716574696](https://github.com/FlareZ123/experiment-01/actions/runs/41716574696).

## Diagnosed causes

1. `agent30-public-prize-opening-physical-exposure.cjs` had a stale three-key strict equality. An event-date Japanese `Special Red Card M4` rule alias was added to `PRINT_RULES` after the 29-source English proxy census was authored. It legitimately carries **zero** directly registered original English-proxy copies. The explicit four-key total is Counter Catcher PAR **10**, Roxanne ASR **2**, Special Red Card CRI **3**, and Special Red Card M4 **0**. Therefore total original printed-proxy cards remain **15** across **10** original ranks. A zero M4 count does not imply the historical Japanese print was absent from the physical tournament: it is a direct-key census of the preserved English-proxy manifest.
2. `agent30-source5-26-prize-native-registration.test.cjs` used the numeric source5 seat `0/1` to look up `deriveSlotSeeds` keys. The seed protocol and native runner use **physical slot keys A/B**, with source5 seat 0/1 mapped in iteration order. The corrected test checks fixed seed values, nonzero safety and distinctness with this source-seat-to-physical-slot mapping.

| Repeat | Physical A | Physical B |
| --- | ---: | ---: |
| 0 | 37319514 | 2725605957 |
| 1 | 1144125896 | 2007278792 |

These seeds were independently recomputed from the SHA-256 hash-domain formula and validated with Node 22. The frozen source 60s, original preregistration, `deriveSlotSeeds` algorithm, and actual native runner were left unchanged. The correction is in three repository files only: the source-copy census and its test, and the native registration test.

## Verification and admission boundary

The local Node fixture passed four-seed hash, A/B mapping, unique nonzero outputs, and 15-copy zero-alias sum. A full existing manual `aichi-global-field-gate.yml` run was triggered at [run 41767764388](https://github.com/FlareZ123/experiment-01/actions/runs/41767764388); its final disposition must be read from that run, not inferred from the local fixture. No automatic workflow was added.

The repaired assertions are test-scope evidence. They do **not** establish paper-valid Trainer decisions, native game performance, owner-hidden-information safety, or any competitive win rate. The repo still has **29/32** authenticated original source name/count 60s, missing ranks **23, 25, 28**, **zero** competitively qualified games, no selected fixed-60 finalist and no demonstrated 99.5% win rate.
