# Pokémon TCG Expanded: fixed-60 decision board

**Decision status, 7 November 2026:** **No final fixed 60-card deck is selected; zero competitively qualified games; no demonstrated 99.5% win rate.** The objective remains one unchanged, legal, playable paper Expanded deck against the complete Aichi Open League 2026 Top 32.

## Fixed-60 decision

| Complete comparison 60 | Disposition |
| --- | --- |
| [Rank-1 Shadow Rider tournament reference](aichi-2026/benchmark-shadow-rider.md) | Reference control only. Its equal-weight symmetric mirror gives a conditional 98.4375% upper bound; it is not field-dominant evidence. |
| [Hood Shield v1](aichi-2026/candidate-hood-shadow-rider.md) | Unqualified structural candidate. |
| [Temple v1](aichi-2026/candidate-temple-shadow-rider.md) | Unqualified structural candidate. |
| [New Moon Lockbreaker v1](../results/als/new-moon-lockbreak-60-candidate.md) | Unqualified; print provenance and English proxy differ. Its 2+2 dual-lock package has only a **13.77% optimistic Secret Box-assisted upper bound** for accessing both Items by the first draw after all optional Iron Thorns mulligan bonuses ([analysis](../results/als/new-moon-dual-lockbreak-joint-access-20261107.md)). |

**Selection: none.** Other structural proposals remain unadmitted and do not displace these comparison controls. Preserve every 60 unchanged during comparisons; a tactical witness or native terminal is not a deck-selection result.

## Aichi Top 32 source coverage

**29/32** original opponents have authenticated 60-card name/count inventories. **Ranks 23, 25 and 28 remain missing.** The current leads for ranks 25 and 28 are not authenticated identity-plus-list bridges; rank 23 remains unlocated. The 29 lists are not 29 fully verified historical physical-print lists: 120 Basic Energy artwork annotations across 22 ranks appear to use post-event printings and require provenance normalization. None of the 29 original opponents has passed competitive automated-player admission.

- [Original-source admission matrix](aichi-2026/original-source-admission-matrix-20261102.md)
- [Missing-opponent source audit](aichi-2026/missing-opponent-list-source-audit-20261107.md)
- [Post-event Basic Energy printing audit](aichi-2026/agent17-postevent-basic-energy-printings-20261104.md)

## Current development baseline and evidence

**V8 is selected for developmental common-policy work only.** It is not a final deck, a qualified player, or a win-rate sample. Its independent audit covered four original ranks, eight contexts, both physical source seats, and 128 native roots per attempt: 20 source attack declarations, 19 settled attacks, three source Prize transitions, 19 same-epoch opponent roots, three root caps, five engine errors, and **zero terminal games**. Most opponent replies were weak Pass/low-value actions. A separate retrospective v8-plus-policy treatment reached one native terminal, but remains paper-unqualified and does not change the decision. A newer **fresh-seed v9 VIP A/B/A** covered four contexts (original ranks 6 and 11 against the Champion reference and New Moon) at 240 roots: all physical-opening fingerprints and A/A′ root ledgers matched; each phase had three native terminals, one cap and zero engine errors. The sole B divergence replaced one Pass with an accepted Battle VIP Pass search and two physical Basic Pokémon on Bench; that game still capped. This is an action/custody witness, not a strength result.

V4 and v5 are historical controls. V7 supplied narrower settled-attack witnesses without a source return attack. The v9 paid-retreat A/B/A is **invalid as a treatment test**: its B wrapper never activated, so all phases executed A. Do not infer either benefit or ineffectiveness from it.

- [Independent v8 eight-context audit](methodology/agent32-independent-v8-native-8way-audit-20261106.md)
- [V8 terminal and provenance audit](methodology/agent36-v8-telepath-confirm-default-false-terminal-20261106.md)
- [Corrected v9 A/B/A audit](methodology/agent20-v9-paid-retreat-aba-audit-20261106.md)
- [Agent36 policy acceptance packet](methodology/agent36-issue25-acceptance-packet-20261106.md)

## Principal qualification blockers

1. **Paper fidelity:** pinned Store defects or gaps have been demonstrated in Special Red Card's empty-hand and shuffle behavior, simultaneous KO promotion order, and simultaneous final-Prize resolution. Research-owned fixes remain scoped or opt-in until their tests and integration are independently accepted. See the [Special Red Card source audit](rules/agent44-special-red-card-empty-hand-official-faq-pinned-source-audit-20261107.md), [KO promotion audit](methodology/agent37-simultaneous-ko-promotion-order-e21-20261107.md), and [last-Prize tie audit](methodology/agent37-simultaneous-last-prize-tie-order-20261107.md).
2. **Opponent competence and complete games:** the v8 source-to-opponent roots exist, but most replies are weak and no v8 attempt finished. Root-capped, errored, rejected, retrospective, or staged native actions cannot be scored as wins.
   - A separate Mimikyu Copycat/Burrow A/B/A exposed a policy-composition trap: the default actor-only root wrapper bypasses custom SimpleTacticsAi tactics at live roots. A direct pinned-Store witness confirms that Mimikyu GRI Copycat can settle an immediately preceding Bunnelby PRC Burrow; the zero-Copycat full-game treatment was a wrapper bypass, not evidence of Store rejection. Keep the actor-only information boundary and implement this behavior as an explicit actor-root intent. See the [Agent8 diagnosis and native witness](methodology/agent8-copycat-burrow-actor-root-bypass-20261107.md).
   - The same interaction exposed a separate paper-fidelity gap: the official Pokémon FAQ says Mimikyu's owner may choose either attack after an opponent uses two different attacks via Ω Barrage. Pinned Twinleaf stores only one attack record (the first attack in this flow), so its native Copycat behavior is incomplete for multi-attack turns. Research-side history/selection hooks are required; see the same [Agent8 evidence](methodology/agent8-copycat-burrow-actor-root-bypass-20261107.md).
3. **Official event clock:** the organizer's 25-minute Swiss and Top-32 end-of-time procedures are documented, and bounded implementations have converged on tested cases. No canonical clock implementation has yet been owner-approved; no competitive match receipt includes an independently accepted clock adjudication. See the [official time-adjudication packet](methodology/agent27-aichi-open-official-time-adjudication-20261107.md) and [implementation convergence assessment](methodology/aichi-open-clock-implementation-convergence-20261107.md).
4. **Field completeness:** three original lists and historical printing provenance remain unresolved. All 32 are required before making a full-field claim.

## Next decision-changing release gate

**Owner: Agent36 (shared policy and runner); independent reviewer: Agent41; official clock evidence: Agent27.**

Freeze one v8-derived bilateral policy and preregister a fresh matched A/A′/treatment cohort across authenticated original source lists where the policy has real opportunities, with both physical seats and first-player assignments. Preserve every attempt, including errors, rejected actions and caps. Each accepted line must join the physical printed card, owner-visible legal payment, prompt and target, actual Store transition, public board and Prize changes, a meaningful legal opponent response, and the source's next consequential turn. The release must produce a complete game adjudicated under the organizer's correct stage-specific 25-minute clock, with an independent paper-rules and information-set review.

**This gate qualifies an end-to-end game execution only.** It does not select a deck or demonstrate competitive strength. Keep the exposed root93 deal as a regression fixture; do not add more root93-specific workflow variants. After the gate passes, expand prospective testing to all 32 exact originals, competent adversarial policies, matchup-level outcomes, and uncertainty appropriate to the 99.5% target.

## Research navigation

Start with the [root repository guide](../README.md), the [Aichi studies](aichi-2026/), [Twinleaf fidelity work](twinleaf/), [methodology](methodology/), [statistics](statistics/), and [strategy](als/). The pinned upstream submodule is `vendor/twinleaf`; research adapters remain under `simulation/twinleaf/`. Keep CI manual, preserve failed evidence, and revise this board only when a decision changes.
