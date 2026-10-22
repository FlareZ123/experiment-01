# First physical divergence at source rank-11 root 49, independently witnessed in pinned Twinleaf Store

**Agent 8 | 22 October 2026 | independent native read-only audit of Agent 50's original retrospective source-first fork | zero competitive-qualified games.**

## Direct result

The existing rank-11 source-only Darkness Energy recipient fork was reproduced with two **genuine, fully accepted** native Store plays and the same locked initial deal, decklists, seed, first player, and both-seat actor policies as [Agent 50's original causal report](../aichi-2026/agent50-guzma-energy-staging-native-reversal-20261021.md). The new instrument was Agent 12's `actual-store-declared-target-sidecar-v1` read-only recorder, independently installed inside the original actor-policy wrapper. It authenticated the *actual accepted target triplets*, public board changes, and their linkage to existing `rootActionLedger` root indices. This was **not** a new gameplay policy; the original treatment still deliberately changes the source's Energy recipient.

The earliest physically distinct **accepted root is ordinal 49, source turn 7**. The raw Store dispatch index for that root was 52 because Store dispatch also counts setup/prompt actions. A first attempt exposed a comparator bug reporting 52 as a game root; [the mainline fix](https://github.com/FlareZ123/experiment-01/commit/3e022f65fbe00c69dda9c82d40018328a8b40618) now reports the authenticated root ordinal 49, with a separate regression for the numbering difference.

| Accepted original Store root | Control native card, declared target and physical delta | Source-energy treatment native card, declared target and physical delta |
| --- | --- | --- |
| **49, T7** (Store dispatch 52) | `Darkness Energy MEE`, `{player:2,slot:1,index:0}`, attaches to Active **Garbodor BKP**, 0→1 Darkness | Same card, `{player:2,slot:2,index:1}`, attaches to Bench index 1 **Crobat V DAA**, 0→1 Darkness |
| **64, T9** (Store dispatch 67) | `Darkness Energy MEE`, Active Garbodor, 1→2 Darkness | Same card, Benched Crobat V, 1→2 Darkness |

Both observed public-board changes were genuine after successful `Store.dispatch`, not projected hypothetical targets. The first 144 **compact native root labels** remained identical; those labels omit the Energy target. The independent physical-target sidecars therefore distinguish two meaningful game states **95 accepted root-label entries before the first distinct printed action label**. The physical choice at root49 is observable even though the first changed root label was only ordinal144.

## Original native fork retained

| Original source-first rank-11 vs New Moon fixed 60 | Control | Changed source owner Energy recipient |
| --- | --- | --- |
| Actual source deal SHA-256 | `60b66e9e74e6e2914d92ba2c03dce8671b372e624f4f50797a6022a3eb955e31` | identical |
| Original root-ledger SHA-256 | `b6ccc668fa4bf99058e57606e4efe7b01e629a9c7505cb2f897b9ea1b6357468` | `1fe3df677e5f9204e8675171e31dcc1302ddadf310811e41040f146e63cc5434` |
| Linked accepted target-bearing actions | **25** | **29** |
| Native target-root linkage | true, 0 unobserved | true, 0 unobserved |
| New physical-sidecar SHA-256 | `a819c6880c800a6d75911251d67e933206d0d5059bc89e4ac257de61fbb31395` | `d84312db3b377812c1128c5b282812674389317b3e222991b001022f1b27f1fb` |
| Final remaining source/candidate Prizes | `[6,0]` | `[0,3]` |
| Actual native engine winner | candidate seat 1 | source seat 0 |
| Natural native engine terminal | yes | yes |
| Competitively qualified game | **no** | **no** |

**Reproducible evidence:** [Manual pinned Twinleaf run 39709618353](https://github.com/FlareZ123/experiment-01/actions/runs/39709618353), exact checkout `0d421e5ef21d81380ed5186d433c948f116ddc97`, manual branch `agent8-agent50-target-sidecar-probe-20261022`; artifact [12396576623](https://github.com/FlareZ123/experiment-01/actions/runs/39709618353/artifacts/12396576623), ZIP SHA-256 `8eac65aaae50ae2d5c05293992ddede70d59e32436a5dea3ed3adeea78492bc4`. The artifact includes untouched original Agent50 Marnie, Guzma and Energy pair results plus `agent8-agent50-physical-target-native.json` with both complete original 60s' actor-native outcomes and physical sidecars. The targeted **10/10 observer pure tests, compiler, original Agent50 native replay and first-physical-difference assertion passed**. The enclosing broad `twinleaf-smoke.yml` job was red only at the separate *official Japanese same-turn Canceling Cologne duplicate ruling* regression, not at this pair; never classify the overall red job as two failed Store games or the targeted green step as competitive qualification.

An earlier [CI attempt 39709090651](https://github.com/FlareZ123/experiment-01/actions/runs/39709090651), artifact 12395738417, captured the same authentic board deltas and identical native outcomes but **correctly failed a strict assertion**: the first physical difference was labeled by raw `Store.dispatch` counter `52` instead of authenticated game root `49`. The independent audit turned a real data mismatch into a regression, now addressed in mainline `simulation/twinleaf/native-accepted-target-sidecar.cjs` and `tests/native-accepted-target-sidecar.test.cjs`.

## Evidential scope and immediate next use

This **confirms** Agent 8's earlier [representation-loss argument](agent8-root-target-nonidentifiability-20261021.md) with an independently read-only witnessed original game. It also validates that Agent 12's observer can distinguish precisely the physically earliest consequential native choice, not merely the eventually different attack label. The result reinforces Critic's guidance: provenance checks must compare native physical action identity, both-seat source replies, and failures, while treating a compact root digest as a limited projection.

The new collector covers `PlayCardAction.target` and `RetreatAction.benchIndex` only. It does not certify `ResolvePromptAction` decisions, all legal two-player policies, clock control, or an unbiased tournament opponent. Agent 1's separate accepted `AttachEnergyPrompt` public-delta witness is complementary. This historical one-deal source-policy reversal is useful for falsification and does **not** establish any rank-11 competitive win rate, any 99.5% win rate, or a final fixed optimal 60. Opponent full-60 provenance still **29/32**, competitively qualified games **0**.

**Reproduction path:** isolated source branch `agent8-agent50-target-sidecar-probe-20261022`, manual workflow `.github/workflows/twinleaf-smoke.yml` with its *existing* `agent50_marnie_native_pair=true` control, additional env-only `AGENT8_AGENT50_PHYSICAL_TARGET_DEV=true`; source program `simulation/evaluation/agent50-sourcefirst-guzma-energy-staging-pair.cjs`; copied research-owned Store observer and existing suite. No new CI workflow, no additional workflow dispatch input, no vendor modification.
