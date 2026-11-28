# Rank 3 native Articuno-GX Legendary Ascent continuation — bounded research adapter

**Status as of 2026-11-28: concrete research-side source and strict-policy fix, not a native Store or game outcome.** Branch `agent17/rank3-articuno-move-energy-v3-20261128`, based on integrated rank-3 policy `agent17/rank3-integrated-v14-development-20261128`. This does **not** change either fixed candidate 60 or opponent source 60.

## The actual native incompatibility

The pinned Twinleaf submodule revision is `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. `ptcg-server/src/sets/08-sun-and-moon/set-celestial-storm/articuno-gx.ts` blob `b61caf68ea7d28f298320f7d3283d3503bfadb2d` implements **Legendary Ascent** on a hand-to-Bench Articuno-GX: a ConfirmPrompt, conditional immediate Active switch, then (if other Benched Water Energy exists) a **MoveEnergyPrompt** with actor-owned Bench source and Active target; the resulting transfers are applied to physical CardLists. `ptcg-server/src/game/store/prompts/move-energy-prompt.ts` blob `1593d4f5cf76a8f617a96ff01e31ea540771b60d` decodes `{from:CardTarget,to:CardTarget,index:number}[]`, **not** ChooseEnergyPrompt's integer energy-card indices.

The pre-patch `agent36-prompt-projection.cjs` had no switch arm for `MoveEnergyPrompt`, the strict `agent49-policy-protocol.cjs` had no matching selection class, and the rank-3 opponent worker's Legacy Ascent branch incorrectly expected `ChooseEnergyPrompt`. A real native ability continuation on this board therefore cannot be delegated to the strict worker.

## Exact corrective code, no vendor edits

- `simulation/evaluation/2026-11/agent49-policy-protocol.cjs`, commit `f97ed9287839d4872329d38efa19a8e417310a43`: new `energy-transfer` class for only `MoveEnergyPrompt`; it requires typed `Articuno-GX CES` / `Articuno-GX CES 31` `Legendary Ascent` source, actor-owned Water Energy, physical Bench indices, Active destination, no cancellation and minimum one transfer. Other sources and adversarial ownership fail closed as `UNTRUSTED_ENERGY_SELECTION`.
- `simulation/evaluation/2026-11/agent36-prompt-projection.cjs`, commit `b54f508cef5ed9ebc25d82d3dfb95b889b6a219d`: same-source projector for native `MoveEnergyPrompt`; it enumerates exact **Water Energy card indices on each actor-owned physical Bench CardList**, skips blocked Bench sources, and maps unique token to the exact native transfer object. It does not look into hidden zones, clone vendor code, or use guessed card-name targets. Multi-selection dispatch recognizes `energy-transfer`.
- `simulation/evaluation/2026-11/agent17-rank3-snorlax-stall-opponent-policy.cjs`, commits `1c8d8262bd832afb26d5ac10ed0248a49616da92`, `f9014a4d187d931cc07ca0b1dd2ea3360caf5c7f`, `782ee1a9ecde60f7901cd6f2cac069d46037f885`: adds actual typed `MoveEnergyPrompt` transfer decision, explicit `Legendary Ascent` ConfirmPrompt decision when a Water transfer into **Cold Crush-GX** is credible (opponent Active has at least two Energy, own GX unused, own Active not Snorlax), preserves Block instead of pivoting the Snorlax Active, and normalizes paper `Articuno-GX CES 31` / native fullName `Articuno-GX CES` source matching. The confirm conditions are heuristic, not a proven optimal policy.
- `tests/2026-11/agent17-rank3-articuno-move-energy-v3.test.cjs`, commits `88a7a397fed8c6bbd079de64b1f8577988926636`, `20e8b4a344df1c803cf1830b552eed7fd91dfb82`: actual projector with a native-shaped `MoveEnergyPrompt` (two identical Water Energy printings on a physical Bench), both actor seats, exact token→two distinct physical Energy indices, actual rank3 worker decision and shared strict-V3 `validatePrompt`/`validateDecision`. Negative controls reject forged source/effect, non-actor source, missing Water and blocked Bench, and conservative Confirm decline when Snorlax Block needs preservation or GX is used.

## Executable test evidence and limits

Loaded the **actual remote CommonJS source bodies** into the V8 tool runtime with explicit `node:test`/assert shims and checked the branch's five test files:

| Suite | Passed | Failed |
| --- | ---: | ---: |
| Original rank-3 Wobbuffet/Hood/Dialga/prize source decisions | 55 | 0 |
| Eri/Arven native Item/Tool corrections | 6 | 0 |
| Agent32 Penny/physical-slot continuation | 14 | 0 |
| Strict V3 Counter Catcher/Dialga physical Bench prompt | 4 | 0 |
| New Articuno native-shaped prompt/physical transfer/Confirm positive and negative controls | 14 | 0 |
| **Total** | **93** | **0** |

**These are V8 CommonJS body tests, NOT a Node CLI native simulator run.** Native `Store.prompt` dispatch, energy movement settlement, subsequent `Cold Crush-GX` payment, full-game win, and matchup-level effect remain unmeasured. The exact added tests can be run with Node's normal runner when dependencies are available:

```sh
node --test \
  tests/2026-11/agent17-rank3-articuno-move-energy-v3.test.cjs \
  tests/2026-11/agent17-rank3-lockbridge-trap-development.test.cjs \
  tests/2026-11/agent17-rank3-eri-arven-tool-contract.test.cjs \
  tests/2026-11/agent32-rank3-penny-continuation-policy.test.cjs \
  tests/2026-11/agent17-rank3-dialga-trap-v3-decision-chain.test.cjs
```

The next evidence gate is **one** owner-approved pinned native Actor root→Articuno hand-play→ConfirmPrompt→physical MoveEnergyPrompt→Cold Crush-GX (or a recorded nonpayability state) continuation, in both seats if practical. Owners of shared `agent36-prompt-projection.cjs` and `agent49-policy-protocol.cjs` should review this exact-source adapter before merging, because the changes intentionally extend a shared strict protocol used by other workers. No unrelated general MoveEnergyPrompt support or vendor modification is implied.

**Objective evidence remains:** no validated 99.5% rate; 0/32 qualified fixed-candidate matches against Aichi Top32. Making rank3 playable is a prerequisite to credible benchmarking, not evidence that the candidate beats it.

## Subsequent native-interface corrections and prospective test (same invocation)

A deeper source inspection exposed two real integration constraints that the first source-only payload missed:

1. The actual `agent36-prompt-provenance.cjs` `describeEffect(card,effect)` wraps Articuno's `PlayPokemonEffect` and uses the *card name* `Articuno-GX` as `effectName`. The genuine ConfirmPrompt and successor MoveEnergyPrompt therefore need the allowlisted pair `{sourcePrinting:'Articuno-GX CES', effectName:'Articuno-GX'}` as well as the synthetic explicit power-name form. The protocol, projector and worker now accept those **two exact forms only**, with the same physical Water transfer bounds, commits `cf5a2c404f240ac064b1a634ad07d1d7931cbbca`, `62b82410cd86c2ad1f5d2984981bbfdc7e7c4387`, `9b26656ffe47e38de4b4b5cb6ffacf75884b65a4`. V8 fixtures now use the **actual** `Articuno-GX` provenance, not a fabricated power-name source.
2. The existing research-side paper-rules hook `simulation/twinleaf/articuno-zero-movement-prompt-hook.cjs` (and native test `tests/articuno-zero-movement-prompt-hook.test.cjs`) correctly changes Articuno's post-switch minimum from **1 to 0**: the Active switch already changed the game state, so optional zero transfer is valid. The adapter now admits exact pinned native `min=1` **and** exact hook-corrected `min=0`, with explicit `empty-selection` token only in the latter, commits `3cb7cbfc8ab2898f3adc1f782cd9ac0fc862f261`, `f0074155c8c54d4105a352053e652bcf52d3cbcd`, `b790421cebb49b30cfe24924fa0426bd5a389519`. No generic optional Energy-transfer mode is enabled.

**All 93 source-level test cases now pass** (55+6+14+4+14). **Native engine execution is still not claimed** until the prospective workflow returns. Added constructed true-Store exact-pinned test `tests/2026-11/agent17-articuno-v3-actual-store.native.test.cjs`, commit `1ab7d1973889bc48ec12dde25cf616adb438f9af`: it uses real `Store`, `PlayCardAction`, the shared provenance hook, projected ConfirmPrompt, worker decisions, `dispatchPromptChoice`, native MoveEnergyPrompt physical Energy settlement, and `Cold Crush-GX` in both actor seats and both min=1/min=0 branches. The test does **not** report a game win. One bounded branch-specific CI workflow `.github/workflows/agent17-rank3-articuno-v3-native.yml`, commit `df64509037b52cb369b842a26d2d7ad2ec2f7dc7`, was queued as run `46126966876`. No full-game random seed sweep.

Result is development-only pending that run and an independent owner review. The user-visible candidate's 32 matchup win rates remain unestablished.
