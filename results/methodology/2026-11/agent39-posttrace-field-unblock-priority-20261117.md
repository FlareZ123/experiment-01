# Post-trace field-unblock priority queue

**Agent39 · 17 November 2026 · sequencing supplement to the Agent17 panel plan and Agent2 suite contract**

## Purpose and boundary

The [Agent17 Aichi Top 32 panel plan](agent17-aichi-opponent-policy-panel-plan-20261117.md) defines rank coverage and policy-family boundaries. The [Agent2 challenge-suite contract](agent2-policy-challenge-suite-operational-contract-20261117.md) defines what competence evidence must contain. This note supplies the missing execution order: which known engine/policy dependencies unlock the most of the primary field, and which apparent gaps are already closed.

This is a post-trace work queue, not a new worker, branch, fixture, workflow, candidate, policy bundle, seed, or game authorization. It does not widen PR #58. The controlling sequence remains: Agent49 runs the exact-head acceptance gates; after all pass, Agent6 runs and reviews the single unchanged rank-1 natural-terminal diagnostic; only then should the broader work below begin. Resolve a concrete blocker found in that trace first.

## Ordered workstreams after trace review

| Order | Workstream | Exact field reach | Why it is next | Required output |
|---:|---|---|---|---|
| 1 | Shared typed `AttachEnergyPrompt` projection/decoder | **12 confirmed distinct prompt-parameter shapes across 25/29 available lists** (13 confirmed card-source rows; Iron Thorns and Empoleon share one attached-Energy-to-Bench shape; Agent40's Koraidon TEF120 row is excluded pending a direct original-print bridge) | Broadest known prompt-family coverage gap. The current V3 path is limited to the exact Underworld Door / hand / Psychic / Bench / one-assignment shape. | One shared typed representation preserving source zone and cardList indices, actor/owner visibility, target filters, min/max, cancellation, blocked indices, same/different-target constraints and follow-up effects. Extend the worker protocol's `energy-attachment` from single-select to bounded multi-select: opaque pair tokens decode in order to native `{to,index}` assignments; emit an empty-selection token only when min=0; allow cancel only when native `allowCancel` permits it; host-check `blockedTo`, `sameTarget` and `differentTargets`. Do not enumerate complete combinations. Add native source-bound cases for every shape and both physical seats. |
| 2 | Candidate-side prior-turn attack-history receipt for Copycat/Apex | Candidate line relevant to rank 1 and the Regidrago family; exact opponent coverage remains rank-specific | The current policy's current-Active attack heuristic is not sufficient. The V3 resolver currently passes null prior-turn attack/turn inputs, while an Agent7 tracker-backed helper already exists. | Integrate authenticated prior-turn history into the actor-only observation; use the tracker-certified eligible-choice set; fail closed when history is absent or malformed. Test a qualifying attack by a former Active, a current Active with no qualifying prior attack, GX attack, unknown history and malformed receipt. |
| 3 | Original Japanese promo compatibility | Five unchanged primary-field lists: **ranks 3, 6, 7, 24 and 29** | The owner-selected primary benchmark retains these lists unchanged. Palace Book and Palace Belt already exist in the pinned engine; Player's Ceremony is the one identified missing class. | A research-owned Player's Ceremony hook with exact original print identity retained separately from any engine mapping; native tests for once-per-player-turn use, draw 2, and turn end. Do not normalize or remove these opponents. |
| 4 | Electrode / Alolan Raichu prompt and source-fidelity suite | Exact lists **ranks 4, 9 and 17**; rank **25** remains missing | These lists require three materially different prompt families and the pinned source contains two serious Electrode-GX anomalies. | Multi-assignment Extra Energy Bomb (`{to,index}`), unique-source DiscardEnergyPrompt (`{from,index}`), and numeric PutDamagePrompt allocation with 30-damage increments and per-target caps. Native regressions must settle Extra Energy Bomb's zero-transfer branch and Crash and Burn-GX's apparent `30 + 50n²` callback before any matchup uses them. |
| 5 | Rank-specific policy challenge suites | All available ranks, then the full 32 only after exact lists arrive | Shared code is useful only when bound to the exact source 60 and a rank-specific decision envelope. | Apply Agent2's frozen suite schema and Agent17's rank map. Preserve Regidrago variant branches, separate Snorlax ranks 3/7, keep Iron Thorns rank 24 distinct from 6/29, and retain exact Absol/Raichu list differences. No archetype label substitutes for a 60-card binding. |
| 6 | Independent reviewer registry and pre-deal attestations (owner-gated) | Candidate policy plus every admitted rank policy | Required for production competence attestation, but **not** a blocker for the one post-acceptance diagnostic trace. | Only after the owner lifts the explicit outreach hold, provision the four distinct human roles (candidate-policy, opponent-policy, post-game paper/clock, post-game strategy), keep every reviewer independent of all policy and bundle producers, and bind producer IDs plus an external conflict ledger. The current registry is empty; no outreach, recruitment-status change or self-authorization now. |

Agent40's original expanded matrix lists 14 card-source rows and 13 distinct prompt shapes. One row is not admissible as written: the exact-list JSON encodes Koraidon ex TEF 120 at ranks 10, 12, 18, 21 and 27, but the pinned [TEF 120 implementation](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/10-scarlet-and-violet/set-temporal-forces/koraidon-ex.ts) contains Retribution Strike and Kaiser Tackle and no Dino Cry or AttachEnergyPrompt. Dino Cry/AttachEnergyPrompt are in the separate [SVI 125 implementation](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/10-scarlet-and-violet/set-scarlet-and-violet/koraidon-ex.ts), which is not the printing encoded in the available lists. The original Japanese physical printing remains unverified; do not silently substitute SVI 125 for TEF 120. Exclude this Koraidon row from confirmed coverage until a direct original-print bridge exists. The corrected confirmed inventory is **13 card-specific source callbacks and 12 distinct prompt-parameter shapes**. Here, a prompt-parameter shape means the source-zone / energy-filter / target-filter / bounds / cancellation / target-constraint tuple; Iron Thorns ex and Empoleon V are separate callbacks but share one tuple. The 25-rank union remains unchanged because those five ranks have other prompt sources; missing ranks 23/25/28 remain unknown. The protocol limitation is independent of card coverage: adding card-name cases without true bounded multi-select cannot represent Extra Energy Bomb, Regidrago V, ADP-GX or Squawkabilly ex correctly. The companion JSON manifest binds each confirmed row to its exact pinned source file path and preserves the disputed Koraidon mapping separately under `unverified_sources`.

Recomputing the rank union from the matrix gives **1, 2, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21, 22, 24, 26, 27, 29, 30 and 32**. Among the 29 available lists, ranks **3, 7, 15 and 31** have no listed AttachEnergyPrompt source; missing ranks **23, 25 and 28** remain unknown, not negative cases.

Counting confirmed source rows per available rank (a complexity count, not a strength score) gives: **4** sources at ranks 10, 13, 14, 19, 20, 21 and 30; **3** at 8, 12, 18, 27 and 32; **2** at 1, 4, 9, 11, 16, 17 and 22; **1** at 2, 5, 6, 24, 26 and 29; **0** at 3, 7, 15 and 31. Missing ranks remain unclassified.

The breadth figures above are source-coverage counts, not estimates of win-rate impact or implementation effort. If the first accepted trace identifies a narrower concrete blocker, resolve that blocker before following this queue.

## Explicitly closed or de-scoped work

1. **Do not add EnergyCard `useFromHand` / attached-Energy `useWhenInPlay` enumeration for Capture Energy, Jet Energy or Speed Lightning Energy.** At the pinned Twinleaf revision, their printed effects resolve automatically from the native `AttachEnergyEffect` during hand attachment. The Aichi inventory is 7/29 lists (30 copies), but the action-frontier omission is not established for these cards. Native attachment regressions are appropriate; a new EnergyCard action family is not.
2. **Do not generalize the Telepath source-origin defect to the Aichi AttachEnergyPrompt family.** The 13 inspected Aichi prompt callbacks use `MOVE_CARDS`; none constructs the specific `AttachEnergyEffect` involved in that reproduction. The available 29 lists contain no Solgaleo-GX / Sol Burst-GX caller. The three missing source lists remain unknown, but no generic Telepath patch is justified by the available Aichi paths.
3. Do not call the five Japanese-Extra lists Expanded-legal. The primary estimand is an Expanded-legal candidate against unchanged original Japanese Extra opponents; strict Expanded-vs-Expanded remains a separate secondary estimand.
4. Do not create another runner, validator, CI lane, or parallel acceptance branch. Do not start games, change the candidate 60, tune policies, or change seeds before the current exact-head gates and first-trace review.

## Evidence and admission contract

Each workstream should produce source-bound cases under the existing Agent2 suite contract:

- bind the exact source rank, exact 60-card print identities, pinned Twinleaf revision, research-hook revision, policy/dependency hashes and actor-visible observation;
- distinguish `source-natural`, `native-staged` and `synthetic` cases; synthetic cases are regression support, never sole evidence for a core plan;
- record a decision envelope, full cost ledger, prompt shape, actual chosen action, native effect receipt and trace digest;
- review reachability, legality/cost, strategic adequacy and execution integrity; use `pass`, `blocked` or `fail`, never an implicit pass for missing evidence;
- cover both physical seats where relevant and preserve unsupported paths as blocked.

The reviewer registry is an explicit later production gate, not a reason to delay the first diagnostic. Agent2's contract records the owner's hold on outreach/provisioning; keep that hold intact until the owner resumes it.

The eventual primary field remains **32 ranks × 2 candidate physical seats × 2 actual first-player assignments = 128 strata**. The 29 currently available source lists imply at most 116 source-rank strata; the current 24-rank English Expanded diagnostic subset implies 96. Ranks 23/25/28 are absent, never byes. No full-field aggregate is permitted until all 32 exact lists and independently competent rank-specific policies are admitted. Reuse Agent12's existing statistical contract; do not invent another estimator or confuse the **640-game aggregate field-mean all-win floor** (5 games per 128-cell stratum) with the stronger **128-cell simultaneous per-matchup all-win design** (323 games per cell; 41,344 total).

## Source basis

- [Machine-readable Aichi AttachEnergyPrompt source manifest](agent39-aichi-attach-energy-prompt-manifest-20261117.json) (includes exact pinned source paths, rank-to-source IDs and rank-to-shape mappings)
- [Agent17 Aichi Top 32 opponent-policy panel plan](agent17-aichi-opponent-policy-panel-plan-20261117.md)
- [Agent2 policy-challenge-suite operational contract](agent2-policy-challenge-suite-operational-contract-20261117.md)
- [Agent3 Energy attach-trigger and Aichi prompt-source audit](../../aichi-2026/2026-11/agent3-energy-attach-trigger-field-exposure-20261115.md)
- [Agent6 Copycat prior-turn eligibility and V3 integration gap](../../aichi-2026/2026-11/agent6-copycat-last-turn-eligibility-v3-integration-gap-20261115.md)
- [Agent43 Japanese-only promo engine feasibility](../../../communications/broadcast/2026-11/20261113T170000Z_agent43-japanese-promo-engine-feasibility.md)
- [Agent40 expanded Aichi AttachEnergyPrompt source matrix (original, with Koraidon row now disputed)](../../../communications/agent49/2026-11/20261115T173951Z_agent40-aichi-attach-energy-prompt-matrix.md)
- [Exact Aichi source decklists](../../aichi-2026/full-decklists.json)
- [Pinned TEF 120 Koraidon ex source](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/10-scarlet-and-violet/set-temporal-forces/koraidon-ex.ts)
- [Pinned SVI 125 Koraidon ex source (Dino Cry)](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/10-scarlet-and-violet/set-scarlet-and-violet/koraidon-ex.ts)
- [Agent40 energy-attachment multi-select protocol gap](../../../communications/agent49/2026-11/20261115T174229Z_agent40-energy-attachment-multiselect-protocol-gap.md)
- [Agent44 Electrode / Alolan Raichu prompt and source audit](../../aichi-2026/2026-11/agent44-ranks4-9-17-electrode-prompt-and-damage-audit-20261115.md)
- [Agent17 Regidrago policy-family variance](agent17-regidrago-policy-family-variance-20261117.md)
- [Agent17 multi-list archetype policy-reuse boundaries](agent17-aichi-multilist-policy-variance-20261117.md)
- [Statistical methodology index](../../statistics/README.md), which distinguishes the 128-cell nomination standard from the older 64-cell estimands and aggregate field-mean certificates

**Evidence classification:** rank coverage, prompt shapes and pinned source findings are repository evidence; the workstream ordering is a prioritization judgment; no implementation, native regression, matchup, win-rate, or 99.5% claim is made by this supplement.
