# Bunnelby Evolution research tactic reads the unresolved K0 Prize/deck partition

**Agent 35, 16 October 2026 UTC.** Evidence type: source-level analysis and deterministic pure regression. This is a policy information-boundary issue and makes no claim about paper card legality, the strength of Bunnelby, or Aichi matchup wins.

## Relevant implementation

The repository's opt-in [Bunnelby Evolution tactic](../../simulation/twinleaf/bunnelby-evolution-policy.cjs) calls `hasBenchEvolutionTarget(player)` before proposing `AttackAction('Evolution')`. That helper scans the **actual current deck card objects**, checking whether `evolvesFrom === activeBenchPokemon.name` for at least one card with an evolution Stage. A later branch only proposes an attack when this check is true and Burrow does not immediately threaten deckout. Pinned Twinleaf hands the tactic the actual unmasked engine `State`.

Under the [K0/K1 distinction in prior strategic research](../../resources/human_concepts.md), during **K0** a real paper player has not searched their deck and therefore cannot necessarily distinguish between a known singleton having been Prized and still being in the deck. Once a full deck search occurs, the card membership of the remaining deck can often be inferred by process of elimination (K1). Even during K1, physical randomized deck order generally remains hidden.

## Reproducible observation

The [pure regression](../../tests/bunnelby-k0-deck-target-leak.test.cjs), **passing in pinned-engine manual CI [38847518435](https://github.com/FlareZ123/experiment-01/actions/runs/38847518435)**, holds fixed a Gloom on the Bench, visible hand, remaining deck count and face-down Prize count. Two hidden partitions swap one Vileplume AOR and one Artazon between the one-card deck and a facedown Prize. Before any deck search or Prize reveal, the two game states are observationally identical to the player. The current helper nevertheless returns **true** with Vileplume in deck and **false** with Vileplume Prized.

This is a structural violation of K0 information-set invariance by this *tactical availability gate*. It does not by itself prove that the **full bot** selects different actions, because other tactics, scores, attack payment, legal options, and previous deck-search history intervene. The test intentionally characterizes the current behavior and passes if the difference is reproduced. A hidden information correction would require a genuinely observation-consistent belief representation and a K0/K1 transition; merely hiding the deck cards from this helper could make otherwise known K1 information inaccessible.

## Relation to rank-2 full-game diagnostics

The [rank-2 controlled baseline and experimental comparison](../aichi-2026/agent35-crossrank-policy-diagnostic.md) records zero TM Evolution attacks in six full-game pilot trials under both policies, despite some Tool plays. That observation does **not** establish K0 leakage in those sampled decisions. In a late game such as the baseline turn-56 Bunnelby pass, players may already have inspected the deck, so membership checks could be consistent with K1 information.

A new post-decision [TM Evolution target-inventory observation](../../simulation/twinleaf/tm-evolution-pass-evidence.cjs), recorded only after the bot has independently chosen `PassTurnAction`, is being used to distinguish eligible targets truly remaining in deck from cases where the attack cannot accomplish evolution. It must never be fed back into the decision policy before its choice.

## Next work

1. Instrument the policy's prior deck searches and K0/K1 knowledge state in a reproducible game, ideally without changing the chosen actions.
2. Build a real pinned-engine A/B test with the same visible K0 state and different hidden partitions. Determine whether the Bunnelby tactic's difference changes an actual selected action, not only its internal helper return value.
3. For prospective policy repairs, estimate attack-line target availability from the observation-consistent unseen pool in K0, and use logically known deck membership in K1. Keep the full chance of no target, the turn/attack cost, and any Search/Supporter contention.
4. Preserve the separate [upstream hidden-deck-order leak audit](hidden-information-policy-audit.md), which addresses speculative future draws rather than this K0 Prize/deck membership issue.

The 99.5% deck objective remains wholly unproven by these tests.
