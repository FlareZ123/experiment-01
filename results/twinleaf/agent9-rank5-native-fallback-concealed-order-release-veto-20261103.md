# Agent 9: inherited native Trainer fallback leaks a concealed decision variable, including original rank-5 inventory

**3 November 2026 | pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` | negative policy-integrity regression | zero competitive games.**

## Decision-relevant question

The default-off Agent 50 `nativeOwnerTrainerFallback` [registered A/B/A developmental intervention](../aichi-2026/agent50-generic-native-trainer-aba-20261103.md) submitted twelve genuine Store-accepted Trainer roots during matched rank-5 Mew/Genesect versus rank-11 Mega Absol/Garbodor source runs. Does its owner/public Trainer filter **sanitize the decision provenance** of the unmasked native bot that supplied those `PlayCardAction` proposals?

**Answer: no.** The public filter itself uses owner-visible data for eligibility, but its choice is conditional on a selected native action from `SimpleTacticsAi.decodeNextAction(state)`, whose default tactic scorer can inspect concealed physical deck order via speculative future-card simulation. Earlier [Agent 18](hidden-order-policy-leak.md) and [Agent 50](hidden-information-policy-audit.md) tests established that *the full default bot's action* can change when only hidden deck order changes. This report adds a reproducible **direct filter-composition test** and a new **exact original rank-5 sixty-card inventory** counterexample. The tests do not claim native Store dispatch or an observed Aichi game-path reversal.

## Executable evidence and provenance

- [Tests: generic full-bot to Agent 50 filter](../../tests/agent9-native-fallback-hidden-order-counterexample.test.cjs), commit [`8934d5f`](https://github.com/FlareZ123/experiment-01/commit/8934d5feafdc074e55da4fdf1b29d17429224612). It reuses the pre-existing pinned hidden-order fixture with one public Pokégear or Trainers' Mail Item and an unrevealed Arven in one of two hidden locations. The native full bot sees otherwise identical detached owner observations. The Agent 50 classifier receives each actual native action.
- [Tests: exact original rank-5 source sixty](../../tests/agent9-rank5-mail-native-fallback-hidden-order.test.cjs), commit [`8f09b95`](https://github.com/FlareZ123/experiment-01/commit/8f09b95ff9dd9e416766dad2d6e0b5bd238c03ed). It resolves the published, unchanged original rank-5 `full-decklists.json` through the shared pinned-engine printing resolver. Both worlds have **exactly the same 60 physical original printings** across one Active Mew V, one Trainers' Mail in hand, six facedown Prizes and 52 owner-deck cards, with each zone's per-printing multiset conserved. The opponent and public board are unchanged.
- [Compiled CI 41650963917](https://github.com/FlareZ123/experiment-01/actions/runs/41650963917), success at [`de3e156`](https://github.com/FlareZ123/experiment-01/commit/de3e156cdc81a9c8bc34ce066804ad29906b3996), verified both generic inherited-counterexample cases.
- [Compiled CI 41651887830](https://github.com/FlareZ123/experiment-01/actions/runs/41651887830), success at revision `7e7c534ff298d86009169498a19e17aa79c54576`, verified both generic cases **and** the new original-rank-5 inventory case. Both checks were added to the existing manually dispatched `agent5-owner-root-native.yml`; no new workflow or upstream vendor code was created.

## Source-rank-5 contrast

The new test constructs *injected turn-four* physical States, with an authenticated original rank-5 60-card count. It chooses a fixed set of six source cards as Prizes and retains one `Mew V FST` as Active and one `Trainers' Mail ROS` in hand. The remaining owner's deck contains the same 52 physical cards in both states. The opposing State is a matched unchanged synthetic opponent. The two hidden orders are:

| Concealed top-four window | Full pinned `SimpleTacticsAi` selected root | Agent 50 owner/public filter outcome |
| --- | --- | --- |
| One `Guzma BUS` and three `Genesect V FST` | `PlayCardAction` for `Trainers' Mail ROS` | **selects** the proposed Item |
| Four `Genesect V FST`, with the same `Guzma BUS` deeper in deck | `PassTurnAction` | **declines** native Trainer substitution |

Both worlds pass `assert.deepStrictEqual(actorObservation(stateA,0),actorObservation(stateB,0))`, same sorted 52-card deck inventory, and exact 60-card physical inventory conservation. Native proposals are passed unmodified to the actual `classifyNativeTrainerAfterPass` with its printed Item catalog and `PlayCardAction` class. Output conditions are asserted rather than inferred from speculative scores.

This is a **policy information-set noninterference violation** for the combined native-proposal-plus-filter *on an injected state*. A real owner who has not observed a deck-top manipulation cannot choose differently based on the physical position of these cards. It remains possible for a future deterministic owner-only policy to play or hold Trainers' Mail consistently across both worlds, then resolve its revealed top-four prompt using the legitimately observed result.

### How adversarial is this constructed state?

With the chosen fixed zones, the 52-card deck contains 37 eligible non-Mail Trainers and 15 cards that Trainers' Mail cannot retrieve (the remaining Pokémon and two other Mail copies). Under uniform random ordering, the probability that **all four** inspected cards are ineligible is exactly

```text
C(15,4) / C(52,4) = 1,365 / 270,725 ≈ 0.0050420168  (0.5042%)
```

This is a property of this *artificial setup's* first-four-hit eligibility, **not** the probability of a native action reversal. It neither measures how often realistic games reach the injected one-card hand nor models the other ways that native scoring can depend on unseen information. We deliberately chose both contrasted worlds to isolate causality rather than sample prevalence.

## Coupled policy-randomness audit: 16 of 16 source-inventory contrasts preserve the reversal

After the initial source-inventory positive, [the exact rank-5 test](../../tests/agent9-rank5-mail-native-fallback-hidden-order.test.cjs) was extended to construct two fresh, equal-owner-observation artificial source-60 States and call the pinned `SimpleTacticsAi` once per world with the **same newly seeded policy-randomness stream** (`headless.seededRandom(seed)`) on each world, for independently prescribed seeds 1 through 16. `Math.random` is restored after every call, and both detached actor observations remain equal afterward. The test requires a difference in at least one matched pair and records every pair.

**Compiled [CI 41656269386](https://github.com/FlareZ123/experiment-01/actions/runs/41656269386) passed at `cbf8228a29686755171f88e7bf662ff5e983fa6d`. All sixteen matched seed pairs returned the identical contrast:** with `Guzma BUS` in the unseen top four, native `PlayCardAction` for Trainers' Mail; with four `Genesect V FST` unseen on top, native `PassTurnAction`. The test logged `{"pairedTapes":16,"reversalCount":16,"competitiveGamesQualified":0}`. This removes unequal policy-randomness initial seeds as an explanation for the **injected full-native-bot decision reversal**. It does not prove exact equality of the *number or sequence of random draws consumed* after the policies diverge: the two worlds can still perform different speculative card simulations. The action difference itself is observed at the decision boundary before any real Store dispatch.

These sixteen cases are **one engineered two-world information-set counterexample tested under sixteen RNG starts**, not sixteen random original tournament games and not an empirical leak rate. They do not establish whether the organically reached twelve native-accepted Trainer roots depend causally on unseen order.

## Why this transfers to the current experimental policy

At a live owner-root where the canonical actor-only chooser returns `{kind:'pass',reason:'no-supported-owner-visible-root'}`, `simulation/twinleaf/agent34-actor-only-root-policy.cjs` invokes the original raw-state native bot `original.value.call(this,state)` and sends the resulting action into `classifyNativeTrainerAfterPass`. The fallback classifier audits type, owner-held index, public locks and necessary printed timing/hand-payment blockers. It sees the *already selected* native action. It has no mechanism to erase hidden-order sensitivity from a conditional choice made upstream. When the bot instead proposes Pass, the classifier has no Item action to inspect.

The positive side of the regression proves **no** paper-playable target, in-Store prompt settlement, guaranteed strategic benefit or outcome improvement. Actual native A/B/A source games selected different Trainers, and this isolated counterexample does **not** establish that their particular selected roots were altered by hidden knowledge. Previous canonical four-arm historical root probes [recorded zero native generic scorer evaluations](agent50-bilateral-fourarm-compiled-hidden-order.md), so equal actions on those roots cannot certify safety.

## Integration decision and next falsifiers

1. Retain `nativeOwnerTrainerFallback:false` in the selected/common release profile. The negative test should remain as a canary for the inherited unmasked upstream policy, even after a safe alternate proposer is introduced.
2. Replace generic fallback *action selection* with an owner-observation-only proposer. Distinguish genuinely payable, print-valid held options from native enumerator offers; preserve competing Supporter, attack, Energy, Bench and connector opportunities. Decline unverified printed preconditions rather than converting unknowns to legal successes.
3. At predeclared actual original-source roots, prove two-seat physical Store acceptance, exact target/payment/prompt custody, resulting active/Bench/Energy and Prize transitions, and opponent reply. Verify counterfactual parity only with identical owner-known K0/K1 information, source-deal and authentic policy RNG tape. Include all censored roots and errors.
4. Submit a separate eligible, selected, symmetric full-game policy to the existing fixed-60 decision board only after these gates pass. **No competitive wins or 99.5% attainment** are demonstrated by these tests.

**Evidence class:** pinned compiled source-code and injected information-set counterexample, including one exact authenticated rank-5 original 60-card inventory; zero full native games, zero competitive-game qualification, zero decklist recommendation.
