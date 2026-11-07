# Aichi Open League Japanese Extra: fixed-60 decision board

**Decision status, 7 November 2026:** No final fixed 60-card deck is selected. There are zero competitively qualified games and no demonstrated 99.5% win rate. The Aichi Open League 2026 Open division is officially Japanese Extra, with BW-onward regulation, 60 cards, six Prizes and Japanese-language cards. Individual card and historical-printing admission remains open. See the [official format and event-rules source map](aichi-2026/2026-11/agent12-official-format-rules-and-mulligan-20261107.md).

## Fixed-60 comparison

| Complete comparison 60 | Current disposition |
| --- | --- |
| [Rank-1 Shadow Rider reference](aichi-2026/benchmark-shadow-rider.md) | Reference control only. Its equal-weight symmetric mirror gives a conditional 98.4375% upper bound, not a field result. |
| [Hood Shield v1](aichi-2026/candidate-hood-shadow-rider.md) | Unqualified structural candidate. |
| [Temple v1](aichi-2026/candidate-temple-shadow-rider.md) | Unqualified structural candidate. |
| [New Moon Lockbreaker v1](../results/als/new-moon-lockbreak-60-candidate.md) | Unqualified. Its 2+2 dual-lock package has a 13.77% optimistic first-draw access upper bound under the stated assumptions ([analysis](../results/als/new-moon-dual-lockbreak-joint-access-20261107.md)). |

**Selection: none.** These lists are comparison controls and proposals. None has passed competitive automated-player admission.

- [New Moon Lockbreaker Japanese print audit](legality/agent39-newmoon-lockbreaker-print-audit-20261107.md): 34 exact physical print identities, 32 retained from an Aichi source deck and two pre-event additions; zero exact restricted-print collisions. Full paper legality remains provisional, and the Cologne once-per-turn hook is absent from current v10/v10b runners.

## Benchmark admission

**29/32** original Top 32 opponents have authenticated 60-card name/count inventories. Ranks **23, 25 and 28** remain missing. The 29 inventories do not establish all historical Japanese printings: 120 Basic Energy artwork annotations across 22 ranks appear to use post-event printings and need provenance normalization. Forty original printing rows still lack exact native IDs, including 35 Basic Energy rows, four Player's Ceremony rows and one Electrike PRC 60 row. Engine construction readiness is not paper legality.

- [Original-source admission matrix](aichi-2026/original-source-admission-matrix-20261102.md)
- [Missing-opponent source audit](aichi-2026/missing-opponent-list-source-audit-20261107.md)
- [Post-event Basic Energy printing audit](aichi-2026/agent17-postevent-basic-energy-printings-20261104.md)

## Development evidence

**V8 is the selected developmental common-policy baseline only.** Its independent eight-context audit recorded 20 source attack declarations, 19 settled attacks, three source Prize transitions, 19 same-epoch opponent roots, three root caps, five engine errors and zero terminal games. Most opponent replies were weak Pass or low-value actions. See the [independent v8 audit](methodology/agent32-independent-v8-native-8way-audit-20261106.md) and [v8 provenance review](methodology/agent36-v8-telepath-confirm-default-false-terminal-20261106.md).

The frozen [v10b fresh-seed A/B/A registration](aichi-2026/registrations/agent36-issue25-common-v10b-paired-fresh-aba-260root-20261107.json) compares the Champion reference and New Moon across four authenticated source ranks, both source seats, eight paired trials and a 260-root cap. It is a developmental VIP-policy comparison, not a deck-selection or win-rate experiment. The v9 paid-retreat A/B/A is invalid because its B wrapper never activated. See the [paid-retreat audit](methodology/agent20-v9-paid-retreat-aba-audit-20261106.md).

The v7 Snap Trap source-to-live-prompt join is a phase-A diagnostic witness only. Eight native attempts yielded six terminals, one cap and one engine error. No prompt was resolved and no game qualified. The exact pinned ChooseCardsPrompt response and MoveCardsEffect contract is now documented, but a separate native settlement test remains pending. See the [v7 source-zone result](methodology/agent12-v7-snap-trap-source-zone-join-success-20261107.md) and [Snap Trap prompt-resolution contract](methodology/agent30-snap-trap-native-prompt-resolution-contract-20261107.md).

## Qualification blockers

- **Paper fidelity:** pinned Store gaps have been demonstrated in Special Red Card handling, simultaneous KO promotion and simultaneous final-Prize resolution. Research corrections remain scoped or opt-in pending independent paper-rule tests and integrated acceptance.
- **Policy and complete games:** current source-to-opponent policies have produced useful action witnesses, but opponent replies remain weak and complete paper-valid games have not been demonstrated. Preserve actor-owned information and audit payment, prompt, target, settlement and continuation.
- **Event clock:** official Swiss and Top 32 procedures are documented. The clock implementation still needs independent acceptance in a paper-game receipt. See the [official time-adjudication packet](methodology/agent27-aichi-open-official-time-adjudication-20261107.md) and [implementation convergence assessment](methodology/aichi-open-clock-implementation-convergence-20261107.md).
- **Full field:** obtain the three missing originals, normalize historical Japanese printings, and report all 32 matchup outcomes separately.

## Next gate

**Shared-policy owner: Agent36. Independent reviewer: Agent41. Event-clock owner: Agent27.** Run the frozen v10b cohort under its existing registration. Preserve every attempt, error, rejection and cap. Do not add another root93-specific workflow or policy variant.

The cohort cannot qualify a competitive game. Promotion requires one complete paper-valid source game with printed-card identity, owner-visible legal payment, prompt and target, actual Store settlement, public board and Prize changes, meaningful legal opponent response, source continuation, the official stage-specific clock, and independent rules and information-set review. Deck selection and any win-rate estimate require prospective testing against all 32 authenticated originals with matchup-level outcomes and uncertainty.

## Research navigation

Start with the [repository guide](../README.md), [Aichi studies](aichi-2026/), [methodology](methodology/), [Twinleaf fidelity work](twinleaf/), [statistics](statistics/) and [strategy candidates](als/). For the 99.5% evidence standard, see the [balanced-field confidence gate](statistics/agent12-exact-balanced-field-all-win-bound-20261107.md), [heterogeneous field bound](statistics/agent12-heterogeneous-kl-field-confidence-bound-20261107.md) and [simultaneous matchup bound](statistics/agent12-simultaneous-128-stratum-matchup-confidence-20261107.md). The pinned upstream submodule is `vendor/twinleaf`; research adapters belong outside it. Keep research CI manually dispatched and preserve all failed evidence.