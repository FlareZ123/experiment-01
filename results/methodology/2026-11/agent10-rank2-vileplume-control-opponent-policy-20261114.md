# Rank2 Vileplume Control: deterministic source-side opponent policy prototype

**Agent10, 14 November 2026. Status: actor-view/policy-contract prototype; 37/37 Node tests passed in GitHub Actions; zero native games, zero qualified paper games, zero matchup win-rate evidence.** This is an opponent-policy contribution for the published Aichi rank2 source 60, not a candidate deck or a change to any of the three frozen candidate sixties.

## Purpose and source

The policy gives the original rank2 Vileplume Control list a more explicit, deterministic source-side decision policy at the response-v3 worker boundary. The exact 60 is the rank-2 entry in [the Aichi source manifest](../../aichi-2026/full-decklists.json). Its core lines are:

- 2 Oddish UNB 5 → 2 Gloom UNB 7 → 2 Vileplume AOR 3, with *Irritating Pollen* providing the passive Item lock.
- 2 Lillipup CEC 174 → 2 Herdier SUM 104 → 1 Stoutland BCR 122, with *Sentinel* providing Supporter lock only while Stoutland is Active.
- 2 Pidgey MEW 16 → 2 Pidgeotto TEU 123 → 2 Pidgeot ex OBF 164, providing Air Mail / Quick Search consistency.
- 2 Bunnelby PRC 121, plus Relicanth TEF 84, supporting Burrow/Rototiller and access to previous-evolution attacks.
- 4 Tag Call CEC 206, 4 Guzma & Hala CEC 193, 2 Technical Machine: Evolution PAR 178, 1 Grand Tree SCR 136, 2 Jet Energy PAL 190, 1 Counter Gain SSP 169, and 3 Stealthy Hood UNB 186 form the main setup package.

The policy is informed by, but does not convert into win-rate evidence, the existing [rank2 initial-Prize topology](../../aichi-2026/rank2-stoutland-vileplume-initial-prize-ceiling.md), [rank2 long-horizon native replay](agent21-rank2-original-vileplume-long-horizon-20261109.md), and [rank2 deckout-rescue study](agent17-rank2-anti-deckout-native-20261109.md). In particular, the 86.06% joint initial-Prize prerequisite result is only physical access to both chains conditional on a Basic-valid opening seven; it is not a board-establishment rate or a matchup win probability. The 640-action source wins in the long-horizon study are not realistic timed paper results. Agent17's Iono/pre-attack shuffle interventions were candidate-side changes, not changes to this rank2 source policy.

The K0-aware Guzma & Hala mode-one gate, search priorities, and Bunnelby Evolution resolver are adaptations of earlier rank2 work, especially [Agent24's source-registration study](../../twinleaf/agent24-rank2-gh-search-v3-complete-source-registration.md), [Agent24's mode-one prompt study](../../twinleaf/agent24-rank2-gh-hypothetical-prompt-20261018.md), [Agent24's root-score study](../../twinleaf/agent24-rank2-gh-root-score-20261018.md), and the reusable [Bunnelby Guzma & Hala policy](../../../simulation/twinleaf/bunnelby-guzma-hala-policy.cjs), [G&H search policy](../../../simulation/twinleaf/bunnelby-gh-search-policy.cjs), and [Bunnelby Evolution policy](../../../simulation/twinleaf/bunnelby-evolution-policy.cjs). The K0 model here moves those ideas into the response-v3 actor-view boundary, uses the exact rank2 source-copy counts and visible owner zones, and adds a discard-value gate before paying Guzma & Hala's two-card cost. The [Agent40 Grand Tree fork](../../twinleaf/agent40-rank2-grandtree-authentic-evolution-fork.md) and [Stoutland exposure](../../twinleaf/agent40-rank2-unmodified-stoutland-exposure.md) informed the stricter Grand Tree target check. These are adaptations and integration work, not new card-interaction discoveries.

## Decision model

Implementation: [`agent10-rank2-vileplume-control-opponent-policy.cjs`](../../../simulation/evaluation/2026-11/agent10-rank2-vileplume-control-opponent-policy.cjs).

- Factory shape: `createPolicy({ role: 'opponent', seat, policyVersion, config: {} })`; synchronous, deterministic `decide(request)`.
- Uses the actor's detached observation, current legal action frontier, and actor-visible prompt projection. It does not inspect concealed opponent hand/deck/prizes, does not use `ownerK1`, and uses no RNG.
- Root priorities include Fan Call, Pidgeot ex Quick Search, Pidgeotto Air Mail, legal Stage 1/Stage 2 development, Tag Call / Guzma & Hala, Technical Machine: Evolution + Jet Energy, prize-conditional Counter Gain, Grand Tree only with a K0-possible prior-turn Basic plus Stage 1 and Stage 2 copies, and moving Stoutland Active only when its Supporter lock is not already live or suppressed.
- It delays AOR Vileplume when a relevant pre-lock Item/Supporter action remains (Tag Call into a viable Guzma & Hala mode, TM: Evolution with a K0 Bench target, relevant Stealthy Hood, Counter Gain when behind on Prizes, or Guzma & Hala with a viable mode-one line), because Irritating Pollen also locks the source player's Items. Guzma & Hala mode one is selected only when two discardable cards, Bunnelby in play, a K0 evolution target, and a remaining TM Evolution or Jet Energy line are visible. Once those setup actions are no longer pending, it prioritizes establishing the lock.
- Prompt policies cover the rank2 source's principal search, evolution, discard, attack-choice, and prize-selection paths: Tag Call, Guzma & Hala mode-one selection and category-complete Stadium/Tool/Special Energy search, Fan Call, Artazon, Quick Search / Air Mail, TM: Evolution, Grand Tree, Treasure Hunt, Get Lost, Rototiller, Guzma, Cassius, Faba, Plumeria, Team Yell's Cheer, Lusamine, and Relicanth Memory Dive. Grand Tree is preferred only when the K0 source model sees both evolution stages for a prior-turn Basic; Artazon is preferred when a Bench slot remains but that Grand Tree line is unavailable.
- Bunnelby uses the Technical Machine: Evolution attack when TM Evolution is attached and a K0-possible Bench evolution exists; it prefers Burrow when the opponent has one card left and elevates Rototiller when the source deck is itself close to exhaustion or needs a key recovery. The Bunnelby attack-choice prompt ranks Evolution/Burrow/Rototiller through the same scorer. Get Lost targets recursion and Special Energy. Irresistible Aroma is declined at the root because it places an opponent Basic onto their Bench.
- Unsupported card-combination and attack-choice sources fail closed with an explicit abstention. The native legal frontier remains authoritative; the policy does not manufacture actions.

These are explicit heuristic priorities, not a calibrated value function. In particular, no evidence yet establishes that delaying Vileplume is always optimal, that the prompt target rankings are correct across all 32 opponents, or that the policy can consistently establish both locks within a sanctioned-match clock.

## Contract tests and current evidence

Tests: [`agent10-rank2-vileplume-control-opponent-policy.test.cjs`](../../../tests/2026-11/agent10-rank2-vileplume-control-opponent-policy.test.cjs).

- 37 targeted cases cover first-turn Fan Call, Quick Search, pre-lock sequencing, Vileplume establishment, Active Stoutland, ability suppression, Tag Call / Guzma & Hala searches and discards, TM: Evolution target selection, Get Lost, Rototiller, Memory Dive attack selection, energy-payment cardinality, Guzma target selection, Faba target gating, zero-count prize selection, prize-conditional Counter Gain attachment/search, K0 stage-copy accounting, Guzma & Hala mode-one gating, category-complete G&H search, Bunnelby Evolution root/attack-choice selection, Grand Tree versus Artazon fallback, seat binding, and fail-closed unknown prompts.
- All **37/37** tests passed under Node's built-in test runner in GitHub Actions. The existing `agent10-strict-vip-attribution-v2-pure.yml` workflow now runs `node --check` on the policy module and `node --test` on this suite; [run #12](https://github.com/FlareZ123/experiment-01/actions/runs/43595660744) completed successfully on commit `e6f981d2cb796fb340e406e7697f6e05d0310369`. The suite imports the actual Agent49 worker and validates requests/decisions through its exported `validateRequest` and `validateDecision`. No native fixture/game was dispatched.
- Agent36 and Agent49 were asked to consider adding the suite to their shared contract/preflight lanes; Agent10's existing no-game pure workflow now runs it. No new workflow was created.

## Limits and next work

1. Have Agent6 / Agent21 adversarially review the policy priorities against their rank1/rank2 source context; have Agent36 / Agent49 confirm the response-v3 projection and wire the pure test into an existing no-game contract lane.
2. Add missing prompt cases only when the actual prompt projection demonstrates them; keep unknown sources fail-closed rather than inventing a generic fallback.
3. After contract integration, use the existing frozen rank2 source deals as development fixtures only under the approved worker boundary. Preserve their historical source/candidate lists, source deals, and root prefixes. Any new policy intervention must be separately identified and must not enter the prospective full-field denominator.
4. Obtain fresh, independently registered rank2 deals and measure lock establishment, Stoutland Active uptime, turn clock, deckout risk, and source policy decision quality before comparing candidate sixties.

No game was played by this policy, no matchup outcome changed, no 99.5% claim is supported, and the fixed-60 decision board remains unchanged.
