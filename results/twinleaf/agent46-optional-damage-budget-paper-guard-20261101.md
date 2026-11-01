# Optional PutDamagePrompt paper budget: native engine gap and strict research guard

**Agent 46 | 1 November 2026 | pinned Twinleaf a9905a76a6c4103ba4b6cb9a49e86bad795c5c05**

## Claim and scope

A printed attack permitting *up to N damage counters* must not place more than N. Pinned `PutDamagePrompt.validate` checks exact total allocation only when `allowPlacePartialDamage` is false. With that option true, it has **no upper-bound test** against `prompt.damage`. Pinned `Store.reducePrompt` does not itself invoke the prompt's validator, so native Store acceptance cannot certify the printed maximum.

Three implemented pinned cards make this gap concrete in source code:

- `Froslass UNM`, Spiteful Sigh: put up to seven damage counters on itself; damage is 20 for each counter; its native optional allocation budget is 70 (70 self-damage, 140 attack damage max).
- `Banette CRE`, Resolute Spite: put up to seven on itself; optional allocation budget 70.
- `Walking Wake TWM`, Undulating Slice: put up to nine on itself; optional allocation budget 90.

All three have actual pinned `PutDamagePrompt` construction with `allowPlacePartialDamage:true`. A result containing 80 self-damage against the 70-budget prompt passes the pinned validator's total-damage test, despite exceeding the printed text. This is an engine-code and pure-regression finding; the original published 29 Aichi source lists do not contain these named Pokémon, and no game-win claim follows.

## Research-owned correction

The existing default-off `simulation/twinleaf/put-damage-zero-cap-paper-hook.cjs` now counts positive row damage with safe-integer accumulation, rejects overflow and rejects an optional partial allocation whose total exceeds `prompt.damage`, yielding `EXCEEDS_PRINTED_PARTIAL_DAMAGE_BUDGET`. The original zero-cap and `damageMultiple` checks remain. Mandatory allocations continue to use the native exact-budget validator. This change does not alter the Twinleaf submodule or the historical disabled profile.

`tests/agent46-putdamage-partial-budget.test.cjs` reproduces the pinned missing-upper-bound semantics and exercises legal 0/30/70 and 90 allocations, 80/70 and 100/90 over-budget submissions, mandatory allocation, packet indivisibility, excluded zero-cap targets, negative values, integer overflow, and the absence of any dependence on opponent concealed identities.

**Compiled manual CI [41352037441](https://github.com/FlareZ123/experiment-01/actions/runs/41352037441) succeeded** after the regression was added to the existing `.github/workflows/aichi-raichu-electro-rain.yml`.

## Stronger native witness

`simulation/twinleaf/agent46-froslass-partial-budget-native.cjs` stages an actual pinned Froslass AttackAction with Snorunt, Water Energy, six Prize cards per seat and genuine prompt/attack reducers, tested from both physical seats. It compares 70/80 self-damage under untouched Store versus the same replies under the reversible paper guard. Its native workflow result must be checked independently of the passing pure CI. **Until native CI is confirmed, this script is a hypothesis test and supplies no established 160-damage or Prize witness.**

## Benchmark boundary and next decisions

The full objective remains **29/32 authenticated original Aichi source sixties, zero competitively qualified games, no demonstrated single fixed sixty or 99.5% win rate**. This bounded fix prevents a class of illegal simulations from being silently treated as good lines for future optimizer experiments. It does not repair the more consequential current bottleneck: owner-safe two-player decision policy, including widespread missed Supporter roots. Separate recent Agent43 owner-hand native evidence and Agent41 common chooser development address that bottleneck.

Reproduction: the existing manual-only `aichi-raichu-electro-rain.yml` workflow, pure test above, native staged counterexample above, pinned engine revision and actual GitHub run ID. No automatically triggered CI workflow was added.
