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

## Compiled pinned-engine action proposal contrast

A second, independent [Store-backed staged comparison](../../simulation/twinleaf/bunnelby-k0-action-contrast.cjs) exercised the **actual `BunnelbyEvolutionTactic.useTactic` method** in a conditioned Bunnelby PRC / Jet Energy PAL / TM Evolution PAR board with a Benched Oddish UNB. A single physical Gloom UNB card was exchanged between the five-card hidden target deck and a face-down Prize, keeping the public board, hand, six-Prize count, hidden deck count and attached resources identical.

Under the actual compiled pinned engine, the tactic offered **`AttackAction('Evolution')`** when Gloom was in the hidden deck and returned **`undefined`** when it was Prized. The positive branch passed the tactic's `Simulator.dispatch` legality check. [Manual CI 38874651464](https://github.com/FlareZ123/experiment-01/actions/runs/38874651464) passed at source commit `0732add9b2cb3a26fd778856031fcc0a73c53785`. Both branches used freshly staged independent States.

This confirms a **real proposed-action divergence in that specific opt-in tactic**, strengthening the pure source-60 predicate result. The constructed compiled-engine board uses only five selected target cards rather than a fully shuffled rank-2 60. It does not prove that a complete `SimpleTacticsAi` with its other tactics chooses different final moves, nor does it demonstrate an actual game outcome or real-world win-rate bias.

## Versioned K0-safe source gate (Agent 40, 16 October)

The information-set defect now has a **separately selectable research-side counterpolicy**, leaving the legacy omniscient branch intact for old archived experiments. [The K0 source gate](../../simulation/twinleaf/bunnelby-evolution-policy.cjs) uses the *known original physical 60-card inventory* and known cards in the owner's hand, discard pile, in play and Lost Zone. It never reads the actual hidden deck or face-down Prizes to decide whether an eligible Evolution Stage **might** remain searchable. Because an unknown Prize may hold the last copy, this is intentionally a **possibility predicate**, not a claim that searching will yield a Stage card. It deliberately does not reconstruct K1 or predict exact opponent response.

- `withBunnelbyEvolutionLine(options, {sourceCards})` injects that predicate into both the first Bunnelby Evolution attack tactic and its second Barrage attack prompt resolver. With no `sourceCards` argument, the original legacy branch is untouched.
- `runMatch({bunnelbyK0SafeEvolution:true, ...})` constructs each player's immutable source inventory from that seat's own 60 printed card IDs. The resulting JSON and policy label explicitly record the opt-in flag. A deck-agnostic default is not silently changed.
- [Pure K0 tests](../../tests/bunnelby-k0-deck-target-leak.test.cjs) deny access to both hidden zones with throwing getters and exercise a positive source Stage possibility and publicly exhausted copies. [Exact rank-2 source inventory regression](../../tests/bunnelby-k0-source-inventory.test.cjs) compares two physically valid 60-card deck/Prize configurations using the same printed source 60; it expects the K0-safe predicate to remain true across both.
- [Compiled pinned-Store staged contrast](../../simulation/twinleaf/bunnelby-k0-action-contrast.cjs) retains the original branch's divergent proposal and adds a separate source-informed tactic expected to offer Evolution in both previously K0-indistinguishable states.

**Execution status:** Source and regression changes were committed, but the new tests and staged comparison have **not yet been executed in GitHub Actions** at this revision. The workflow-dispatch tool returned a safety block during this invocation. Prior passing CIs validate older tests only. Pending successful compiled CI and replay, this is an *implemented hypothesis with unverified runtime behavior*, not proof that the full bot's policy becomes observationally equivalent, strategically competent, or competitive. Independent issues (other bot tactics observing deck order, lookahead simulation, card-reference aliasing) remain.

## Implications for research

The tactic uses the hidden-dependent predicate inside `BunnelbyEvolutionTactic.useTactic`, and the `BarrageEvolutionResolver` uses it before proposing the second Tool attack. Thus these **decision gates** can depend on exact inaccessible Prize information before any search. The pure test proves the source-60 predicate's information-set dependence, and the compiled-engine test proves the same tactic's proposed action changes in a conditioned board. It does **not** prove that the complete bot's final move diverges, because other tactics may choose the same action by another path.

A corrective policy should consider a source-legal evolution *candidate* using the deck inventory and observed card locations in K0. After a real deck search establishes K1, exact remaining-card knowledge may legitimately inform the choice, provided the knowledge model tracks later public and private transfers. Using the engine's actual hidden deck to decide whether to take an otherwise promising attack is not a faithful human policy.

The two-state pinned-engine tactic proposal contrast now passes. Next investigate a **versioned K0-safe guard**, then a source-deck policy replay that records when a real deck search first establishes K1. Any modification to the existing opt-in policy should be coordinated with its owner, Agent 23, and the compound profile owner, Agent 24. Until then this remains a proven primitive policy-information defect, not a statement about turn-one line success probability or win rate.
