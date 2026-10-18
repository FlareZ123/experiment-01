# Agent 26: prospective source-input alignment and actual post-setup comparability

**18 October 2026.** Evidence category: campaign design and source-root observation. This experiment deliberately does **not** estimate a competitive game-win rate or alter the nominated fixed candidates.

## Problem and predeclared contrasts

The source-locked comparison campaign reuses a decorrelated, seeded physical slot across the reference, Hood and Temple candidate variants. Their source row order places most shared printings at different physical input indices, as [Agent 44's exact audit](agent44-candidate-position-coupling.md) demonstrated. Equal seed does **not** imply matched opening hands when physical input positions differ.

Against the published rank-1 reference, the original arrays have **28/60 same-printing source positions for Hood** and **19/60 for Temple**, although each candidate shares **55/60 printing-identical copies**. For a single ideal uniform seven-position selection from common index positions, the previously audited probability all selected positions match is **0.306582% Hood** or **0.013047% Temple** in source order. A maximal 55-index printing alignment makes the ideal calculation **52.543783%** for either. This is a property of the physical *input positions*, not a prediction of realized starting-hand equality, gameplay causal comparability or wins.

**Prospective question:** with printed cards, candidate policy, opponent identity and pinned simulator held fixed, does a newly aligned source-input arrangement lead to more similar *actual* post-setup candidate hands/Active/Bench and Prize identities under common scheduled seeds? The empirical answer is allowed to be negative. Rank 6 Iron Thorns and two v3 physical-slot seeds provide a bounded diagnostic, not a representative opponent sample.

## Versioned implementation

- [Printing-preserving input preparation](../../simulation/evaluation/aichi-candidate-input-order.cjs) uses [Agent 44's documented algorithm](../../scripts/aichi-position-coupling.cjs). It chooses the 55 shared reference printing positions where possible, then carries each *original printing's actual resolved engine ID* to its new input index. The exact 60-engine-ID multiset is preserved, including ambiguous or aliased engine IDs, with no card added or removed.
- [Campaign runner](../../simulation/evaluation/aichi-campaign-runner.cjs) accepts `inputOrderProtocol: 'source-row-order-v1'` by default, or the opt-in `'reference-aligned-v1'`. Existing source plans, candidate print digests, seed schedules, historical trial IDs, opponent input arrays, game rules and policy flags remain unchanged. Executed and original engine input hashes, printing-order hashes, common copy counts and overlap before/after are recorded per completed trial.
- [Evidence envelope](../../simulation/evaluation/aichi-evidence-envelope.cjs) requires the completed record's input-order label, expected physical-seat deck hash, copy-overlap counts and order consistency to agree. [Condition comparison](../../simulation/evaluation/aichi-evidence-envelope.cjs) now fails if two archives used different input-order protocols, even if their decklist/campaign digests and RNG seeds agree. This prevents falsely classifying source-versus-aligned arm results as the *same* experimental condition.
- [Regressions](../../tests/aichi-campaign-runner.test.cjs) verify preservation of printing and resolved-ID multisets, 58/60 alignment on an independent small symbolic example, exact physical-seat deck hashes, schedule digests and mismatched-protocol rejection. The [existing manually dispatched benchmark CI 39085693036](https://github.com/FlareZ123/experiment-01/actions/runs/39085693036) **passed** after two fixture corrections on earlier manually dispatched CI. This is a pure-source regression, not engine-play validation.

## Actual pinned Store probe, separate from historical campaign

A further [read-only setup-zone observer](../../simulation/twinleaf/opening-setup-zones.cjs) captures the post-setup first-turn state; the [scoped Store wrapper](../../simulation/evaluation/aichi-setup-zone-capture.cjs) restores the original Store dispatch method after every synchronous game and never feeds the observation to either player's policy. The [manual source-locked probe](../../simulation/evaluation/aichi-input-order-deal-probe.cjs) schedules five input arrangements for each physical slot (10 bounded games total, maximum 100 actions each):

1. Champion reference in its unchanged source order.
2. Hood in original row order.
3. Hood aligned independently to champion.
4. Temple in original row order.
5. Temple aligned independently to champion.

All arms use the identical rank-6 source 60, fixed v3 slot seeds, engine-card resolver, ordinary SimpleTacticsAi and opt-in strict prompt validation and separated policy RNG. The capture includes each candidate's actual turn-order label and detached hand/Active/Bench/Prize printing identities at the first Store turn. Its comparison computes *post-setup multiset overlaps*, separately from the ideal index-coupling calculation. Some setups have mulligans and optional bonus draws; the observer therefore explicitly declines to claim it reconstructs the original seven-card hand.

The established manual workflow [`aichi-source-locked-campaign.yml`](../../.github/workflows/aichi-source-locked-campaign.yml) now supports an optional source-setup test in place of six extended game diagnostics. It retains the original branch as the default. No push-triggered CI was enabled.

## Compiled first-turn experiment outcome (18 October)

**Pinned manual [CI 39086384962](https://github.com/FlareZ123/experiment-01/actions/runs/39086384962) passed**, at exact research commit `a5f44195da21767e5be66a55a0f9b33d113da27c`. The predecessor [CI 39086071193](https://github.com/FlareZ123/experiment-01/actions/runs/39086071193) also passed but redirected its full JSON to an artifact without printing the compact contrast to the job log. The rerun emitted the exact summary in the successful job log and archived 10 root post-setup states in [artifact 12120434730](https://github.com/FlareZ123/experiment-01/actions/runs/39086384962/artifacts/12120434730), ZIP SHA-256 `db8c33567c155fc5ed0c747f12d158d794cccc420cbc94846ce6c33553a74521`.

All ten real pinned-Store runs captured post-setup zones. There were **zero engine exceptions**. The actual physical candidate went first in every A arm and second in every B arm, confirmed for the source and aligned branches. Opponent full post-setup zone digests were **identical** between native and aligned arms within each candidate and seed. The outcome evidence compares hand + Active + Bench card multiset intersections with the same-seat source-reference setup, and separately compares all six Prize printing identities. This is one realized, finite sample under two fixed v3 seeds.

| Candidate, physical seat and seed | Matching source printing *input positions* native → aligned | Candidate exposed post-setup copies shared with reference native → aligned | Prized copies shared with reference native → aligned |
| --- | ---: | ---: | ---: |
| Hood A, `1509836216` | 28 → 55 | **6 → 9** | **3 → 5** |
| Temple A, `1509836216` | 19 → 55 | **5 → 9** | **2 → 5** |
| Hood B, `995631139` | 28 → 55 | **5 → 7** | **3 → 6** |
| Temple B, `995631139` | 19 → 55 | **4 → 6** | **3 → 6** |

All four frozen, same-seed, same-seat comparisons increased the realized reference hand-and-in-play overlap, and all four increased Prize overlap. **This confirms feasibility of the position-aligned coupling method on these source deals.** It does not prove a general rate improvement, actual starting-seven equality, or that later policy actions remain counterfactually comparable. Agent44's source-printing maximum pertains to input positions; the realized post-setup overlaps are a separate measurement. The experimental post-setup capture is internal and contains hidden cards. It is an evidence observer and must remain outside AI decision inputs.

The workflow completed despite an upstream nested-submodule cleanup warning after uploading the artifact. Its main compilation, probe execution and artifact step succeeded. Follow-up evidence needed: a randomized multi-seed design, replay checks of instrumentation noninterference, K0-safe decision policies, and eventually matched full opponent games with complete rule qualification.

## Acceptance and limits

A successful compiled probe must produce actual turn-one Store snapshots with intact source-deck hashes, legal initialized zones and recognized physical slot; it must preserve all candidate and opponent 60-card identities. A missing snapshot, draw-log mismatch, different opponent post-setup zones, lower actual card overlap, or unverified start-order matching is valuable adverse evidence to report.

No result may be promoted to strategy superiority until simulator rules, player decision competence, full Source/Paper mechanics and all 32 fixed opponent lists have been independently qualified. Even a highly aligned deal does not guarantee a matched game trajectory, and observation of both players' hidden Prize cards is **research-only evidence** inaccessible to a real K0 player. The Store wrapper's noninterference with complete later game play has not yet been independently proven; the probe is limited to first-turn evidence.

**Strategic status unchanged:** 29 of 32 exact opponent 60s, zero qualified competitive games, no 99.5% demonstration.
