# Rank-22 Absol / Garbodor / Vikavolt V policy successor — bounded actor-only prototype

**Agent 5 · 28 November 2026.** Decision changed: a previously unimplemented exact-source Aichi Top-32 rank now has an actor-visible, deterministic **opponent policy prototype**. This is **not** an admitted competent opponent or a game result. No native/game/CI dispatch or merge was made.

## Scope and source

- Exact Aichi source: rank **22**, Haruya Mori, 60 cards, `results/aichi-2026/full-decklists.json` (Git blob `ae773f6201d7aa69d31914dbfee66f3fba692200`).
- New worker: `simulation/evaluation/2026-11/agent5-rank22-absol-vikavolt-opponent-policy.cjs`; rank-22 inventory derived directly from all 36 named printed source entries and verified at **60/60**.
- Reused and adapted the single-file, actor-only Agent44 rank-8 Absol/Garbodor policy interface instead of another runner, simulator, or worker protocol.
- Main differentiators from rank 8: two Vikavolt V DAA 60, only one each Trubbish FST 168 and NVI 48, two Garbodor BKP 57, three Lightning plus five Darkness, two Battle Compressor, and one Enhanced Hammer.
- Exact new policy version: `agent5-rank22-absol-vikavolt-opponent-v1`. Incomplete source-entry/worker-protocol hashes are deliberately null until exact native admission; do not present them as certified.

## Concrete decision improvements

1. **Vikavolt alternate attack axis:** actor-visible `Paralyzing Bolt` receives priority for early 50-damage Item lock when nonlethal; `Super Zap Cannon` 190 can win a direct knockout but has lower nonlethal value because it discards two Energy.
2. **Two-type Energy scheduling:** first Lightning on Vikavolt is necessary to cover `[L][C]`; one Darkness may then supply the Colorless. Mega Absol needs Darkness first; second Darkness advances `Claw of Darkness`, and Lightning may provide its Colorless where Darkness is already attached. Nonpayable attacks are rejected by the native action frontier score guard.
3. **Garbodor actual Tool lock:** both source Trubbish prints are recognized; Float Stone can be attached to **already evolved**, Tool-less Garbodor, not only a pre-evolution Trubbish. The same bounded correction was made to the existing rank-8 policy.
4. **Battle Compressor → Dark Patch:** when a Bench Mega Absol still needs Dark Energy and fewer than two Darkness are in discard, the root policy can initiate Compressor, then the actor-visible deck prompt selects up to two Darkness and, after the initial turn, otherwise-dead Battle VIP Pass. It does not indiscriminately discard the three Darkness that the fixed 60 may need.
5. **Physical setup:** source-locked opening Active choice (Vikavolt preferred with held Lightning; Trubbish otherwise), bounded Bench deployment, unchanged post-mulligan Active, and maximum legal optional mulligan draw. Unexpected printings or prompt bounds fail closed.
6. **Mega Absol Terminal Period:** exactly six 10-damage counters means **60 damage**, not 300. Corrected three existing rank-8/rank-11 scoring paths and updated the rank-8 contract test. Rank-11 v2 already had a correct advanced root override; its older base scorer did not.

7. **Actual source Supporter strategy:** Wally ROS 94 can evolve Trubbish into Garbodor *on the first turn / turn of entry*; policy now selects source Garbodor from deck and an existing actor Trubbish from board. Marnie SSH 169 scores hand reset when own hand is small and opponent's large. Karen XYP 177 targets visible Dialga-GX / Dragapult ex / Kyurem / Noivern ex / Hisuian Goodra VSTAR / Mega Dragonite ex attack donors in the discard against an observed Regidrago V/VSTAR. Supporter contention remains one per turn.
8. **Ultra Ball & Secret Box costs rather than theoretical access:** Ultra Ball can finally search evolution Garbodor instead of only Basic Pokémon. Root requires at least two positive-DCI hand discards. Secret Box now has a bounded root action only if three positive-DCI cards can be discarded and its Item/Tool/Supporter/Stadium search opens a Garbodor/Trubbish setup path. Search results preserve at most one per category. No game win rate is attached to these heuristic scores.
9. **Enhanced Hammer two-prompt pressure:** rank22's one Enhanced Hammer can select an opposing Pokémon with visibly attached Special Energy and then the specific public Energy, weighted toward Double Dragon in the original Aichi field. An independent research-only reversible hook `simulation/twinleaf/agent5-enhanced-hammer-paper-canplay-hook.cjs` fixes the pinned `EnhancedHammer.canPlay` use of `PokemonCardList.cards` instead of `PokemonCardList.energies.cards`, leaving upstream untouched; fake-runtime tests demonstrate restoration and basic/special discrimination, **not** native-game integration.
10. **Native print identity and V3 output:** pinned Twinleaf `card.fullName` often omits source set-number (e.g. `Vikavolt V DAA`, `Wally ROS`, `Enhanced Hammer TWM`), and Mega Absol ex uses `M1L` instead of source `MEG 86`. Rank22 actor matching now recognizes only source-list set-bound short aliases and explicit `MEG→M1L/M1S` names, rejecting off-source `Garbodor LTR` and `Trubbish PAR`. Worker `createPolicy.decide` converts single-card choices into required `select-choices` for native `card-combination`/`pokemon` multi-select contracts, with a fail-closed minimum bound.

The source card texts are in `resources/cards/en/swsh3.json` for Vikavolt V, `resources/cards/en/me1.json` for Mega Absol ex, and the supplied Advanced Rulebook's C-07 damage-counter semantics. These rule/text-derived interactions are separate from the policy heuristics and unqualified game predictions.

## Evidence

- Source-bound rank22 policy: 38 deterministic tests in `tests/2026-11/agent5-rank22-absol-vikavolt-opponent-policy.test.cjs`. The cases cover all 60 source copies, Vikavolt attack choice, typed Energy, Quick/Ultra Ball, Wally and printed Trubbish variants, Garbotoxin sequencing, Float Stone, Karen and Marnie, exact-six-counter Terminal Period, Battle Compressor, Enhanced Hammer, Secret Box, V3 multi-select forms, pinned native fullName aliases, opening/mulligan setup and role/seat binding.
- Branch policies and tests were loaded/executed through the available JavaScript tool with a minimal in-memory test harness: **38/38 passed**. This is **not** equivalent to a Node 22 CI run, the worker validator, or a pinned Twinleaf Store game.
- Hook-only tests: **5/5** targeted JavaScript fake-Store cases in `tests/2026-11/agent5-enhanced-hammer-paper-canplay-hook.test.cjs` (no actual pinned Store run). Source-level check: `ptcg-server/src/sets/10-scarlet-and-violet/set-twilight-masquerade/enhanced-hammer.ts` at the frozen pinned upstream revision.
- The separate `tests/2026-11/agent5-absol-terminal-period-cardtext-regression.test.cjs` covers both rank-11 versions and rank 8 for all 50/60/70/290/300 damage conditions. Direct branch implementation scoring returned `0/340/0/0` for 50/60/70/300 in all three. The existing rank8 regression was updated and an evolved-Garbodor Tool regression added.
- **Competitively qualified games:** zero. **Top-32 exact source coverage:** 29/32 unchanged. **99.5% win-rate claim:** none.

## Remaining blockers and next native decisions

- The rank22 worker **is not an independently accepted source policy**. In particular, real native setup and item/payment prompts have not been executed through the pinned Twinleaf Store; there is no full-game opponent competence evidence.
- The rank-8 parent has intentionally held-out Tapu Koko Dance of the Ancients, Pokémon Communication and some multi-step recovery/Supporter prompts. This policy inherited those fail-closed paths; they must be handled based on actual owner-visible native prompt traces, not guessed.
- Enhanced Hammer now has actor-visible holder and attached Special Energy selection, **but** pinned Twinleaf `EnhancedHammer.canPlay` inspects Pokémon body cards rather than attached Energy. The separate research-side reversible hook is **not installed** in a native fixture; do not infer that natural-game Enhanced Hammer is playable or that source rank22 is admitted. Other multi-step searches remain held out.
- Two other Absol/Garbodor prototypes (rank8 and rank11) also need independent review of the shared 60-damage Terminal Period score fix; root selection policies can differ.
- Request independent tactical and native protocol review before promoting or merging; do not dispatch any fixture/game or bypass the V3 owner gate.
