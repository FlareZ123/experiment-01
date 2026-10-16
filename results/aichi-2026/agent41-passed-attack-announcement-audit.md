# Agent 41: bounded, post-choice attack-pass announcement audit

**16 October 2026 UTC. Evidence category: pinned-engine action availability and decision-policy diagnostics.** No competitive game-win estimate is produced.

## Motivation

The source-ranked Aichi pilot contains a concrete default-policy pass where attacking remained engine-legal. At `pilot:2:0:hood-shield-v1:B`, opponent rank 2 had Active Bunnelby with Jet Energy and Technical Machine: Evolution and a Benched Gloom. Its physical deck still held Vileplume AOR. The default bot chose `PassTurnAction` at action ordinal 346 on turn 56. [Agent 35's cloned source-state proof](agent35-crossrank-policy-diagnostic.md) establishes that the pinned Store accepted `AttackAction('Evolution')` from the original state and generated a Pokémon choice prompt. This is a **policy failure to announce one engine-available attack**, not evidence that the alternative wins.

A one-off TM Evolution probe is useful but narrow. A broader observational census can detect comparable failures for printed attacks and other attached Tool attacks across all source-ranked Aichi diagnostic trials, without modifying the decision algorithm or scoring the candidate.

## Research-side implementation

- [General cloned Store attack probe](../../simulation/twinleaf/pass-attack-announcement-probe.cjs) enumerates the Active Pokémon's printed attack names and names on attached Tool cards, deduplicates names, and tries each in an isolated pinned `Store` with an independently cloned state. The clone receives deterministic speculative randomness. Original `Math.random` is restored. Each checked attack is tagged `engineAcceptedAnnouncement`; incomplete prompt resolution, unsupported attack sources and strategic value remain outside its scope.
- [Bounded headless tracing hook](../../simulation/twinleaf/headless.cjs) runs **after the bot has independently chosen Pass** and **before it dispatches that Pass**. Explicit flags `captureDecisionTrace=true` and `captureAttackPassProbes=true` are both required. At most **eight pass states per game** are cloned. The budget is split into four ordinary passes and four with a Tool that directly supplies a named attack, reserving audit capacity for late Tool-equipped boards such as the source rank-2 turn-56 state. Each individual pass checks at most eight distinct printed/Tool attack names. Experimental audit errors are attached as observation failures rather than treated as absence of legal actions.
- [Aichi source-locked executor](../../simulation/evaluation/aichi-campaign-execute.cjs) propagates the opt-in `captureAttackPassProbes` flag. [Manual-only Aichi workflow](../../.github/workflows/aichi-first-game.yml) exposes `audit_passed_attacks`. Default behavior is unchanged.
- [Archive analysis](../../scripts/aichi-pass-attack-opportunities.cjs) reads a source-locked archive, checks the SHA-256 digest of each chronology, distinguishes skipped passes from probed but rejected passes and explicit audit errors, and attaches trial, candidate, opponent rank, engine slot and action ordinal. The analyzer emits `winRateEvidence:false` and `candidateRankingPermitted:false`.

## Evidence and test status

[First manual CI run 38849130347](https://github.com/FlareZ123/experiment-01/actions/runs/38849130347) completed successfully against the fixed-plan rank-2 opponent on 16 October, with the first version of the read-only attack probe. It exercised the existing regression suite, compiled pinned Twinleaf, ran the standalone compiled cloned-Store attack test and completed the full diagnostic workflow. That first version spent its entire eight-pass budget on the earliest passes and did not yet emit the new per-trial attack-opportunity summary.

The subsequent change reserves four pass probes for Tool-supplied attacks and adds [source-agnostic parser regression tests](../../tests/aichi-pass-attack-opportunities.test.cjs) plus a JSON and bounded console report to the manual workflow. Those subsequent edits require their own CI verification and a source-rank-2 run; do not attribute first-run success to unexecuted changes.

### Completed reserved-budget rank-2 run

[Manual GitHub Actions run 38849578860](https://github.com/FlareZ123/experiment-01/actions/runs/38849578860) **passed** on 16 October 2026. The manual source-locked rank-2 Vileplume diagnostic executed six games, covering the three fixed candidates in both engine slots. The compiler, pure analyzer tests, compiled cloned-Store regression, campaign quality screen and diagnostic artifact generation all completed successfully.

The machine-readable summary printed in the workflow's job logs reports **176 recorded pass decisions, 24 cloned-Store pass probes, 152 unprobed passes, zero probe errors and three passes with at least one engine-accepted attack announcement**. Two source-ranked opponent passes on turn 5 in separate fixed-candidate games accepted **Blustery Wind**. The published rank-2 inventory contains two `Pidgeot ex OBF 164`; its supplied English printing gives Blustery Wind a two-Colorless Energy cost, 120 damage, and an optional effect to discard a Stadium. Engine acceptance alone does not show whether attacking improves a control deck's plan. These occurred under candidate IDs `champion-reference` and `hood-shield-v1`, both in physical slot A; the shared slot seed means these are related deterministic trajectories rather than independent observations.

Critically, `pilot:2:0:hood-shield-v1:B`, the source-ranked **turn-56 Bunnelby pass**, was captured by the reserved Tool-attached audit budget. In the identical pre-pass engine state the clone accepted **Burrow**, **Rototiller** and **Evolution**. The last was attributed to its attached Technical Machine: Evolution. This independently broadens [Agent 35's Evolution-only source-state check](agent35-crossrank-policy-diagnostic.md) into a printed/Tool attack census of that observed decision.

**Sampling caveat:** the 24 probed decisions were deliberately stratified within each game toward the earliest ordinary passes and up to four Tool-equipped passes. The 152 unprobed passes have **unknown** attack availability. These are clustered within six games; the number of missed attack announcements is neither a failure-rate estimator nor a matchup outcome metric. The target still requires actual legal effects, capable opposing play and reliable full-match simulation.



### Independent source-board controls and Card-detached safety

Agent 40 independently built a rank-2 source Bunnelby/Jet Energy/Technical Machine: Evolution positive probe, a no-Energy negative control, and a pinned-engine Card identity check against live `Conkeldurr.damageTakenLastTurn` effects. After discovering overlapping work, Agent 40 removed the duplicate implementation, migrated source controls to [the unified pass-probe regression](../../tests/pass-attack-source-board-regression.test.cjs), and changed both the integrated generic pass probe and the earlier Evolution-only probe from `deepClone(state, [Card])` to **`deepClone(state)`**. This adjustment is important: the former shares mutable `Card` instances with the live game, a defect independently documented by Agent 49 in [its speculative Simulator mutation study](../twinleaf/simulator-card-reference-leak.md).

[Manual CI 38849597641](https://github.com/FlareZ123/experiment-01/actions/runs/38849597641) **passed** the unified source-board and Card-isolation regressions. This validates the tested detached Card references and isolated attack announcements on source-conditioned boards. It does not certify the absence of all possible clone-induced mutations or gameplay bugs. Agent 41 independently added a stronger full Tool attack resolution/target Card history assertion to the general test suite later; that additional regression still awaits its own execution.


## Whole-game observational noninterference gate (pending execution)

The [rank-2 source-trial fingerprint replay](../../simulation/twinleaf/pass-probe-noninterference.cjs) now runs the **same** fixed `pilot:2:0:hood-shield-v1:B` source 60-card identities, independent-slot-v2 seed, fixed-core policy and fidelity flags twice, changing only `captureAttackPassProbes`. It hashes the complete available engine outcome and chronological action/board summaries. The hash normalization removes **only** the newly attached `attackPassProbe` observational metadata from individual action entries. It preserves attack choices, actual actions, terminal state, Prize counts, turn order, attack traces, source card hashes, and end condition. A mismatch fails closed, as does a run with no actual pass probes. [Pure fingerprint tests](../../tests/pass-probe-noninterference.test.cjs) verify that genuine action/state changes are not normalized away.

The [manual Aichi workflow](../../.github/workflows/aichi-first-game.yml) includes this more expensive full-game replay **only when** `audit_passed_attacks=true`; its regular behavior remains unchanged. This addition is committed and awaiting CI execution. It tests observational independence of our hook for one exact engine run, not whether the baseline `SimpleTacticsAi` itself is unbiased or free of speculative Card-reference leaks. The archive preserves the v2 source seed on purpose. Agent 44's later `decorrelated-slots-v3` improves future seed decorrelation, but substituting it in a previously observed source-state reproduction would silently change the trial.

## Interpretation and remaining verification

An `engineAcceptedAnnouncement` flag establishes only that the pinned engine accepted one AttackAction from a cloned state. It may still require decision prompts or run into unsupported effects after announcement. Printed and directly attached Tool attacks are not exhaustive of every legally usable attack obtained through other effects. A rejected announcement is therefore evidence about that attempted attack in that specific engine state, not a certificate that the player had no other legal attack.

The archive analyzer additionally recognizes the separately recorded `post-decision-tm-evolution-target-inventory-v1` when `Evolution` was one of the accepted Tool attacks. It can expose `postDecisionHiddenTmEvolutionTargetCount` as a *post-choice true-deck resource count*; the count should not be used to direct the bot before any real deck search (K0), and a positive count does not prove that evolution will resolve. This analyzer addition and its regression were committed after the last successful manual Aichi game run and remain unverified in CI.

The probe observes complete actual game-state data inside a detached Store. This is acceptable for a **post-decision audit** but must never be exposed to a live bot during K0, since it might reveal hidden Prize/deck information. Differences from uninstrumented trajectories must be tested; while the cloned Store should isolate effects, copied objects and process-global randomness deserve adversarial noninterference checks.

Completed engine games and accepted attack options are **policy diagnostic evidence only**. Neither certifies Japanese paper Expanded legality, equal-quality human decision making, matchup strength nor the 99.5% field objective.

## Next experiments

1. Confirm the newer manual run and inspect the emitted per-trial summaries, especially whether the rank-2 Bunnelby `Evolution` pass was among the Tool-budgeted checkpoints.
2. Compare exact source-ranked action signatures and winner indices with audit flag disabled and enabled, with the identical fixed plan and policy.
3. Run the same bounded probe on rank 10 Regidrago and rank 26 Meloetta Donk; report omitted attack opportunities alongside the original public board and energy requirements. Do not aggregate results into win probabilities.
4. Ask policy owners to produce controlled same-state decision counterfactuals for repeated missed attacks before considering a deck-strength comparison.

