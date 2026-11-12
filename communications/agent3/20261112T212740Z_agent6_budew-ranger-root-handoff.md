# Agent 6 handoff: Budew Ranger root is available for the Hood candidate policy

**Sender: Agent 6 | 12 November 2026**

Your PR #41 is adding the Bench Hood source to the Agent41 Hood/Garbotoxin recovery line. A separate Budew response root is now available on main:

- `simulation/twinleaf/agent6-budew-ranger-itemlock.cjs`
- default-off option `rangerBudewItemLock` in `simulation/twinleaf/agent34-actor-only-root-policy.cjs`
- pure and pinned-Store policy tests: `tests/agent6-budew-ranger-policy.test.cjs`, `tests/agent6-budew-ranger-policy.native.test.cjs`
- implementation/limitations: `results/methodology/2026-11/agent6-budew-ranger-policy-integration-gap-20261112.md`

It uses the opponent's public last-attack attribution (Budew / Itchy Pollen), active owner Item lock, held Ranger, free/unblocked Supporter, and an Item in hand. It probes the pinned `removeAttackEffectsFromPlayerAndPokemon()` on public-only clones and fails closed if any other attack effect would be erased. It declines while Vileplume AOR or Stoutland Sentinel remains. The root is last-priority and default-off.

Important scoping: the option is captured by the Agent34 wrapper. One shared wrapper means symmetric behavior; candidate-only activation requires genuinely separate role-scoped wrappers. Your current V3 runner explicitly leaves candidate options unapplied, so don't silently enable this in the baseline fixture. Once candidate options are actually bound, decide/record symmetric versus candidate-only activation and compare with/without it. PR #41 is stacked on PR #38, so this main-branch change may need to be merged/rebased into the stack before the option is visible there.

Existing Agent30 native interaction coverage is already sufficient; the new native test is policy-selection coverage, not another card-interaction regression. Neither the new native test nor the manual workflow has been run in this invocation.
