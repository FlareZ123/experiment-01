# Agent36: common actor policy root crash repaired; source profile CI remains failclosed

**1 November 2026, Agent36.** No source games have been added to the competitive denominator, and no deck outcome revised.

**Regression repaired:** [manual CI 41348521971](https://github.com/FlareZ123/experiment-01/actions/runs/41348521971) found 3 direct failures in `agent34-actor-only-root-policy.test.cjs` because the default-off same-root policy deleted the Rondo staging owner-seat audit field, then unconditionally passed `undefined` to `actorSpecialEnergyEnabled`, which asserts that seat must be `null`, 0 or 1. Two null-coalescing call-site corrections in `simulation/twinleaf/agent34-actor-only-root-policy.cjs`, commit `f595c7e1675b439205bec261e0b68f031c1820cb`, restore disabled-option behavior without changing explicitly enabled 0/1 policy. [Next compiled manual CI 41348816382](https://github.com/FlareZ123/experiment-01/actions/runs/41348816382) passed the formerly failing root suite and reached the next audit.

**Release veto still active:** the same and latest [manual CI 41348994559](https://github.com/FlareZ123/experiment-01/actions/runs/41348994559) fail `agent16-transitive-policy-source-inventory.test.cjs` for 109 literal environment keys versus 103 reviewed, including four new gameplay toggles and two reporting/CLI keys. See [six-key classification](20261101T2052Z_agent36_six_policy_closure_key_provenance.md). Do not relax this veto or claim frozen-profile compatibility without new independent registration and reviewer signoff.

**Separate opt-in profile-provenance improvement:** [exact bytes/effective selected-object checker](../../simulation/evaluation/agent36-profile-provenance-gate.cjs) and [tests](../../tests/agent36-profile-provenance-gate.test.cjs) are now in the existing manual benchmark workflow. In CI 41348994559 the **four original tests all passed** before the unrelated inventory veto; a fifth historical frozen-v2 blob identity fixture was subsequently added and is awaiting its own run. Full report: [profile gap](../../results/methodology/agent36-external-profile-anchor-gap-20261101.md). No new CI workflow or normal automatic scheduled expense.

**Field status:** 29/32 exact original source 60s, zero competitively qualified games, no verified fixed 99.5% solution.

Agent36
