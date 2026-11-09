# Agent46: original rank1 Fog Crystal Mimikyu counterline source A/B

**9 November 2026, registered before implementation.** Original Aichi rank1 Shadow Rider Calyrex source 60 versus original rank10 Regidrago source 60, under the pinned Twinleaf native engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. This examines source-bot playability and is not a measured paper Expanded win rate.

## Executed source games

The [frozen registration](../methodology/registrations/agent46-rank1-mimikyu-fog-owner-search-preserve-ab-20261109.md) defined twelve fresh fixed seeds, both physical candidate seats, original printed 60s, a default owner-only Copycat response policy in each arm, an additive owner-visible Fog Crystal search plus Dragon payload preservation only in treatment, and `maxActions=180`.

- [Completed native source run 42585995266](https://github.com/FlareZ123/experiment-01/actions/runs/42585995266): both-seat native Fog Crystal physical-search fixture passed; `agent46-mimikyu-fog-source-ab` original raw JSON artifact preserved.
- [Read-only evidence replay run 42587436396](https://github.com/FlareZ123/experiment-01/actions/runs/42587436396): extracted source artifact and reported native attack traces, action status and final board without resimulation.
- **48 native attempts across 24 matched original physical source deals.** All paired initial source deals matched.
- Baseline had **9 native terminal attempts** and **15 action-censored attempts**. Fog treatment had **11 native terminal** and **13 action-censored attempts**. These are unresolved, policy-sensitive native statuses, not credible competitive game outcomes.
- Treatment emitted **79 setup policy callback events**, including **9 selections of a physical Mimikyu during actual native Fog Crystal deck-search prompts**. Events alone may include simulated proposals; only the dedicated actual Store fixture proves physical deck-to-hand custody for that proposed search.
- Actual attack traces show **38 opponent Apex Dragon attacks in baseline** and **39 in Fog treatment**.
- Actual native attack traces show **zero Mimikyu Copycat attacks in both arms**, despite many real opponent Apex declarations.
- In multiple treatment final states, the native public board contains Mimikyu on the Bench, including seed/seat examples `1001270777/0`, `2102740022/1`, `271436081/1`, `310057278/1`, `1168501868/0`, `1168501868/1`, and `1766789714/1`. These are post-match snapshots, so they prove final presence and do not establish continuous legal response readiness at the exact Apex windows.

## Decision

A search-to-Bench tactic alone is insufficient to generate the intended attack response under the present native decision policy. The actual missing steps can include attaching the necessary Psychic Energy to Mimikyu, moving it Active, setting up the Dragon discard, and respecting the one-turn opponent attack-copy window. Absence of Regidrago Apex exposure is empirically contradicted by the opponent's 38/39 accepted native attack trace counts.

The next direct test should target one of these executable missing steps. I have communicated the result and requested a coordinated Energy / Active movement investigation from Agent6, who owns the prior two-stage Copycat policy. A separate Mysterious Treasure dual-axis discard-and-search source comparison is also running, with the registered original full-60 constraints unchanged.

**Acceptance:** 0 competitive paper-qualified games; no support for 99.5% claims; existing native Store full-game policy not qualified for competitive player-strength estimation.

## Code and immutable data

- `simulation/twinleaf/2026-11/agent46-mimikyu-fog-search-setup.cjs`
- `tests/2026-11/agent46-mimikyu-fog-search-setup.native.test.cjs`
- `simulation/evaluation/2026-11/agent46-mimikyu-fog-owner-setup-source-ab.cjs`
- `simulation/evaluation/2026-11/agent46-source-artifact-summary.cjs`
- `results/methodology/registrations/agent46-rank1-mimikyu-fog-owner-search-preserve-ab-20261109.md`
