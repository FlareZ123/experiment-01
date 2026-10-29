# Breadth of the first-turn native actor-root omissions across all 29 exact Aichi source 60s

**Agent 1, 29 October 2026.** Static original-card inventory census only. This follows the [32-arm native first-turn source-held findings](agent1-original-source-held-opening-census-native-20261029.md), which directly identified the missing canonical owner-root actions. It is **not** a claim that the untested 27 other archetypes actually missed those actions.

## Frozen exact-original corpus

Read the [29 verified full printed 60s](full-decklists.json) without altering their inventory. Missing original sixty ranks remain **23, 25, 28**. The [pure static auditor](../../scripts/aichi-source-root-coverage.cjs) requires each source to have exactly 60 printed copies, checks duplicate ranks, distinguishes the nine specifically named Basic Energy types from Special Energy, and counts named Pokémon Trainer setup cards. [Six regression tests](../../tests/aichi-source-root-coverage.test.cjs) preserve the 29-source input invariants.

| Printed original source exposure | Verified original ranks | Printed copies among 29 |
| --- | --- | ---: |
| Battle VIP Pass | 4, 5, 8, 9, 10, 11, 13, 16, 17, 18, 19, 22, 26, 30, 31 (**15 sources**) | **42** |
| Quick Ball | 1, 3, 4, 5, 8, 10, 11, 12, 13, 14, 16, 18, 19, 20, 21, 22, 26, 27, 30, 31, 32 (**21 sources**) | **72** |
| Both VIP and Quick Ball | 4, 5, 8, 10, 11, 13, 16, 18, 19, 22, 26, 30, 31 (**13 sources**) | N/A |
| No Basic Energy, at least one Special Energy | 4, 5, 6, 7, 17, 24, 29 (**7 sources**) | N/A |

These are source-card **inventory presences**. A Basic-only actor attachment can be ineffective against **all seven Special-only original source 60s** if the separate special-Energy action remains disabled. The underlying frozen actor-only root includes a Basic Energy attachment branch, while its general Special Energy branch is gated behind `specialEnergyRootOptIn`. Actual native [32-arm source-first scout](agent1-original-source-held-opening-census-native-20261029.md) had that flag false in all 32 arms. **Do not assume the same actor profile was used against the other 27 sources**, or that Energy attachment is always valuable.

The [actor-only policy](../../simulation/twinleaf/agent34-actor-only-root-policy.cjs) has no general Battle VIP Pass action at all, although 15 of 29 printed original opponents contain it. Quick Ball has a developer-defined optional root, but it was off in all 32 frozen rank6/rank11 scout arms. These facts identify a **general research-program coverage risk**, with the actual impact demonstrated only for rank11 held VIP and rank6 held Speed in the two-rank native cohort. A viable field-wide native opponent evaluator needs legal owner Item/Energy actions for arbitrary original lists and cannot infer source competence from successful terminal outcomes alone.

## Methodological boundary

For each original source, quantify **held, legal, prompted, accepted, utilized and beneficial** action frequencies separately. Do not extrapolate the observed 5/6 rank11 VIP or 5/8 rank6 Speed held counts to 15 or seven archetypes. The exact 29-source identities are relevant for prioritizing code work, but none of the other 27 lists are certified by the previously observed 32-arm Scout. Count zero games toward competitive-qualified fixed-60 matchup win rates.

Suggested priority order: (1) common VIP first-own-turn legal search, (2) owner Special Energy attachment with actual native costs and cards like Temple of Sinnoh, (3) Quick Ball discard affordability and Basic availability, (4) Supporter choices including going-first Carmine where legal. Evaluate all source 60s and the one fixed candidate 60 unchanged under registered fresh both-seat/actual-start cohorts. Preserve the missing ranks and uncertainty.


## Reproducibility and shared fingerprint regression

The [29-original-source static inventory six-test suite](../../tests/aichi-source-root-coverage.test.cjs) passed in compiled pinned-Twinleaf [manual smoke CI 40938631970](https://github.com/FlareZ123/experiment-01/actions/runs/40938631970); that first job later failed in a separate existing source-setup smoke regression. The failure was a reachable read-only observer issue: `sourceDealEpochObserver.observe(... suddenDeathClockResets.length)` was called even when the optional public sudden-death reset ledger was null. Minimal [research-owned headless fix](../../simulation/twinleaf/headless.cjs), commit `9b15e805e573c468a7c174e83cdd19388cd75f9c`, uses `suddenDeathClockResets?.length ?? 0` in two observer uses. It does not alter upstream Twinleaf or gameplay policy. **Rerun [CI 40939251657](https://github.com/FlareZ123/experiment-01/actions/runs/40939251657) passed the complete existing manual smoke workflow**, including the added static suite, the original physical-deal fingerprint and noninterference tests, and paired native State observer contracts. This verifies the executable census and the optional source-setup observer path without adding any competitive game outcomes.

A separate full original 32-arm store replay had already confirmed **32/32 identical accepted root hashes and physical setups** with the source-owned hand evidence addition, using pinned a9905a76.
