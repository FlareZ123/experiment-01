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


## Pinned-native finding and executable root decision — 28 Nov 2026, 14:39 UTC

The previous result above describes the pre-native exploratory state. **This update supersedes its no-native-execution status**, not its source/rule details. The actual compiled pinned Twinleaf revision was `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; no upstream vendor change.

- [Run 46126966876](https://github.com/FlareZ123/experiment-01/actions/runs/46126966876) failed four native Store cases at Articuno `Legendary Ascent` confirmation. The worker inspected Water already on Bench, overlooking Water on the old Active that *becomes Benched after the switch*. Fixed worker plus two-seat source regression `2abaf05e0b97be5b2703d8426e29982d94d6f4bc`, regex correction `2afb3a394a33dac278ba645191660f5863b6c9eb`.
- [Run 46154449808](https://github.com/FlareZ123/experiment-01/actions/runs/46154449808) progressed through native Confirm and MoveEnergy selection but failed because physical Water did not transfer. Pinned `MoveEnergyPrompt.decode` dereferences `source CardList.cards[t.index]`; the research projector had encoded Energy-only ordinal `0`, which addressed the underlying **Bunnelby**, not Water at full physical index **1**. **Fix:** `slot.cards.indexOf(card)` for the same physical object from `slot.energies.cards`, fail-closed `PHYSICAL_ENERGY_IDENTITY_MISMATCH`, source-shaped fixture now maintains real `cards` and `energies` shared instances, raw indices 1/2, orphan negative, native index1 assertion; [commit a208dbec](https://github.com/FlareZ123/experiment-01/commit/a208dbec804917b38ee9b29897060f9dd223925d).
- [Run 46154760591](https://github.com/FlareZ123/experiment-01/actions/runs/46154760591) **SUCCESS** on development branch `agent17/rank3-articuno-move-energy-v3-20261128`, four compiled Store cases: both actor seats, each with/without optional-zero hook, genuine hand-play→Confirm→physical Water transfer→`Cold Crush-GX` and both Active Energy discards.
- Ported passing physical projector plus fixtures into payable root branch in [commit ecaf42c2](https://github.com/FlareZ123/experiment-01/commit/ecaf42c2f47ea0b75e742d7845e3bae2afdf9781); compiled [run 46155031979](https://github.com/FlareZ123/experiment-01/actions/runs/46155031979) **SUCCESS**. The root helper on this branch already recognizes Water on Active *and* Bench and preserves existing Snorlax/Wobbuffet lock.
- Extended that **same existing native test** in [commit 9fe22ad](https://github.com/FlareZ123/experiment-01/commit/9fe22ad277054dbe3dc2077815a2f95b9e9b6ed8): native `ActionEnumerator` genuinely offers original rank3 singleton Articuno-GX CES versus its Team Rocket's Handiwork FCO Supporter, the rank3 worker selects a typed Articuno root token, the live Store dispatches the selected root and resolves native Confirm→MoveEnergy→`Cold Crush-GX` in **both actor seats**. [Run 46155351371](https://github.com/FlareZ123/experiment-01/actions/runs/46155351371) **SUCCESS**. The root action frontier intentionally restricts analysis to this actual contested two-action pair, not exhaustive game actions.

**Evidence boundary:** genuine compiled native Store *tactical continuation* on a constructed legal-looking physical board with real listed cards; not an original-rank3 exact-60 shuffled deal, not an unchanged candidate-vs-opponent game, not a qualified matchup or measured win rate. No PR104 frozen head changed, no owner-gated full game triggered, no new workflow. Source list `results/aichi-2026/full-decklists.json` rank3. The strongest integration candidate is now development branch `agent17/rank3-articuno-payable-root-20261128@9fe22ad277054dbe3dc2077815a2f95b9e9b6ed8`; independent review before registration/merge.


## 28 Nov 2026, 15:03 UTC: 60 original rank3 owner Cards conserved in pinned native GX

The strongest current development branch head is f9632af8f5926f995a12b5b1f2276c3af0b5e6ce on agent17/rank3-articuno-payable-root-20261128. [CI 46157381319](https://github.com/FlareZ123/experiment-01/actions/runs/46157381319) **SUCCESS**. It materializes the published rank3 60 (11 Pokémon, 44 Trainers, 5 Energy) in pinned Twinleaf a9905a76 with the existing approved production planAichi(1, {allowEquivalentBasicEnergies:true, allowJapanesePromoHooks:true}). The source names/counts remain unchanged. The Japanese promotional Player's Ceremony 127/S-P is not part of pinned upstream: its known research-only source-to-engine hook must be opt-in and the native substitution is disclosed. The generic V3 deck resolver does not contain this hook and caused only the two full-60 test failures in earlier [run 46156875246](https://github.com/FlareZ123/experiment-01/actions/runs/46156875246); that earlier run separately passed all **103 source-policy tests and 10 native continuation tests**.

In both actor seats, one source Bunnelby Active has Water, source-legal seven-card hand includes Articuno-GX, Team Rocket's Handiwork, Arven, Plumeria, Nest Ball, Capture Energy, other Water; six source Prize cards and 45 other source deck cards complete the 60 physical distinct cards. The pinned full cloned-Store-legal native actor frontier offers the alternatives and the rank3 worker chooses Articuno; real Store applies hand-play, Confirm, physical Water transfer at full CardList index1 and Cold Crush-GX. After each transition the 60 physical objects and original source/proxy registered multiset remain unchanged. A separate 4-case two-seat/zero-minimum native test transfers both Water Cards from the old Active, at physical indices 1 and 2, discards both via Cold Crush-GX and passed. These are **constructed tactical board states with a non-source Regidrago-V opponent**, not an unchanged opponent-vs-candidate shuffled game, not qualified benchmark, not a win-rate estimate. The 99.5% aim remains unproven, 0/32 qualified full games.

The source-print matching defect is also fixed specifically in rank3: native Card.fullName omits collector numbers and originally most rank3 source-only patterns did not match; tested optional original-number or set-only aliases now score actual source Handiwork competitively with Articuno, rejecting wrong numbered printings. A broader static code risk across rank-policy files is documented in [the method note](../../methodology/2026-11/agent17-native-set-only-original-print-mismatch-20261128.md).
