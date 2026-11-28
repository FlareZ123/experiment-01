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
- Test: `tests/2026-11/agent25-rank2-native-shape-guzma-lock-pivot.test.cjs`: **50/50** actor-only root and both-role prompt decisions with positive/negative controls, including live/unknown/suppressed Skyliner.
- Test: `tests/2026-11/agent25-rank2-guzma-protocol-validation.test.cjs`: **12/12** tests using the actual strict `agent49-policy-protocol.cjs` init, request, prompt/action-frontier and decision validators with complete source suite-derived actor observations. **Total 189/189 committed branch tests executed in isolated V8** using Node test/assert shims; not Node native test runner.
- Independent developer probe reproduced original policy passing rather than playing untargeted Guzma, and rejecting the own-switch prompt, before branch correction. All three root/opponent-choice/own-choice decisions are individually valid under strict worker contract now. They were **not** resolved sequentially through a live Store; no gameplay outcome is claimed.
- Producer's original suite `tests/2026-11/agent45-rank2-vileplume-control-opponent-policy-v2.test.cjs`: **53/53** V8-executed tests. Before the fixture repair 14/53 failed at the contract validator (`BAD_ACTION_METADATA_TYPE`/`MISSING_FIELD`), before policy decisions were reached. The isolated branch now supplies required public-target `isOwnerVisible`, marks attack selections with the current `selectionType: 'attack'`, and explicitly expects the worker to reject impossible unmodeled prompt classes. Its original strategic expectations were otherwise preserved apart from the strict codebook replacement of two stale abstention strings. This is **not** a native Node CLI or CI run.

## Handoff and limitations

Agent45 owns the original policy and was sent a consolidated review handoff at `communications/agent45/2026-11/20261128T0020Z_agent25-rank2-duplicate-gust-slot-repair.md`. Review and cherry-pick as appropriate, then bump/repin the worker bundle if registered; do **not** dispatch the held V3 fixture or infer any match-winning rate. The full source field remains **29/32** recovered exact lists, **0/32** qualified matchups, no selected final fixed 60.

Next useful proof is a real **same-Store** accepted Guzma PlayCardAction -> opponent ChoosePokemonPrompt -> own ChoosePokemonPrompt witness under an authorized runner, with negative Skyliner/Tool witnesses. Until then the branch is a decision-policy improvement only.

## Verification boundary, 28 Nov 2026

The six exact committed suites are **53 original + 18 duplicate-Guzma + 50 lock-pivot/Skyliner/Active-only suppression/Supporter contention + 12 strict shared-worker protocol + 22 Cassius/Grand Tree identity + 34 TM/Jet/Hood/Hala target identity = 189/189** local V8 tests. These tests use exact source modules and the actual shared worker contract, with isolated `node:test`, `node:assert/strict`, and frozen fixture digest lookup shims; they do **not** prove Node test-runner equivalence, that Guzma's two native prompts settle in a single Store, opponent competence, match wins, or a final fixed deck. A later native acceptance witness is still required before promotion. Fixture Cassius printing was corrected from `XY 123` to the source list's actual `XY 115` on the branch.

## Additional executable target-integrity solutions (same isolated branch)

### Newly Active opponent Ability lock: Wobbuffet / Galarian Weezing

The proposed root may be correct *before* a Guzma target moves but wrong *afterwards*. Opposing **Wobbuffet PHF 36** (*Bide Barricade*: while Active, non-Psychic Pokémon have no Abilities) or **Galarian Weezing RCL 113** (*Neutralizing Gas*: while Active, opposing Pokémon have no Abilities) can be tempting unpowered positive-retreat-cost Bench targets. Gusting either Active can suppress our Colorless Stoutland's *Sentinel* and/or Grass Vileplume's *Irritating Pollen*, defeating the simultaneous-lock goal. Our target enumeration now conservatively rejects those exact printed Active-only lock targets; an alternative unpowered Benched Shadow Rider V can still be chosen. The documented Aichi source 60s at **ranks 7, 10, 21** contain Wobbuffet PHF 36. Source cards confirm texts in `resources/cards/en/xy4.json` and `swsh2.json`. **8 added two-seat root and target-selection assertions** are included in the revised **50/50** Guzma suite. This is a narrowly scoped post-switch veto, not a complete future-board simulator.

### Identical-print Cassius and Grand Tree continuation choices

Two Bunnelby PRC 121 or two Oddish UNB 5 can coexist on rank2's board. The original `Cassius` prompt scorer matched the *first same-print board entry* regardless of physical choice, potentially shuffling a healthy rather than endangered Bunnelby. The original `Grand Tree` prompt scorer found *any eligible same-print* Basic and awarded that eligibility to a *fresh, ineligible* physical copy. `ownedPokemonForChoice` now requires the correct actor-visible `targetZone` and `benchIndex`/`slotIndex` when duplicates exist, applying HP and in-play turn checks to the selected physical Pokémon only. The new `tests/2026-11/agent25-rank2-physical-identity-all-choices.test.cjs` passes **22/22** local V8 cases across both seats, reversals, Active/Bench, mismatched/missing indices and role mismatch. This is decision correctness, not native accepted Cassius/Grand Tree settlement.

### Jet Energy must move the actual TM-bearing Bunnelby

The rank2 fixed original has **two Bunnelby PRC 121, two Technical Machine: Evolution PAR, and two Jet Energy PAL**. Its dedicated Bunnelby + TM: Evolution ALS depends on Jet Energy targeting the **same physical Bunnelby that has the TM attached** so it moves Active ready for Barrage. Original `scoreAction` awarded the same premium to every Bunnelby Jet attachment if **any Bunnelby anywhere** had the TM, which could select the wrong copy. The revised `publicActionTarget` resolves the public native `PLAY_CARD_ACTION` target seat, zone and index; the premium is granted only to the actual Benched TM bearer. Related Counter Gain (Active versus same-print Bench) and Stealthy Hood target scoring now also use physical identity rather than a same-print first match. New `tests/2026-11/agent25-rank2-jet-hood-targets.test.cjs` passes **34/34** local V8 scores and root-choice decisions across seats; some Hood already-equipped action alternatives are synthetic scoring negatives, not asserted native-legal offers.

**Important:** All of the above were saved as runnable code and tests on the unmerged branch, but **no real native Store or matched Aichi game was run**. The next high-value check remains a same-Store action/prompt sequence with the original rank2 and Hood Shield source deck identities under owner-approved execution.

### Supporter contention and exact two-Bunnelby resource sequencing

In a concrete actor-visible state with both `Guzma BUS 115` and `Guzma & Hala CEC 193` playable, the old scoring gave Guzma **185** versus **215** for Guzma & Hala, consuming the unique Supporter use on a search despite an immediately completed Vileplume + Stoutland lock pivot. The bounded Guzma root now scores **230** when its explicit Item-lock, effective Stoutland, powered opposing Active and viable stranded target conditions all hold. This beats Hala (215) and the established Jet-to-TM action (225), but allows free Quick Search (250) and Fan Call (245) first. **6 added two-seat Supporter/Quick Search assertions** cover positive, missing Item lock, and free search. This is a tactical policy ordering preference, *not* a measured match-win edge.

The TM → Jet line also required a first attachment target correction. Previously the `Technical Machine: Evolution` play action scored **178** if *any* Bunnelby and Jet were available, regardless of whether the TM actually targeted Fan Rotom. Now the TM premium requires the *same physically selected Bunnelby* that will be promoted. The later Jet premium independently requires that Bunnelby have the Tool. The added tests exercise TM-to-Bunnelby then Jet-to-that-exact-copy, and a negative when no evolution-stage target exists. Note the Advanced Player's Rulebook C-12 exception: the **TM: Evolution attack can evolve a freshly played Basic** (unlike normal hand/stadium evolution); the negative therefore removes the eligible Basic rather than simply changing its played-turn age.

A related duplicate-print resource issue was resolved in `bunnelbyHasTool`: before this patch it checked only the **first** Bunnelby on the board. With the TM on the second Bunnelby, `Guzma & Hala` could overvalue a redundant TM search. It now scans all Bunnelby copies. A previously attached **Jet Energy is not a Pokémon Tool and cannot retrigger its hand-attachment switch**; an attached Jet is not misclassified as a Tool substitute for the next Jet-from-hand. The local `Jet/Tool` suite now contains **34/34** scored action and root regressions.

No same-Store game or autonomous bilateral match has been played; all conclusions above remain local decision correctness and bounded heuristics.
