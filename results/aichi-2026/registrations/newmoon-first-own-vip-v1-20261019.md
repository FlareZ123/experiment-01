# Pre-execution registration: New Moon first-own-turn Battle VIP Pass policy v1

**Agent 21. Frozen on 19 October 2026 UTC before any CI outcomes of this study.** This is a **mechanical, source-real opening-policy acceptance test** under a pinned engine, *not* a pre-registered win-rate study or deck optimization result.

## Fixed inventory, field and tested policies

- Candidate: unchanged 60-card [New Moon Lockbreaker v1 English proxy](../../als/new-moon-lockbreak-60-candidate.md), whose Japanese exact printings remain provisional.
- Distinct opposing archetypes: exact published **rank 6 Iron Thorns ex** 60 and exact published **rank 11 Absol/Garbodor** 60 from existing `planAichi` resolver. No unpublished opponent lists or substituted cards.
- Engine: pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; full owner-hand/prompt legality via `strictPromptValidation`; documented Forest Seal Stone and Battle Compressor hook settings.
- Frozen candidate interventions: baseline generic policy versus a **seed-free** candidate-only first-own-turn VIP policy `simulation/twinleaf/newmoon-first-own-vip.cjs` (v1), which checks exclusively own hand and public Bench, makes an actual legal Item action, then chooses at most two Basic Pokémon from its own legitimately opened deck-search prompt. The opponent remains on the **same** generic rank6 policy or frozen rank11 autonomous opener in both arms. All other candidate decisions remain generic and unqualified.
- Deterministic sample frame in `simulation/evaluation/newmoon-first-own-vip-prospective.cjs`: `seedBase=20261019`, ranks `[6,11]`, repeats `[0,1,2,3]`, physical candidate seats `[A,B]`, seeds from `deriveSlotSeeds(seedBase,'pilot',rank,repeat)[seat]`. Exactly **16 independent source seed/seat deals** each tested under baseline and VIP v1 arms, for **32 bounded 90-action game trajectories**. Preserve every rare/absent VIP opener and every exception in the fixed denominator; no outcome-conditioned seed selection.
- The source code, this registration document, seed schedule and policy are committed **before** the manually dispatched CI. Later bug fixes, if necessary, must be prominently documented and cannot silently be called the unchanged precommitted policy.

## Hypotheses and failure modes

1. On authentic first-own-turn states with a printed Battle VIP Pass in hand and a Bench vacancy, generic bot may miss an important setup action. We test whether the VIP v1 policy can dispatch a legal Item through the actual Store and validate its own-deck search choices under independent first-player positions.
2. Owner-first eligibility applies on either global turn 1 or 2. Acting only on candidate slot B would be a policy bug; both physical seats and two archetypes must be represented.
3. Candidate-only policy should leave the **initial source setup, printed 60-card identities and verified first-player order unchanged** relative to paired baseline. In-game actions may legitimately diverge after the candidate's intervention.
4. Inaccessible or Prized target Pokémon cannot be selected. Unopened deck/Prizes must not be inspected by the policy, and bench space must constrain choices. `chooseOwnedVipTargets` only inspects `ChooseCardsPrompt` once it is legitimately in flight.
5. The policy may help setup yet still fail to produce useful attacks, handle active lock, or convert Prize cards. Any game-ending records remain **unqualified** until independent bilateral decision competence, attack-resolution validation, coverage of the remaining field, time/rule fidelity and paper legality are established.

## Required reporting

Preserve all 16 planned IDs, true starting orders, same-seed baseline comparison, owner hands where publicly/legally observable, VIP offer, actual chosen action and validated owner-search prompt, action-capped and exception counts, engine/source/candidate digests. Report both rank-level and seat-level opportunities with no favorable-hand filtering. **Do not infer any competitiveness or 99.5% claim** from these observations.

Primary reference for printed card semantics: [official Battle VIP Pass](https://asia.pokemon-card.com/sg/card-search/detail/1964/), usable only during the player's first turn, searches up to two Basic Pokémon and puts them on Bench.
