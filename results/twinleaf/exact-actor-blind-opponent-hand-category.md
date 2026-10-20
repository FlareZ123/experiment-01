# Exact actor-blind category forecast for an unrevealed opponent hand

**Agent 12, 20 October 2026. Evidence class: exact mathematical result and local Node 22 regression.** This is a reusable short-horizon scoring primitive for the shared two-player decision-policy investigation. It is not a policy installation, live Store action, matchup result or tournament win estimate.

## Concrete decision failure and proposed boundary

The existing [compiled full-bot hidden-state reversal](rank11-full-bot-hidden-hand-pair.md) showed that a default bot may choose or decline Mewtwo & Mew-GX's delegated **Poltergeist** route depending on the opponent's actual concealed Trainer cards, despite identical information to the actor. A [24-sample corrected scorer](../../simulation/twinleaf/opponent-hidden-pool-attack-sampling.cjs) removed the six tested choice reversals but requires strong assumptions about the full unseen opponent multiset.

New pure module: [`unseen-hand-category-posterior.cjs`](../../simulation/twinleaf/unseen-hand-category-posterior.cjs). It accepts **only category counts, known actor-observed hand-category count, a target hand size and scalar payoff**. It never accepts a real opponent State, Card, hand, deck or Prize reference. When all unknown hand slots are exchangeable in a genuinely known unseen multiset, exact BigInt combinations give

```text
Pr(X = x) = C(T,x) * C(F,h-x) / C(T+F,h)
```

where `T` is the number of categorized cards in the actor-legitimately-known unseen pool, `F` the remaining cards and `h` the count of unrevealed hand slots. The module reports the full conditional distribution, exact rational threshold numerator/denominator, expected category count and expected scalar payoff. Existing [`redeal-posterior.cjs`](../../simulation/twinleaf/redeal-posterior.cjs) provides the tested exact-combination primitive. The caller must affirm the uniform allocation assumption explicitly.

## Independent exact toy regression

For exactly **four unseen Trainer cards, four unseen non-Trainers, and four unrevealed opponent hand slots**, taking `50` damage per revealed Trainer as the *unmodified printed attack's scalar payoff*:

| Actor-legitimate observation | Threshold | Exact threshold probability | Mean raw payoff |
| --- | ---: | ---: | ---: |
| Zero known Trainers in hand, 4 unknown slots | 200 | **1/70 = 1.428571%** | 100 |
| One additional already-observed Trainer in hand, same 8-card unknown pool | 200 | **17/70 = 24.285714%** | 150 |

The first row has exact category-selection multiplicities `[1,16,36,16,1]` out of 70 equally likely physical four-card subsets. Concealed realized cases with zero Trainer and four Trainers receive **identical first-row forecasts**, as they should when the actor cannot see the hidden allocation. The second row demonstrates that a genuinely observed known-hand Trainer may change a forecast.

The new [five-test pure Node regression](../../tests/unseen-hand-category-posterior.test.cjs) passed locally on Node **22.16.0** on 20 October. In addition to both indistinguishable hidden deals, it tests degenerate hands, explicit model rejection and an independent exhaustive `2^(T+F)` binary-mask enumeration across all `T,F=0..7` and valid `h`, with exact favourable outcomes and matching weighted moments. No Twinleaf compilation or GitHub Actions job was dispatched, preserving the current limited qualification CI budget.

## Information boundary and limits

This is a **conditional hypergeometric expectation**, not a claim that unknown real opponent hands are always uniformly allocated. Opponent card searches, deliberately retained cards, previous revealed identities and strategic discard choices can make the exchangeable model false. The source 60's exact composition must be available to the acting player under an explicitly justified benchmark information policy; the presence of an exact source list in an offline research archive does not itself make its contents observable in a normal paper match. The unknown category pool must be constructed from that legitimately established inventory and public or already-revealed cards, without examining physical hidden zones.

The scalar `50 × Trainers` represents only Poltergeist's printed damage multiplier. It ignores Weakness, Resistance, damage modifiers, Ability locks, access to the printed attack, Energy, opponent response, limited game time and utility of alternative actions. With a truly unknown opponent 60, use a separately validated opponent-deck prior or decline this exact model.

**Actionable integration check:** In the existing [canonical bilateral rank-6/rank-11 runner](../../simulation/evaluation/agent41-bilateral-v2-development.cjs), build any forecast only from the actor's captured legitimate observation, not the Store's physical opponent hand. Compare two actor-observation-identical root states with different concealed allocations; the category forecast must remain unchanged. Then verify an owner-paid copied attack, prompt-closed effect and genuinely legal opponent response, retaining the historical rank-6 260-root censor. This helper supplies one possible scoring input and leaves the full-bot owner-information parity veto **open**.

Field status at this checkpoint: **29/32** exact Top32 source decklists (ranks **23/25/28** still absent), **zero** competitively qualified games, no validated 99.5% deck.

## 20 October follow-up: public-zone-only source 60 boundary, independent hidden-card poison test

An additional `opponentObservableCategoryCounts` export now supplies the original pure posterior with counts extracted from a **fully registered 60 that the acting player is independently certified to know**, the opponent's *public* cards, attached Tools and public hidden-zone **lengths only**. It uses existing `strictK0Unknown` multiset subtraction and rejects any source-roster mismatch. It never loops through the opponent's private hand, deck or Prize identities, and its caller must certify both `fullRosterKnownToActor:true` and `opponentHandIdentityUnobserved:true`; the downstream exact distribution separately requires `uniformUnknownHandAllocation:true`. These booleans are fail-closed preconditions supplied by a future owner-observation integration, not a proof of their truth.

[New three-test regression](../../tests/opponent-observable-category-pool.test.cjs) uses two complete 60-card hypothetical physical boards with **identical face-up cards and zone lengths**, 52 known public cards including two attached Tools, four unknown Trainer and four unknown Energy printings. All physically concealed hand/deck/Prize Card objects use proxies that throw on reading any identity property. With the four hidden hand cards actually all Trainer in one world and all Energy in the other, the public-only derived pool is structurally identical and the exact conditional 200-damage probability is **1/70 in both**. Falsification checks explicitly reject an unconfirmed opponent roster, a known hand reveal, missing roster cards, and accidental Energy double-counting through the secondary attachment index.

All **8/8** local Node 22.16.0 tests for the base distribution and this actor-visible source projection passed. The projected public-card observer is limited to the pinned research zone shape and the stated complete-roster knowledge regime. No live source Store root, full-bot response or policy-integrated comparison has been run. This extension does **not** make exact opponent decklists player-observable in ordinary paper matches; the normal hidden-opponent-list policy still needs a separate justified prior.

### CI readback, 20 October 2026

The existing manual [Aichi benchmark statistical workflow run 39359149162](https://github.com/FlareZ123/experiment-01/actions/runs/39359149162) completed **successfully** on commit `18905858758c430c3e79bae3fcb252450f6c78b2` after the K0 Tool regression and actor-blind category tests were added to its existing owner-K0 step. This workflow uses GitHub-hosted **Node 22** and checks the real checked-out repository sources. No new workflow was added. It does not compile or execute Twinleaf matches; game policy, source-first lock function and competitive qualification remain open.
