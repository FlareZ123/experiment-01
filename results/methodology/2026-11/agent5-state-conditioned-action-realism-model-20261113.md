# State-conditioned action realism: a resource-constrained formalization

**Agent 5 | 13 November 2026 | theoretical proposal, not an empirical result.** This note formalizes the human concepts of Active Move Realism (AMR), Discard Capable Index (DCI), connector domination, Archetype-Line-Specifics (ALS), and discrete strategic value into one resource-constrained decision model. It adds no card-interaction claim, candidate list, simulator result, or win-rate evidence.

## Question

How should deck construction and policy evaluation distinguish a move that is technically legal or graph-reachable from a line that a skilled player can realistically execute, at acceptable cost, before the opponent changes the state?

The prior concepts in `resources/human_concepts.md` correctly identify the failure of access-only reasoning: an Item may be reachable through Arven, but using Arven for that Item can preclude a better Supporter line; Ultra Ball may be legal but lack safe discards; a nominal attacker may have no Bench slot; and a lock may disable another lock. A single card-strength or graph-connectivity score cannot represent these effects.

## Model

Separate **pregame deck constraints** from **in-game resources**. Let `C_deck(D)` describe whether deck `D` is a legal fixed 60-card list: card-pool eligibility, copy limits, the one-ACE-SPEC deckbuilding limit, and other format rules. These are construction constraints, not consumable game resources. Let `C_game(s)` describe the resources and predicates available in live state `s`.

Let `I_p(s)` be the acting player's permitted information, `g` a declared strategic objective, and `π_o` a fixed opponent policy. A player policy `π_p` must be **non-anticipative**: its action choices and branches may depend only on `I_p(s)`, never on the opponent's hidden hand, unknown deck order, or unknown Prize identities. A *line* `π` is an ordered contingent plan whose branches are selected from the player's information, not an unordered set of cards.

A line is feasible only if every step is legal in the resulting state and all live constraints are respected. Relevant game constraints include, at minimum:

- one Supporter play per turn, subject to exact card text and rules;
- one manual Energy attachment per turn, subject to exact card text and rules;
- five Bench spaces and one Active position;
- once-per-game powers and other card-text-limited actions;
- actual card zones, evolution timing, retreat costs, attack costs, and target availability;
- locks that remove or alter later actions;
- the remaining turn and match clock.

These are not independent additive costs. An action can change the availability or value of later actions, and one lock can suppress another. Feasibility must therefore be checked by replaying the ordered state transitions, not by summing abstract card links.

The basic turn/board constraints above are grounded in the repository's `resources/advanced-players-rulebook.md`: section B-03 (one Supporter per turn), section C (one manual Energy attachment per turn), and setup steps 5–7 (one Active and up to five Benched Pokémon). Card-specific powers, lock effects, and exceptions still require their own exact card text and current-state checks.

Define `Q_g(s, π | I_p, π_o)` as the expected utility of a feasible contingent policy under the acting player's information, chance outcomes, and the declared opponent policy. Utility should ultimately reflect game outcome / Prize equity, not merely the number of cards accessed. Let `V_g(s | I_p, π_o)` be the best expected utility among the available non-anticipative policies. Exact `V_g` is generally intractable; an approximate planner may estimate it, but its limitations must remain explicit.

## DCI: a conditional marginal value of discarding

DCI should not be an intrinsic scalar attached to a card. It is a comparison between concrete legal discard choices in a particular state, action, objective, and continuation contract.

Let `T(s, a, D)` be the resulting state after applying the same discard action `a` (including the same non-discard effects, such as Ultra Ball's search) while discarding subset `D`. For two legal discard sets `D1` and `D2`, define:

`DCI(D1 versus D2 | s, a, g, μ) = Q_g(T(s, a, D1), μ) - Q_g(T(s, a, D2), μ)`.

`μ` is an explicitly declared continuation policy. For a controlled causal comparison, use the same `μ` after both discard choices. For best-play value, optimize the continuation after each resulting state using the same policy class, information constraints, opponent policy, and search budget. Do not compare different search targets, Supporter lines, or action costs and call the result a discard preference.

A positive value means `D1` is the better discard set under this continuation contract; it does not mean every card in `D1` is always disposable. The comparison is generally **non-additive**: the value of discarding two cards together need not equal the sum of their individual values, because the pair may preserve or destroy a multi-card line, a recovery chain, or an attack payload. A per-card DCI is a derived marginal relative to a declared baseline set, not an additive primitive.

Useful state transitions follow directly:

- A once-per-game search Tool may be highly protected before its power is used, then become a low-cost discard after the power is spent.
- A first-turn-only Item can become dead in hand after its timing window, making it a reasonable cost for a later search action.
- A Dragon payload may be valuable in the discard for a copied attack, but its timing value changes if the opponent can move it out of the discard or if the attack is no longer part of the winning line.
- A singleton or recovery connector may remain protected while its line is live, even when its nominal card type looks like an ordinary discard.

Thus DCI is a *choice ranking over legal discard sets*, conditioned on state, objective, matchup information, continuation policy, and remaining recovery routes. It remains non-additive unless evidence justifies an approximation.

### Relationship to existing K0 discard models

This proposal extends rather than replaces the repository's existing exact K0 primitives. [Agent47's discard-value frontier](../../twinleaf/agent47-k0-discard-value-frontier.md) computes an exact expected value for the best discardable cards under an additive per-printing utility, and explicitly lists combo interactions, mutually exclusive lines, lock timing, and evolving utility as limitations. [Agent22's K0 search-bundle model](../../twinleaf/agent22-k0-expected-search-bundle-value-20261030.md) similarly uses a separable diminishing-return utility for a bounded unrestricted search. For separable cases, reuse those tested combinatorial components; do not rebuild Prize enumeration. The proposed DCI layer is the outer counterfactual comparison needed when the value of a discard *set* is non-additive because it enables or destroys a multi-card line, changes a game-resource budget, or alters the opponent deadline. It remains unimplemented and unvalidated.

## AMR: execution probability, fallback value, and conditional gain

AMR should also be represented as more than a binary label. For an action or line `π`, let `E` be the event that it executes before a declared deadline `τ`. Retain at least the tuple:

`AMR(π | I_p, g, Π_o, τ) = (P(E), E[ΔU | E], E[ΔU | not E], game_resource_cost, failure_modes)`.

`τ` is the relevant deadline: an opponent lock, attack, Prize race, turn boundary, or match clock. `P(E)` includes the probability of finding the required cards, retaining needed resources, meeting all action preconditions, and surviving opponent interruption. `E[ΔU | E]` is the line's conditional strategic gain against the best competing line, not against doing nothing. `E[ΔU | not E]` is the value of the declared fallback policy when the line fails or is interrupted; it is not automatically zero.

If a planner requires a scalar, a consistent expected-value form is:

`AMR* = P(E) × E[ΔU | E] + (1 - P(E)) × E[ΔU | not E] - C_opportunity`.

Use this only when `ΔU` is gross of the separately subtracted opportunity cost. If `ΔU` already includes resource opportunity costs, do not subtract them again. Prefer retaining the tuple and the game-resource cost vector until scalarization is justified. A low-probability line with a decisive payoff and a high-probability low-impact line should not become indistinguishable merely because their scalar products happen to match.

AMR-overriding situations are represented by the deadline and opponent policy. If an opponent is about to establish a lock that will remove access to several actions, spending resources aggressively now can have higher expected value than preserving them for a later turn. The same action can therefore move from unrealistic to rational without any change to its printed text.

AMR is matchup- and policy-dependent. A fixed `π_o` is appropriate for a controlled experiment, but one convenient opponent policy is not a general strength claim. Report the AMR tuple across a declared set of opponent policies (including a strong response policy) and per opponent identity; an archetype prior may supplement, but cannot replace, per-opponent evaluation.

## Resource-aware connectors, ALS, and locks

An associativity graph should be upgraded to a **resource-constrained action hypergraph**:

- Nodes represent cards, zones, game-state predicates, and strategic goals.
- Hyperedges represent ordered multi-card actions or effects with their joint preconditions and outcomes.
- Each edge records game-resource use: Supporter, attachment, Bench/Active occupancy, discard set, once-per-game power, Energy, and deadline.
- Edge availability is recomputed after each transition; using one connector may remove a competing edge.

Connector domination is then a comparison between complete feasible lines. Line `π1` resource-dominates `π2` only when it achieves at least the same declared goal without greater use of scarce game resources and with no worse outcome over the relevant states, with strict improvement somewhere. Mere reachability does not establish dominance or success.

An ALS is a named, reusable subgraph with explicit entry conditions, ordered actions, resource ledger, completion condition, and opponent interruption points. For example, the human-concepts `Tag Call -> Guzma & Hala -> Jet Energy + TM: Evolution -> Bunnelby` sequence should be evaluated as a specific line with Supporter and attachment contention, not as four independent card synergies.

Locks are state modifiers, not independent binary bonuses. A lock edge can remove legal actions or disable another lock's enabling Ability. Active-dependent locks also compete for the same Active position; Bench-based locks consume Bench capacity but may coexist with an Active attacker. Their value is therefore conditional on the complete board and the opponent's escape actions.

A useful diagnostic is the finite-difference value of a constrained resource. For example, the Bench-slot value is `V_g(s with five available Bench spaces) - V_g(s with four available Bench spaces)`; the Supporter-action value is `V_g(s with the Supporter action available) - V_g(s with it already spent)`. These are discrete, state-dependent finite differences, not smooth or constant prices. Preserve the vector of resource use until scalarization is justified.

## Hidden information and prize knowledge

All calculations must use `I_p`, not the opponent's concealed hand or Prize cards. K0 and K1 are **player-specific information states**: a player begins with uncertainty about their own Prize composition; after a complete search or other effect that actually reveals all relevant deck identities to that player, their information state can advance and the Prize multiset may be inferred by elimination. An opponent's search does not globally grant the other player K1. Partial searches or incomplete reveals update only the information actually learned. DCI and AMR can change sharply at these information transitions. A planner that assigns the exact Prize state before the acting player has learned it is not evaluating a legal policy.

The repository already contains separate, tested building blocks for [K0 joint hidden deck/Prize sampling](../../twinleaf/k0-joint-hidden-zone-sampling.md), [K1 unknown Prize-position sampling](../../twinleaf/k1-unlocated-prize-position-sampling.md), and [the option value of K0-to-K1 information](../../statistics/agent4-k0-k1-information-potential.md). The [joint-versus-marginal Prize-cut analysis](../../statistics/agent27-prize-joint-versus-marginal.md) is another warning against multiplying or substituting marginals without preserving the event definition. The AMR/DCI proposal should consume these as belief/information inputs, not duplicate their samplers or combinatorial calculations.

Opponent archetype inference from public cards or mulligans may update a belief over opponent policies and therefore the value of a line. It must not reveal hidden cards or convert a prior into certainty.

## Worked distinctions

| Naive proxy | Resource-constrained question |
| --- | --- |
| 'Ultra Ball is in hand, so Dedenne access exists.' | Is there a legal two-card discard set with low joint DCI, and does using Ultra Ball dominate the competing Item/Supporter line under the same continuation contract? |
| 'Five strong support Pokémon improve consistency.' | Can the intended board fit within five Bench spaces while retaining the Active attacker and required lock pieces? |
| 'The deck has both Item lock and Supporter lock.' | Can both be established simultaneously, or do their Active/Ability requirements suppress one another? |
| 'A search card reaches the singleton.' | What is the probability the singleton is accessible under this player's K0/K1 information, and what recovery connectors can also be Prized or consumed? |
| 'This attack is payable on the printed board.' | Can the player realistically fund it before the opponent's next consequential action, and what resource or attacker is stranded by doing so? |

## Validation plan

1. Start with one small, fully specified, fully observed decision fixture with two legal discard sets and two contingent continuations against a declared opponent policy. Verify that the continuation contract ranks the sets correctly and that the fallback branch is included.
2. Then repeat the same decision with actor-relative hidden information. Assert that every policy branch is measurable from `I_p(s)` and that K0-to-K1 transitions occur only for the player who actually receives the complete reveal.
3. For DCI, hold the source deal, action's non-discard effects, and continuation contract fixed; compare every legal discard subset and record the downstream line, not only the immediate search result.
4. For AMR, predeclare the deadline and opponent-policy set. Record no-opportunities, blocked lines, fallback outcomes, and failures alongside successful executions; do not condition on lines that happened to work.
5. Use matched deals for connector or Bench alternatives, preserving both candidate seats and both actual first-player assignments. Separate staged mechanics fixtures from complete games and from paper-qualified outcomes.
6. Falsify the abstraction with counterexamples: lines that score highly but are impossible due to a resource conflict; lines that look costly but are forced by an impending lock; and lines whose value changes after a player-specific K0-to-K1 information transition.

## Limits and status

This is a formal proposal derived from `resources/human_concepts.md` and Agent50's review, not a validated evaluator. No DCI or AMR values were computed, no optimizer or MCTS code was changed, and no card interaction or candidate-deck conclusion is asserted. Computing `Q` requires a sufficiently complete rules engine, actor-relative information handling, credible opponent policies, and complete-game adjudication. The current repository's owner-only native integration gates remain prerequisites before adding a new policy feature; this note does not bypass them.

The intended contribution is a shared vocabulary and falsifiable contract: **access is not success; legal is not realistic; and a card's value is the marginal value of the lines it enables or prevents under actual resource constraints and information available to the acting player.**