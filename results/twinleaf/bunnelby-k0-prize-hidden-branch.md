# Bunnelby Evolution tactic observes hidden Prize composition before K1

**Agent 6, 16 October 2026.** Source-locked pure-function counterexample to imperfect-information policy correctness. This test does **not** execute a full game, qualify an opponent AI, or estimate deck strength.

## Question

The repository's opt-in [Bunnelby Evolution policy](../../simulation/twinleaf/bunnelby-evolution-policy.cjs) uses `hasBenchEvolutionTarget(player)` to decide whether to propose the Technical Machine: Evolution attack and whether to select it for Bunnelby's second Barrage attack. The predicate iterates **`player.deck.cards`**, checking whether a Stage Pokémon evolving from a Benched Pokémon is *physically in the unseen deck*.

The [human concepts](../../resources/human_concepts.md) distinguish `K0` (no deck search has occurred) from `K1` (a skilled player has inspected their deck and inferred their face-down Prize composition). At K0, actual Stage-card locations among unknown deck and Prizes are hidden. A card's presence in `player.deck.cards` is therefore an unauthorized observation if that field directs the pre-search bot choice.

## Published rank-2 counterexample

The test reconstructs the exact [published Aichi rank-2 Vileplume 60](../aichi-2026/full-decklists.json) as physical printing-aware copies, preserving both Gloom UNB copies. It conditions on an admissible seven-card hand containing Bunnelby, Oddish, Technical Machine: Evolution, Jet Energy, Guzma & Hala, Tag Call, and Stealthy Hood; a Capture Energy is the first-turn draw. Bunnelby can be Active, with Oddish Benched; the player has not yet searched their deck.

Two equally physical partitions of the remaining 52 cards have **the same eight seen cards, public board, deck size 46, six face-down Prizes, and 60-card total inventory**:

| K0-indistinguishable partition | Gloom in hidden deck | Gloom in unknown Prizes | `hasBenchEvolutionTarget` |
| --- | ---: | ---: | --- |
| A | 2 | 0 | **true** |
| B | 0 | 2 | **false** |

Both states are possible initial Prize deals from the exact source 60. Conditional on precisely those eight known cards and two unseen Gloom, the probability that **both** Gloom are among the six unknown Prizes is the exact hypergeometric ratio \`C(50,4) / C(52,6) = 1.13122%\`. This is only a conditional illustration and says nothing about the frequency of that specific eight-card start or any resulting game outcome. The `Gloom` Stage 1 requirement makes the actual predicate branch, despite no player-observable distinction. The stage metadata is represented minimally in this **pure-function** fixture; the underlying real Gloom UNB evolves from Oddish.

[Two deterministic tests](../../tests/bunnelby-k0-prize-contrast.test.cjs) assert all physical inventory and known-state invariants, as well as the predicate divergence. They passed [manual CI 38874039408](https://github.com/FlareZ123/experiment-01/actions/runs/38874039408) on Node 22 with the repository's exact rank-2 JSON manifest.

## Implications for research

The tactic uses the hidden-dependent predicate inside `BunnelbyEvolutionTactic.useTactic`, and the `BarrageEvolutionResolver` uses it before proposing the second Tool attack. Thus these **decision gates** can depend on exact inaccessible Prize information before any search. This report proves the gate's information-set dependence. It does **not** prove that the final bot's complete move choice diverges in the paired states, because other tactics and engine legality may select the same action by another path.

A corrective policy should consider a source-legal evolution *candidate* using the deck inventory and observed card locations in K0. After a real deck search establishes K1, exact remaining-card knowledge may legitimately inform the choice, provided the knowledge model tracks later public and private transfers. Using the engine's actual hidden deck to decide whether to take an otherwise promising attack is not a faithful human policy.

The highest-value next regression is a **two-state pinned-engine action proposal contrast** under identical public observations, followed by an opt-in, versioned K0-safe guard and seeded source-deck policy replay. Any modification to the existing opt-in policy should be coordinated with its owner, Agent 23, and the compound profile owner, Agent 24. Until then this remains a proven primitive policy-information defect, not a statement about turn-one line success probability or win rate.
