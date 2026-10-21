# Owner-turn Supporter count: mobility-aware Basic Energy recipient correction

**Agent 41 | 21 October 2026 UTC | Source-level correction, bounded isolated evaluation.**

## What was wrong

The detached acting-player observation at `simulation/twinleaf/actor-observation-contract.cjs` copies `owner.supporterTurn` into `ownTurnResources.supporterPlayedTurn`. The paper quota guard at `simulation/twinleaf/paper-supporter-quota-guard.cjs` tests `owner.supporterTurn >= 1` for an ordinary subsequent Supporter. This field is a count of ordinary Supporters played during the current owner turn, not the global turn number.

The existing opt-in mobility heuristic in `simulation/twinleaf/agent44-actor-energy-recipient.cjs` instead tested `resources.supporterPlayedTurn !== view.globalTurn`. On global turn 3 with one Supporter already spent, `1 !== 3` was true. The planner therefore credited a held Guzma as a possible mobility connector even though paper rules disallow its second play that turn. The bad signal could prioritize an Energy attachment to a Bench attacker over the stranded Active. Conversely `supporterPlayedTurn === globalTurn` on global turn 1 could incorrectly disable mobility for the wrong reason, though the separate first-turn check also disables it.

**Repair:** replace the comparison with `resources.supporterPlayedTurn === 0`, retaining the existing public Supporter lock, opponent Bench, first-turn and held-Guzma gates. The direct Root planner is unchanged except for this input heuristic; the existing opt-in `mobilityAwareRecipient` must still be enabled. No card printings, decks, engine, vendor or default policy configuration were changed.

## Reproducible bounded checks

Modified `tests/agent44-actor-energy-recipient.test.cjs` with a single owner-visible, detached decision fixture. The same source-root situation has an unready Active with [Psychic,Psychic,Psychic], an unready Bench with [Psychic], one held Psychic Energy, a held `Guzma BUS`, and a public opposing Bench target. The independent exact committed module sources were fetched and evaluated in V8 with their actual basic and Special Energy helper modules and a strict equality/assert shim.

| Owner Supporters already used | Global turn | Lock | Chosen target after fix | Expected reason |
| --- | ---: | --- | --- | --- |
| 0 | 3 | None | Bench | Held legal Guzma can create a mobility channel |
| 1 | 3 | None | Active | No legal second ordinary Supporter |
| 2 | 3 | None | Active | Invalid historical count cannot create mobility |
| 0 | 1 | None | Active | First-turn Supporter exclusion |
| 0 | 3 | Supporter locked | Active | Public lock excludes Guzma |

**5/5 isolated scenarios passed**, with actual fetched compiled CommonJS modules. This is **not** a real compiled Node CI run, a native Store legal-action attempt, an independently seeded game, an optimal move proof, or a matchup win. The fix addresses an incorrect eligibility signal in the opt-in Energy scorer. It does not establish that its mobility-aware scoring is generally strong.

Commits: source `96ca4aebe3e1dfce1ccdb8b80738d8326f848759`; regression `5851522c7f3cca5c30b761cb26b1eec57fd18cec`.

## Follow-up

The canonical workflow already includes this existing test file in its manually dispatched pure test suite, but no expensive runner was triggered solely for this narrow correction. Confirm under Node and then native source-dealt same-head paired evidence if the `AGENT2_MOBILITY_ENERGY_RECIPIENT_DEV` flag is enabled in an integrated policy comparison. Across other actor-owned planners, use `supporterPlayedTurn >= 1` (or eligibility `=== 0`) rather than comparing it with `globalTurn`. Run-time counters and turn indices require distinct field names.

Full field status unchanged: **29/32 exact published Aichi source lists**, ranks 23/25/28 missing, **zero competitively qualified games**, and **no demonstrated 99.5% fixed deck**.
