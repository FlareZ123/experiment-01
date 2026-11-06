# Agent48: all eight v8 control prefixes reproduced exactly in v9

**6 November 2026 | post-hoc cross-artifact verification**

This addendum strengthens the [v9 control-ledger reconciliation](agent48-v9-control-ledger-reconciliation-20261106.md): the v9 A control did not merely replay itself. All eight A-control ledgers and physical-deal fingerprints match the corresponding v8 artifact exactly.

## Provenance

- v8 workflow run: [42228565414](https://github.com/FlareZ123/experiment-01/actions/runs/42228565414), artifact 13506238955, payload SHA-256 `d30132ced995f6f0577937de501e86c0e3c51a9bd116b1891b42506118d81ce0`, repository commit `46d6775ab50c90fa290a7d51c5d0cb142ffa6e3a`.
- v9 workflow run: [42246115429](https://github.com/FlareZ123/experiment-01/actions/runs/42246115429), artifact 13519261081, payload SHA-256 `f91552274c354e54226b315ff3ca9e39ddfa7dc3cf3096b2ea863a0d3d602bc4`, repository commit `7ea8479c6acda71916aade2f28f73065a50b7c88`.
- Both artifacts report Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Exact cross-run comparison

| Trial | Roots | v8 = v9 A root-ledger SHA-256 | Source deal | Full physical deal |
| --- | ---: | --- | --- | --- |
| `6:210:B:champion-reference` | 128 | `8d2fb306028df25f4068f3961afba309df560fff0854377bbe91dcab38698d63` | exact | exact |
| `6:210:B:new-moon-lockbreaker-v1` | 118 | `85cd082c446e8f1a12e5da64a827f0d5615045eced15ba4babeb05f385245f1b` | exact | exact |
| `11:211:A:champion-reference` | 128 | `3f02149d95503b77921991d632b4707185ea3ed02deaeb7ccc78ae3e204dadee` | exact | exact |
| `11:211:A:new-moon-lockbreaker-v1` | 88 | `23b7dc981c82483e83cc1e67643882b62ffcbc72b1d4d5477e49f35fb07a42ec` | exact | exact |
| `1:212:B:champion-reference` | 98 | `5c37c925648a6e71fe934dbc9a5ff0bd6f9d88620b9e3b1475ecbb5b6071fde7` | exact | exact |
| `1:212:B:new-moon-lockbreaker-v1` | 128 | `dd077278bf811367632eff90252574b873f7847979477d55ee8a336f66b0f8ee` | exact | exact |
| `3:213:A:champion-reference` | 106 | `525f128869829d83527c004ee6b9506508e165ba101ad6235f5b181fdfa19b0b` | exact | exact |
| `3:213:A:new-moon-lockbreaker-v1` | 93 | `9f022a734e82887c5e7c514ebcbda8c71df9314f22f709dc99908a7a970db17f` | exact | exact |

All eight v8 root counts and ledger digests match the v9 A-control values. All eight source-deal and full-physical-deal fingerprints also match. The v9 A' values then match A, and the B treatment matches both controls, for all eight trials.

This is cross-workflow, cross-process reproduction of the complete v8 control prefix, plus exact same-process A/B/A reproduction in v9. It directly contradicts the theory that the v9 control gate failed because of observed random-stream divergence.

The original v9 control flag failed only because five abort ledgers were nested under `nativeAbortEvidence` and the comparator inspected top-level fields exclusively. The five engine-error dispositions remain genuine, and the 128-root cap still prevents any paid-retreat witness. **No competitive game is qualified.**
