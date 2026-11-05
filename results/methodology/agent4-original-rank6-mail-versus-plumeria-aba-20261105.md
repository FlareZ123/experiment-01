# Agent4: early original rank6 Trainers' Mail spending versus turn3 paid Plumeria opportunity

**2026-11-05 | eight original seeded A/B/A native-development matches; zero qualified games.** Pre-registered in `results/aichi-2026/registrations/agent4-mail-plumeria-source-opportunity-aba-20261105.json` before running. This is a different experiment from the earlier Mail-only policy comparison.

## Question and matched experiment

Agent7 had already shown that the original rank6 Iron Thorns source, in the authentic `6:100:A:champion-reference` opening, could pay two original held Trainers' Mail cards to play Plumeria on source turn3, discard an opposing attached Psychic Energy, and cause the reference candidate to pass on turn4 in a bounded native intervention. Agent4's independent Mail-only pilot consumed both original Mail on turn1 and retrieved Sidney and Guzma.

This raises a state-dependent resource question: does early Mail use make the later source Plumeria unavailable, or does its additional card access preserve a different payment line?

A: selected v5 stewardship with the existing common both-seat `actorPlumeriaAfterPass:true` actor policy. B: same exact v5+Plumeria policy, with a separate common both-seat native-payable Mail-after-Pass and genuine owner top-four prompt follow-through. A repeat: same as first A. All eight original rank6/rank11 seeds, exact original source/candidate sixties, physical seats, 48-root budget, and old shared physical RNG protocol are fixed. The **treatment only** additionally consumes Mail during genuine actor Pass roots. Prompt selections are native-validated and produce actual physical owner Trainer hand transfers.

## Native execution

[Compiled CI 42097976341](https://github.com/FlareZ123/experiment-01/actions/runs/42097976341), [source-specific archived artifact 13448560498](https://github.com/FlareZ123/experiment-01/actions/runs/42097976341/artifacts/13448560498).

All eight initial whole physical deals matched across A/B/A. The complete original A root tapes repeated exactly after the treatment. The older Mail-only counterfactual also re-ran as an independent regression in the same workflow. The combined Plumeria-plus-Mail experiment's two original rank6 candidate contexts are:

| Authentic rank6 source opponent | A: first source Mail | B: first source Mail | A: source Plumeria | B: source Plumeria | Candidate's turn4 |
| --- | --- | --- | --- | --- | --- |
| Versus champion-reference Shadow Rider | 0 | **2 real Items** | **1 real accepted Plumeria root** | **1 real accepted Plumeria root** | **Pass in both A and B** |
| Versus New Moon Lockbreaker v1 | 0 | **2 real Items** | 0 | 0 | A played Klefki, B passed |

Original champion-reference branch: the candidate used Shadow Mist on its own turn2 in both controls and treatment. B inserted two Mail top-four search sequences on source turn1. Plumeria was later a native Store-accepted card root on source turn3 **in both A and B**. Both candidate turn4 decisions remained Pass. The B treatment spent enough extra prompt roots to reach the 48-root cap by game turn7 while A reached game turn9. Thus there was no independently demonstrated additional opponent disruption from Mail use.

The New Moon branch showed no source Plumeria root in either condition. Its candidate turn4 Klefki/Pass difference has no established causal attribution; extra source search shuffles consume global random values and source changes could affect later candidate hands. A different early action cannot establish net comparative gameplay strength.

## Separate native root chronology verification

A readout-only revision under the identical preregistered A/B/A re-ran successfully at [CI 42098430618](https://github.com/FlareZ123/experiment-01/actions/runs/42098430618), [artifact 13448173603](https://github.com/FlareZ123/experiment-01/actions/runs/42098430618/artifacts/13448173603). In champion-reference, both source turn3 branches had a full accepted three-prompt native Plumeria sequence before the source passed and candidate replied:

| Physical source action | A control action ordinal | B after early Mail ordinal |
| --- | --- | --- |
| Plumeria accepted from owner's hand | 22 | 32 |
| Native mandatory ChooseCardsPrompt (discard payment) | 23 | 33 |
| Native ChoosePokemonPrompt (target) | 24 | 34 |
| Native ChooseCardsPrompt (attached Energy) | 25 | 35 |
| Next source Pass after prompt resolution | 26 | 36 |
| Candidate voluntary turn4 Pass | 29 | 39 |

All three distinct owner prompts were actually accepted through the native action ledger, so the combined policy progressed through the entire action sequence without a prompt decoder abort. This strengthens the earlier Store root evidence. The **physical owner-payment and opponent Energy-card transfer** still require a direct per-trial Store state transition audit, since accepted prompt actions alone are insufficient to certify custody.

## Native physical-card settlement, independent per-trial confirmation

The existing `agent4-plumeria-after-pass.cjs` owner-only adapter records `settledEnergyDiscards` only after the real native Store accepts the source owner's mandatory **two physical hand-card discards**, confirms the selected opponent's originally attached Energy card is absent from the target and appears in the opponent's discard pile, and confirms the opponent's attached-Energy count decreased.

A final **readout-only audit** was harvested from the actual original rank6 source rows under the identical preregistered A/B/A policy: [compiled CI 42098823393](https://github.com/FlareZ123/experiment-01/actions/runs/42098823393), [artifact 13448511371](https://github.com/FlareZ123/experiment-01/actions/runs/42098823393/artifacts/13448511371). This is source-state evidence within the pinned engine.

| Original `6:100:A:champion-reference` source | A control | B after two early Mail | A repeated |
| --- | --- | --- | --- |
| Store-accepted actual Plumeria root | 1 | **1** | 1 |
| Physically confirmed two-owner-card payment + opposing Energy discard | **1** | **1** | **1** |
| Per-seat native audit `seat1.accepted/settled` | 1/1 | 1/1 | 1/1 |
| Candidate voluntary turn4 action | Pass | Pass | Pass |

The original rank6 New Moon matchup had zero accepted or physically settled Plumeria in every condition. The physical audits therefore establish that **early consumption of the two original Mail did not block a fully paid and physically effective later Plumeria** in this particular source opening. The optional detailed `physicallyAcceptedOwnerPayments` logging was disabled, producing an empty printed-name array. It should never be interpreted as zero payment, because the physical-settlement predicate independently verifies both owner cards reached discard. The two replacement payment card identities, option costs and future access remain unverified. Root caps, game-time and shared-RNG uncertainty still prevent any game-strength claim.

## Qualified conclusion and limits

**The same physical starting-deal rank6 reference opening proves that using both Mail on turn1 did not mechanically prevent the subsequent genuine native turn3 Plumeria card play.** The existing actor-only Plumeria fallback could still select a route. The existing physical Store audit confirms actual two-card owner hand payment and an opposing attached Energy removal under both A and B, but the exact two discarded owner card printings were not separately recorded; no evidence shows that early Mail improved win odds. Native turn4 Pass is a real public decision; a forced Pass is not established.

Agent7's earlier exact-rank6 study is an independent supporting baseline. The current combined B branch now also has its own native Store physical effect audit, with the exact owner-payment identities and full terminal outcomes remaining open.

Two correlated rank6 openings, six negative-control arms, a 48-root cap, zero game terminals, and the unrelated rank11 native error are retained. The shared RNG confound remains, as explicitly registered. There is no demonstrated win rate, selected 60-card final deck or 99.5% result.

## Source-owned code and provenance

- `simulation/evaluation/agent4-mail-plumeria-source-opportunity-aba.cjs`: A/B/A with all historical original eight registered seats and shared-source Plumeria, and separate Mail-only B treatment.
- `simulation/evaluation/agent4-bilateral-mail-original-eight-aba-v1.cjs`: underlying native A/B/A and owner Mail custody.
- `simulation/twinleaf/agent4-plumeria-after-pass.cjs`: existing common actor Plumeria decision and mandatory prompt follow-through.
- `results/methodology/agent4-bilateral-mail-original-eight-aba-20261105.md`: earlier Mail-only physical search, source caps and public chronology.
- `results/methodology/agent4-native-shared-shuffle-rng-coupling-20261105.md`: documented physical RNG cross-seat coupling and default-off separate physical shuffle streams.
- `results/aichi-2026/2026-11/agent7-shadowmist-plumeria-first-reply-counterfactual-20261105.md`: earlier distinct source Plumeria denial and physical paid effect.
