# Agent 41: independent original-artifact proof that speculative Supporter validation doubled native acceptance telemetry

**3 November 2026 | Status: reproducible positive instrumentation correction, zero competitive games.**

## Question and source custody

Can the previous eight-group bilateral `PlaySupporterTactic` purity run's `76` accepted proposal actions be trusted as distinct real Store actions? Were the differences caused by gameplay changing after the observer was fixed, or by changing only the accounting?

Downloaded the original binary ZIP artifacts from the two successful manual CI runs without re-executing Twinleaf or selecting new seeds:

| Archive | Original GitHub Actions run | Artifact | Original ZIP SHA-256 | Extracted JSON SHA-256 | Research head |
| --- | --- | --- | --- | --- | --- |
| v1, before Store distinction | [41734609939](https://github.com/FlareZ123/experiment-01/actions/runs/41734609939) | `13277284554` | `b2b2fcb18df18055c0c842d392e1717b3aa1aa1eaa01559f0f060b4473809da7` | `e224fdabe4aca7a85b6ac350720d218e861537669d4d55b89c9fb4a85ac37e1f` | `cf9a0f3212a7c0ad6c8df9c41385bac22aabe223` |
| v2, real Store gated | [41736046880](https://github.com/FlareZ123/experiment-01/actions/runs/41736046880) | `13278698258` | `4c02659b637f7293fb4d03d1c2949a81fee869e7a06ebb4b91f79a874d52f63a` | `d97821d33f060c660e130f023581c3dbcfc4e3779c3521d67a64c398717709ea` | `509634ebc7a423486db7c7120f9c6df5a292d815` |

Both ZIPs contain `agent20-supporter-proposer-purity-bilateral8-native.json`, using exactly the precommitted registration `results/aichi-2026/registrations/agent20-native-supporter-proposal-purity-bilateral-8original-20261103.json` on Agent20's research branch. Pinned vendor commit: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The experiment has four rank-pair × historic/fresh seed groups and **two primary-owner physical seats each**, with A/B/A three-arm comparisons for **8 groups/24 attempted native games**, maximum 90 Store actions per attempt.

## Independent archive-to-archive comparison

A local read-only Python JSON audit decoded both archived ZIP members, compared all eight rows by original-rank pair, seed kind, seat, seed, `fullPhysicalParity`, `fingerprints`, `repeatedControl`, `firstActualRootDivergence` and all three complete `rootActionLedger` arrays. For each row, it compared each of original control, purity treatment and repeated original control, rather than relying on the two scripts' summary counts. The observed comparisons:

- **24/24 complete archived root action ledgers are identical between v1 and v2**, including each of the eight treatment episodes. All eight original full-deal fingerprint arrays match across runs and all eight control-repeat fingerprints are unchanged. Original repeated-control parity passes **8/8** within both archived runs.
- The same **38** native owner proposals in each version triggered a precisely `0→currentTurn` Supporter quota mutation and research-side rollback. Neither version produced a Store error; all **24** attempts have `status:'executed'`. All eight selected treatment first divergences are actual real-root `PassTurnAction→PlayCardAction`, with the same first-divergence ordinal and matching preceding actions in the two runs.
- v1 reported **76** accepted previously restored actions. v2 reports **38 real accepted** plus **38 speculative Simulator accepted** actions, **zero** real and speculative rejected actions. Every v1 per-group accepted count is exactly double the corrected v2 real accepted count. The difference is purely receipt classification for this frozen dataset.
- Crosschecked each of the **38** v2 `previouslyRestoredProposals` with a genuine treatment `rootActionLedger` `PlayCardAction` on the same original owner seat and native turn. All 38 find a corresponding root after normalizing the single printed alias `Pokemon Ranger STS` to the native ledger name `Pokémon Ranger`. No matched (seat, turn, card) group had more than one physical `PlayCardAction`, so this check is unambiguous for the archived cases. A later card-effect legality check remains distinct.

### Per-group measured acceptance attribution

| Original rank pair | Kind | Primary seat | Reversed proposals | v1 reported accepted | v2 real accepted | v2 speculative accepted |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| 6 vs 9 | historical | A | 7 | 14 | 7 | 7 |
| 6 vs 9 | historical | B | 6 | 12 | 6 | 6 |
| 5 vs 11 | historical | A | 3 | 6 | 3 | 3 |
| 5 vs 11 | historical | B | 5 | 10 | 5 | 5 |
| 6 vs 9 | fresh preselected | A | 6 | 12 | 6 | 6 |
| 6 vs 9 | fresh preselected | B | 6 | 12 | 6 | 6 |
| 5 vs 11 | fresh preselected | A | 4 | 8 | 4 | 4 |
| 5 vs 11 | fresh preselected | B | 1 | 2 | 1 | 1 |
| **Total** | | | **38** | **76** | **38** | **38** |

### Printed Supporter and one-per-turn source check

Independently read every English card-file JSON in the supplied complete card database (180 ZIP entries in total, card records under `cards/en/*.json`), selected all `supertype:'Trainer'` records containing subtype `'Supporter'`, and compared their normalized names with every treatment `PlayCardAction` in the eight full Store root ledgers. This finds **38 matching physical Supporter card-play actions** and **zero additional unclassified Supporter plays**. The 38 actual Play roots all correspond to the 38 v2 restored receipts. Grouped by `(physical seat, native global turn)`, **zero cases have two Supporter Play roots on the same turn** within the observed episodes. Unicode accent normalization resolves the single `Pokemon Ranger` / `Pokémon Ranger` naming discrepancy; it does not change card identities.

This supports the **necessary paper one-Supporter-per-turn** condition for the 38 observed roots. It cannot certify the full printed Supporter payment/target/effect, legal Stadium/Item context, optimal tactical choice, original Japanese print status or independent matchup-game result.

## Mechanism and repair

Pinned `SimpleTacticsAi.isValidAction` builds a cloned `Simulator` whose distinct `Store.dispatch` sees **the same exact Action instance** before the action is ever sent to the live Store. Agent20's v1 `Store.prototype.dispatch` wrapper found receipts by `WeakMap<Action,Receipt>` with no Store identity check, causing the speculative successful validation and real Store acceptance to both increment the same counter. Agent20's v2 tests and code distinguish real `this===live` dispatch from speculative dispatch and preserve distinct counters. See [the pinned source audit](agent41-pinned-native-proposal-mutation-and-speculative-dispatch-20261103.md) and [Agent20's native single-root prerequisite](../aichi-2026/2026-11/agent20-original6v9-guzma-native-supporter-quota-rollback-20261103.md).

**Interpretation:** the earlier broad integration's claimed `76` accepted real Supporter roots was numerically wrong, while its **38 owner quota-restoration events and underlying recorded real action histories** survive independent cross-version comparison. Even the corrected 38 accepted native Supporter roots do not establish that a strategically optimal Supporter was chosen, card effects and costs were paper-valid in every case, or the opponent was competently responding.

## Limits and next gate

The replay uses just original source ranks 6/9 and 5/11, including historical seeds, under a 90-action research cap. It is a paired native instrumentation experiment, with **zero competitively qualified games**, no new fixed-60 candidate and no field win-rate evidence. An observer's apparent action acceptance must be linked to one authentic Store identity, root action ledger, paid prompt, card resolution, relevant public/owner-visible state and opponent continuation. The existing Agent22 `agent22-supporter-proposal-state-audit.cjs` already performs `this===rootStore` gating and could supply an independent regression lane without another competing production hook.

Cross-agent attribution: Agent41 detected the speculative Store receipt hazard and sent the direct handoff `communications/agent20/20261103T2303Z_agent41_supporter_purity_clone_dispatch_receipt_guard.md`. Agent20 promptly implemented the v2 correction and ran its native CI. This note independently reconciles both original artifacts. No upstream vendor files changed.

**Current common-deck benchmark:** 29 authenticated original Top32 paper sixties (ranks 23,25,28 unavailable), zero competitively qualified games, no selected winning 60 or demonstrated 99.5% rate.
