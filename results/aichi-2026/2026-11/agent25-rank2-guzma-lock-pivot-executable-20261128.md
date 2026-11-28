# Rank-2 Vileplume Control: executable two-stage Guzma lock pivot (Agent25, 2026-11-28)

**Status:** isolated unmerged branch implementation, local actor-visible decision and strict worker-protocol evidence only. **Not** native Store execution, registered policy, qualified matchup, field evaluation, or evidence toward a demonstrated 99.5% game win rate.

## Why this line is directly relevant

The rank-2 Takahiro Ando source 60 (`results/aichi-2026/full-decklists.json`) has **2 Guzma BUS 115, 1 Stoutland BCR 122, 2 Vileplume AOR 3, 2 Bunnelby PRC 121, 3 Stealthy Hood UNB 186**. Stoutland's *Sentinel* locks the opponent's Supporters while Stoutland is Active; Vileplume's *Irritating Pollen* locks both players' Item cards. The leading Hood Shield candidate (`results/aichi-2026/candidate-hood-shadow-rider.json`) carries **4 Shadow Rider Calyrex V CRE 74, 4 VMAX CRE 75, 1 Latias ex SSP 76, 1 Float Stone**. `Latias ex`'s *Skyliner* removes Basic Pokémon Retreat Costs while effective. These card texts are present in the repository card database (`resources/cards/en/bw7.json`, `xy7.json`, `sv8.json`).

A promising but conditional line is: Vileplume Item lock on Bench, live Stoutland on Bench, opposing Active Shadow Rider VMAX has Energy, opposing Benched Shadow Rider V does not and has positive printed Retreat Cost -> play Guzma (Supporter), pull the nominally stranded V into Active, switch own Stoutland into Active, layering Supporter and Item lock. This is not a forced win: other card effects, draw engines, future attachments, opponent choice, or unavailable pieces can invalidate the trap. A live opposing Latias ex specifically defeats the Basic free-retreat premise.

## Native-shaped decision failures found and corrected

1. The original rank-2 policy's `scoreAction` only rewarded Guzma when the root action already contained `publicMetadata.targetIndex`. Native `PLAY_CARD_ACTION` starts **without** that selected target; the opponent/actor choices arrive in two subsequent `ChoosePokemonPrompt` continuations. Hence the nominal line was never initiated by an ordinary legal root.
2. The initial prompt scorer required `ownerSeat=opponent` for **every** Guzma Pokémon prompt; its second, own-switch prompt therefore rejected every actor Bench target.
3. Two identical-print opposing Bench Pokémon were scored using `bench.find(samePrinting)`. A 20-HP-remaining physical target and healthy copy were indistinguishable, causing missed tactical choices. `selectionIndex` is the choice ordinal, not the physical Bench slot; the actual `agent36-prompt-projection.cjs` separately exposes `benchIndex`.

The isolated branch fixes a **specific, defensible** untargeted Guzma root via a public Item-lock/Stoutland/nominal-retreat predicate; uses the opponent's public physical Bench slot and ownership for the first prompt; uses actor-owned physical Bench choices and a live Stoutland preference for the second; refuses ambiguous same-print choices; and vetoes nominal traps through potential live Latias Skyliner and modeled free-retreat Tools. Verified suppression permits the Latias line to be re-evaluated. It does not globally implement every strategically useful Guzma action.

A separate real worker-ABI issue was found: six preexisting rank-2 abstention reason strings were absent from `agent49-policy-protocol.cjs`'s closed codebook. Those branch strings have been mapped to existing public reasons; two original test expectations were updated **on the branch only**. The source challenge suite itself is unchanged.

## Executable evidence and files

- **Branch:** `agent25/rank2-duplicate-gust-target-20261128`, unmerged.
- Policy module: `simulation/evaluation/2026-11/agent45-rank2-vileplume-control-opponent-policy-v2.cjs`.
- Test: `tests/2026-11/agent25-rank2-duplicate-gust-target.test.cjs`: **18/18** local executable V8 decisions.
- Test: `tests/2026-11/agent25-rank2-native-shape-guzma-lock-pivot.test.cjs`: **36/36** actor-only root and both-role prompt decisions with positive/negative controls, including live/unknown/suppressed Skyliner.
- Test: `tests/2026-11/agent25-rank2-guzma-protocol-validation.test.cjs`: **12/12** tests using the actual strict `agent49-policy-protocol.cjs` init, request, prompt/action-frontier and decision validators with complete source suite-derived actor observations. **Total 119/119 committed branch tests executed in isolated V8** using Node test/assert shims; not Node native test runner.
- Independent developer probe reproduced original policy passing rather than playing untargeted Guzma, and rejecting the own-switch prompt, before branch correction. All three root/opponent-choice/own-choice decisions are individually valid under strict worker contract now. They were **not** resolved sequentially through a live Store; no gameplay outcome is claimed.
- Producer's original suite `tests/2026-11/agent45-rank2-vileplume-control-opponent-policy-v2.test.cjs`: **53/53** V8-executed tests. Before the fixture repair 14/53 failed at the contract validator (`BAD_ACTION_METADATA_TYPE`/`MISSING_FIELD`), before policy decisions were reached. The isolated branch now supplies required public-target `isOwnerVisible`, marks attack selections with the current `selectionType: 'attack'`, and explicitly expects the worker to reject impossible unmodeled prompt classes. Its original strategic expectations were otherwise preserved apart from the strict codebook replacement of two stale abstention strings. This is **not** a native Node CLI or CI run.

## Handoff and limitations

Agent45 owns the original policy and was sent a consolidated review handoff at `communications/agent45/2026-11/20261128T0020Z_agent25-rank2-duplicate-gust-slot-repair.md`. Review and cherry-pick as appropriate, then bump/repin the worker bundle if registered; do **not** dispatch the held V3 fixture or infer any match-winning rate. The full source field remains **29/32** recovered exact lists, **0/32** qualified matchups, no selected final fixed 60.

Next useful proof is a real **same-Store** accepted Guzma PlayCardAction -> opponent ChoosePokemonPrompt -> own ChoosePokemonPrompt witness under an authorized runner, with negative Skyliner/Tool witnesses. Until then the branch is a decision-policy improvement only.

## Verification boundary, 28 Nov 2026

The four exact committed suites are **53 original + 18 duplicate-target + 36 three-decision lock/Skyliner + 12 shared-worker protocol = 119/119** local V8 tests. These tests use exact source modules and the actual shared worker contract, with isolated `node:test`, `node:assert/strict`, and frozen fixture digest lookup shims; they do **not** prove Node test-runner equivalence, that Guzma's two native prompts settle in a single Store, opponent competence, match wins, or a final fixed deck. A later native acceptance witness is still required before promotion. Fixture Cassius printing was corrected from `XY 123` to the source list's actual `XY 115` on the branch.
