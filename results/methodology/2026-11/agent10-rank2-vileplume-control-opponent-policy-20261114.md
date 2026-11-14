# Rank2 Vileplume Control: deterministic source-side opponent policy prototype

**Agent10, 14 November 2026. Status: actor-view/policy-contract prototype; 24/24 targeted tests passed through the response-v3 validator in a local harness; zero native games, zero qualified paper games, zero matchup win-rate evidence.** This is an opponent-policy contribution for the published Aichi rank2 source 60, not a candidate deck or a change to any of the three frozen candidate sixties.

## Purpose and source

The policy gives the original rank2 Vileplume Control list a more explicit, deterministic source-side decision policy at the response-v3 worker boundary. The exact 60 is the rank-2 entry in [the Aichi source manifest](../../aichi-2026/full-decklists.json). Its core lines are:

- 2 Oddish UNB 5 → 2 Gloom UNB 7 → 2 Vileplume AOR 3, with *Irritating Pollen* providing the passive Item lock.
- 2 Lillipup CEC 174 → 2 Herdier SUM 104 → 1 Stoutland BCR 122, with *Sentinel* providing Supporter lock only while Stoutland is Active.
- 2 Pidgey MEW 16 → 2 Pidgeotto TEU 123 → 2 Pidgeot ex OBF 164, providing Air Mail / Quick Search consistency.
- 2 Bunnelby PRC 121, plus Relicanth TEF 84, supporting Burrow/Rototiller and access to previous-evolution attacks.
- 4 Tag Call CEC 206, 4 Guzma & Hala CEC 193, 2 Technical Machine: Evolution PAR 178, 1 Grand Tree SCR 136, 2 Jet Energy PAL 190, and 3 Stealthy Hood UNB 186 form the main setup package.

The policy is informed by, but does not convert into win-rate evidence, the existing [rank2 initial-Prize topology](../../aichi-2026/rank2-stoutland-vileplume-initial-prize-ceiling.md), [rank2 long-horizon native replay](agent21-rank2-original-vileplume-long-horizon-20261109.md), and [rank2 deckout-rescue study](agent17-rank2-anti-deckout-native-20261109.md). In particular, the 86.06% joint initial-Prize prerequisite result is only physical access to both chains conditional on a Basic-valid opening seven; it is not a board-establishment rate or a matchup win probability. The 640-action source wins in the long-horizon study are not realistic timed paper results. Agent17's Iono/pre-attack shuffle interventions were candidate-side changes, not changes to this rank2 source policy.

## Decision model

Implementation: [`agent10-rank2-vileplume-control-opponent-policy.cjs`](../../../simulation/evaluation/2026-11/agent10-rank2-vileplume-control-opponent-policy.cjs).

- Factory shape: `createPolicy({ role: 'opponent', seat, policyVersion, config: {} })`; synchronous, deterministic `decide(request)`.
- Uses the actor's detached observation, current legal action frontier, and actor-visible prompt projection. It does not inspect concealed opponent hand/deck/prizes, does not use `ownerK1`, and uses no RNG.
- Root priorities include Fan Call, Pidgeot ex Quick Search, Pidgeotto Air Mail, legal Stage 1/Stage 2 development, Tag Call / Guzma & Hala, Technical Machine: Evolution + Jet Energy, Grand Tree, and moving Stoutland Active only when its Supporter lock is not already live or suppressed.
- It delays AOR Vileplume when a relevant pre-lock Item/Supporter action remains (Tag Call, TM: Evolution, relevant Stealthy Hood, or playable Guzma & Hala), because Irritating Pollen also locks the source player's Items. Once those setup actions are no longer pending, it prioritizes establishing the lock.
- Prompt policies cover the rank2 source's principal search, evolution, discard, attack-choice, and prize-selection paths: Tag Call, Guzma & Hala, Fan Call, Artazon, Quick Search / Air Mail, TM: Evolution, Grand Tree, Treasure Hunt, Get Lost, Rototiller, Guzma, Cassius, Faba, Plumeria, Team Yell's Cheer, Lusamine, and Relicanth Memory Dive.
- Bunnelby Burrow is preferred when the opponent is nearing deck exhaustion; Rototiller is elevated when the source deck is itself close to exhaustion or needs a key recovery. Get Lost targets recursion and Special Energy. Irresistible Aroma is declined at the root because it places an opponent Basic onto their Bench.
- Unsupported card-combination and attack-choice sources fail closed with an explicit abstention. The native legal frontier remains authoritative; the policy does not manufacture actions.

These are explicit heuristic priorities, not a calibrated value function. In particular, no evidence yet establishes that delaying Vileplume is always optimal, that the prompt target rankings are correct across all 32 opponents, or that the policy can consistently establish both locks within a sanctioned-match clock.

## Contract tests and current evidence

Tests: [`agent10-rank2-vileplume-control-opponent-policy.test.cjs`](../../../tests/2026-11/agent10-rank2-vileplume-control-opponent-policy.test.cjs).

- 24 targeted cases cover first-turn Fan Call, Quick Search, pre-lock sequencing, Vileplume establishment, Active Stoutland, ability suppression, Tag Call / Guzma & Hala searches and discards, TM: Evolution target selection, Get Lost, Rototiller, Memory Dive attack selection, energy-payment cardinality, Guzma target selection, Faba target gating, zero-count prize selection, seat binding, and fail-closed unknown prompts.
- All **24/24** test bodies passed in a one-off deterministic Code Mode harness that loaded the actual Agent49 worker module and called its exported `validateRequest` and `validateDecision` on every fixture/decision. The harness supplied a small `node:test` registration shim and strict assertion shim; this is not the Node test runner and is not a GitHub Actions result.
- Agent36 was asked to add the module syntax check and this test file to the existing `contract_only` lane. No native fixture or game was dispatched by this work.

## Limits and next work

1. Have Agent6 / Agent21 adversarially review the policy priorities against their rank1/rank2 source context; have Agent36 confirm the response-v3 projection and wire the pure test into the existing contract-only lane.
2. Add missing prompt cases only when the actual prompt projection demonstrates them; keep unknown sources fail-closed rather than inventing a generic fallback.
3. After contract integration, use the existing frozen rank2 source deals as development fixtures only under the approved worker boundary. Preserve their historical source/candidate lists, source deals, and root prefixes. Any new policy intervention must be separately identified and must not enter the prospective full-field denominator.
4. Obtain fresh, independently registered rank2 deals and measure lock establishment, Stoutland Active uptime, turn clock, deckout risk, and source policy decision quality before comparing candidate sixties.

No game was played by this policy, no matchup outcome changed, no 99.5% claim is supported, and the fixed-60 decision board remains unchanged.
