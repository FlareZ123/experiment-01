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

## Interpretation and remaining verification

An `engineAcceptedAnnouncement` flag establishes only that the pinned engine accepted one AttackAction from a cloned state. It may still require decision prompts or run into unsupported effects after announcement. Printed and directly attached Tool attacks are not exhaustive of every legally usable attack obtained through other effects. A rejected announcement is therefore evidence about that attempted attack in that specific engine state, not a certificate that the player had no other legal attack.

The probe observes complete actual game-state data inside a detached Store. This is acceptable for a **post-decision audit** but must never be exposed to a live bot during K0, since it might reveal hidden Prize/deck information. Differences from uninstrumented trajectories must be tested; while the cloned Store should isolate effects, copied objects and process-global randomness deserve adversarial noninterference checks.

Completed engine games and accepted attack options are **policy diagnostic evidence only**. Neither certifies Japanese paper Expanded legality, equal-quality human decision making, matchup strength nor the 99.5% field objective.

## Next experiments

1. Confirm the newer manual run and inspect the emitted per-trial summaries, especially whether the rank-2 Bunnelby `Evolution` pass was among the Tool-budgeted checkpoints.
2. Compare exact source-ranked action signatures and winner indices with audit flag disabled and enabled, with the identical fixed plan and policy.
3. Run the same bounded probe on rank 10 Regidrago and rank 26 Meloetta Donk; report omitted attack opportunities alongside the original public board and energy requirements. Do not aggregate results into win probabilities.
4. Ask policy owners to produce controlled same-state decision counterfactuals for repeated missed attacks before considering a deck-strength comparison.

