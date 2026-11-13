# State-conditioned action realism: a resource-constrained formalization

**Agent 5 | 13 November 2026 | theoretical proposal, not an empirical result.** This note formalizes the human concepts of Active Move Realism (AMR), Discard Capable Index (DCI), connector domination, Archetype-Line-Specifics (ALS), and discrete strategic value into one resource-constrained decision model. It adds no card-interaction claim, candidate list, simulator result, or win-rate evidence.

## Question

How should deck construction and policy evaluation distinguish a move that is technically legal or graph-reachable from a line that a skilled player can realistically execute, at acceptable cost, before the opponent changes the state?

The prior concepts in `resources/human_concepts.md` correctly identify the failure of access-only reasoning: an Item may be reachable through Arven, but using Arven for that Item can preclude a better Supporter line; Ultra Ball may be legal but lack safe discards; a nominal attacker may have no Bench slot; and a lock may disable another lock. A single card-strength or graph-connectivity score cannot represent these effects.

## Model

Let `s` be the complete game state, `I_p(s)` the acting player's permitted information, `g` a declared strategic objective, and `π_o` a fixed opponent policy. A *line* `π` is an ordered contingent plan, not an unordered set of cards. Its actions have printed preconditions, state transitions, resource consumption, and possible opponent/chance interruptions.

A line is feasible only if every step is legal in the resulting state and all shared constraints are respected. Relevant constraints include, at minimum:

- one Supporter play per turn;
- one manual Energy attachment per turn;
- five Bench spaces and one Active position;
- once-per-game powers and one-copy resources;
- actual card zones, evolution timing, retreat costs, attack costs, and target availability;
- locks that remove or alter later actions;
- the remaining turn and match clock.

These are not independent additive costs. An action can change the availability or value of later actions, and one lock can suppress another. Feasibility must therefore be checked by replaying the ordered state transitions, not by summing abstract card links.

Define `Q_g(s, π | I_p, π_o)` as the expected utility of a feasible line under the acting player's information, chance outcomes, and the frozen opponent policy. Utility should ultimately reflect game outcome / Prize equity, not merely the number of cards accessed. Let `V_g(s)` be the best expected utility among the available contingent policies. Exact `V_g` is generally intractable; an approximate planner may estimate it, but its limitations must remain explicit.

## DCI: a conditional marginal value of discarding

DCI should not be an intrinsic scalar attached to a card. It is a comparison between concrete legal choices in a particular state and objective.

For a discard action `a` that has fixed non-discard effects (for example, the search effect of Ultra Ball), compare alternative discard subsets `D` that satisfy the action's printed cost:

`DCI(D1 versus D2 | s, a, g) = Q_g(s, a discarding D1) - Q_g(s, a discarding D2)`.

A positive value means `D1` is the better discard set under this objective and policy; it does not mean every card in `D1` is always disposable. The comparison is generally **non-additive**: the value of discarding two cards together need not equal the sum of their individual values, because the pair may preserve or destroy a multi-card line, a recovery chain, or an attack payload.

Useful state transitions follow directly:

- A once-per-game search Tool may be highly protected before its power is used, then become a low-cost discard after the power is spent.
- A first-turn-only Item can become dead in hand after its timing window, making it a reasonable cost for a later search action.
- A Dragon payload may be valuable in the discard for a copied attack, but its timing value changes if the opponent can move it out of the discard or if the attack is no longer part of the winning line.
- A singleton, ACE SPEC, or recovery connector may remain protected while its line is live, even when its nominal card type looks like an ordinary discard.

Thus DCI is a *choice ranking over legal discard sets*, conditioned on state, objective, matchup information, and remaining recovery routes. A per-card scalar can be a convenient approximation only after its conditioning variables and failure modes are declared.

## AMR: separate execution probability from conditional value

AMR should also be represented as more than a binary label. For an action or line `π`, use at least the tuple:

`AMR(π | I_p, g, π_o, τ) = (P_execute_by_τ, E[ΔU | execute], resource_cost, failure_modes)`.

`τ` is the relevant deadline: an opponent lock, attack, Prize race, turn boundary, or match clock. `P_execute_by_τ` includes the probability of finding the required cards, retaining the needed resources, meeting all action preconditions, and surviving opponent interruption. `E[ΔU | execute]` measures the line's conditional strategic gain against the best competing line, not against doing nothing.

If a planner requires a scalar, it may use expected net value, such as `P_execute_by_τ × E[ΔU | execute] - opportunity_cost`, but the components should be retained. A low-probability line with a decisive payoff and a high-probability low-impact line should not become indistinguishable merely because their scalar products happen to match.

AMR-overriding situations are represented by the deadline and opponent policy. If an opponent is about to establish a lock that will remove access to several actions, spending resources aggressively now can have higher expected value than preserving them for a later turn. The same action can therefore move from unrealistic to rational without any change to its printed text.

## Resource-aware connectors, ALS, and locks

An associativity graph should be upgraded to a **resource-constrained action hypergraph**:

- Nodes represent cards, zones, game-state predicates, and strategic goals.
- Hyperedges represent ordered multi-card actions or effects with their joint preconditions and outcomes.
- Each edge records resource use: Supporter, attachment, Bench/Active occupancy, discard set, one-time power, Energy, and deadline.
- Edge availability is recomputed after each transition; using one connector may remove a competing edge.

Connector domination is then a comparison between complete feasible lines. Line `π1` resource-dominates `π2` only when it achieves at least the same declared goal without greater use of scarce resources and with no worse outcome over the relevant states, with strict improvement somewhere. Mere reachability does not establish dominance or success.

An ALS is a named, reusable subgraph with explicit entry conditions, ordered actions, resource ledger, completion condition, and opponent interruption points. For example, the human-concepts `Tag Call -> Guzma & Hala -> Jet Energy + TM: Evolution -> Bunnelby` sequence should be evaluated as a specific line with Supporter and attachment contention, not as four independent card synergies.

Locks are state modifiers, not independent binary bonuses. A lock edge can remove legal actions or disable another lock's enabling Ability. Active-dependent locks also compete for the same Active position; Bench-based locks consume Bench capacity but may coexist with an Active attacker. Their value is therefore conditional on the complete board and the opponent's escape actions.

A useful diagnostic is the *shadow price* of a constrained resource. For example, the Bench-slot shadow price is the change in best expected utility when one free Bench space is removed; the Supporter-slot shadow price is the change when the Supporter action is already spent. These values vary by turn, matchup, and current board, so they should not be hard-coded as constant card penalties.

## Hidden information and prize knowledge

All calculations must use `I_p`, not the opponent's concealed hand or Prize cards. K0 and K1 are different information states: before the first deck search, Prize composition is uncertain; after a complete search, a skilled player can infer the Prize multiset by elimination. DCI and AMR can change sharply at that information transition. A planner that assigns the exact Prize state before the player has learned it is not evaluating a legal policy.

Opponent archetype inference from public cards or mulligans may update the conditional distribution over opponent policies and therefore the value of a line. It must not reveal hidden cards or convert a prior into certainty.

## Worked distinctions

| Naive proxy | Resource-constrained question |
| --- | --- |
| 'Ultra Ball is in hand, so Dedenne access exists.' | Is there a legal two-card discard set with low joint DCI, and does using Ultra Ball dominate the competing Item/Supporter line? |
| 'Five strong support Pokémon improve consistency.' | Can the intended board fit within five Bench spaces while retaining the Active attacker and required lock pieces? |
| 'The deck has both Item lock and Supporter lock.' | Can both be established simultaneously, or do their Active/Ability requirements suppress one another? |
| 'A search card reaches the singleton.' | What is the probability the singleton is accessible under K0/K1 Prize knowledge, and what recovery connectors can also be Prized or consumed? |
| 'This attack is payable on the printed board.' | Can the player realistically fund it before the opponent's next consequential action, and what resource or attacker is stranded by doing so? |

## Validation plan

1. Start with small, fully specified decision states and enumerate every legal competing action. Verify that the resource ledger rejects impossible sequences and accepts the legal ones.
2. For DCI, hold the source deal and all non-discard effects fixed; compare every legal discard subset and record the downstream line, not only the immediate search result.
3. For AMR, predeclare the deadline and opponent policy. Record no-opportunities, blocked lines, and failures alongside successful executions; do not condition on lines that happened to work.
4. Use matched deals for connector or Bench alternatives, preserving both candidate seats and both first-player assignments. Separate staged mechanics fixtures from complete games and from paper-qualified outcomes.
5. Falsify the abstraction with counterexamples: lines that score highly but are impossible due to a resource conflict; lines that look costly but are forced by an impending lock; and lines whose value changes after K0-to-K1 information.

## Limits and status

This is a formal proposal derived from `resources/human_concepts.md`, not a validated evaluator. No DCI or AMR values were computed, no optimizer or MCTS code was changed, and no card interaction or candidate-deck conclusion is asserted. Computing `Q` requires a sufficiently complete rules engine, actor-relative information handling, credible opponent policies, and complete-game adjudication. The current repository's owner-only native integration gates remain prerequisites before adding a new policy feature; this note does not bypass them.

The intended contribution is a shared vocabulary and falsifiable contract: **access is not success; legal is not realistic; and a card's value is the marginal value of the lines it enables or prevents under actual resource constraints.**