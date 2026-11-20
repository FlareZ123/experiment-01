# Sentinel branch: Bunnelby hybrid timing, Bench budget, and the Whismur alternative

**Agent 28 · 20 November 2026 · structural synthesis only.** No new decklist, fixture, game, or matchup result is created here.

## Decision

There are three distinct Sentinel branches; do not conflate them:

1. **V1 Bunnelby/TM: Evolution** is the existing exact 60 with a native conditioned opener.
2. **The proposed Bunnelby + second-Stoutland hybrid** is an uncommitted two-slot idea. It does not close the opponent's first Supporter window when Sentinel goes second, and it fills all five Bench slots when all intended roles are retained. Its possible benefit is later Stoutland redundancy after one Knock Out.
3. **Whismur double-lock v2** is a separate, already committed exact 60. Its Bawl attack is the structural way to cover the turn-3 Trainer window when going second, then use Rare Candy + Grand Tree to establish Stoutland and Vileplume together. It remains untested as a deck and does not cover the opponent's first Supporter window when going first.

None is promoted as the best deck. The Critic pre-trace stopline remains in force: do not create another fixture, workflow, policy, or field panel before the accepted first trace.

## Inputs and scope

- V1: [candidate-sentinel-lopunny-vileplume-v1.psv](../candidate-sentinel-lopunny-vileplume-v1.psv).
- Exact Whismur challenger: [candidate-sentinel-lopunny-vileplume-v2-whismur-doublelock.psv](../candidate-sentinel-lopunny-vileplume-v2-whismur-doublelock.psv), 6 Energy / 26 Pokémon / 28 Trainers.
- The two-Stoutland Bunnelby hybrid was proposed in [Agent27's message](../../../communications/agent28/20261112T164410635Z_agent27-hybrid-priority-after-existing-tm-evidence.md), with Budew and Counter Gain as possible cuts; it was never committed as a complete 60.
- The direct Artazon → Bunnelby line is documented in [Agent28's exact opening analysis](../agent28-sentinel-artazon-direct-opening-exact-20261106.md). Its conditioned native Store fixture established the Bunnelby search, Jet attachment, two Evolution attacks, Vileplume evolution and an opponent Item rejection. It was not a complete game or an autonomous-player result.
- The Whismur / Grand Tree line and its exact 60 are documented in [Agent27's challenger proposal](../../../communications/agent28/20261112T162541331Z_agent27_whismur-grandtree-rarecandy-sentinel-challenger.md) and [exact-list handoff](../../../communications/agent28/20261112T163517916Z_agent27-sentinel-v2-exact-list-and-field-census.md).

## Why the Bunnelby hybrid does not close the early Supporter window

Use game-turn numbers explicitly. The player's first turn is game turn 1 if going first, or game turn 2 if going second.

**Going second:**
- On game turn 2, Bunnelby/TM: Evolution can use its special attack line; the existing native witness establishes the Vileplume side of the setup.
- Rare Candy and Grand Tree cannot evolve a Basic Pokémon during the player's first turn. The proposed Rare Candy + Grand Tree double-Stoutland setup is therefore not available on game turn 2.
- The opponent gets game turn 3 before Stoutland can be established by that proposed route, and may play Guzma or another Supporter. This is the exact timing window exposed by the existing rank-1 counter-reply.
- If Vileplume was already established on game turn 2, its symmetrical Irritating Pollen also prevents the player from using Rare Candy from hand on a later turn. The hybrid must either delay Vileplume until after Rare Candy, or use a different Stoutland line; delaying Vileplume leaves the turn-3 window open. No alternative exact line is established here.

**Going first:**
- The player cannot attack on game turn 1, so the Bunnelby/TM line is unavailable then.
- The opponent, as second player, has game turn 2 and can play a Supporter before the Sentinel player gets a second turn.
- Rare Candy + Grand Tree can be used on the Sentinel player's second turn if the Basic Pokémon were already in play, but that is after the opponent's first Supporter opportunity.

Thus the Bunnelby hybrid's second Stoutland is a potential later redundancy layer, not an answer to the first Supporter window across both starts. Agent27's [first-turn correction](../../../communications/agent28/20261112T164636955Z_agent27-correction-hybrid-firstturn-evolution-limits.md) is controlling for this timing point.

## Bench budget and Active-slot cost

Assume the intended lock/engine/attacker roles are all maintained and Jet or another switch promotes Stoutland. When Stoutland becomes Active, the Bunnelby that performed the attacks moves to the Bench.

| Board role while Supporter lock is live | V1 Bench slots | Two-Stoutland Bunnelby hybrid |
|---|---:|---:|
| Vileplume | 1 | 1 |
| Pidgeot ex | 1 | 1 |
| Bunnelby after Stoutland pivot | 1 | 1 |
| Mega Lopunny ex attacker | 1 | 1 |
| Second Stoutland | — | 1 |
| **Bench used** | **4 / 5** | **5 / 5** |
| **Bench remaining** | **1** | **0** |

This is a role-count derivation, not a claim that the board is consistently assembled from an opening hand. V1 retains one spare Bench slot; the hybrid consumes it before accounting for another pivot, replacement Basic, second Vileplume, or second attacker.

The hybrid can create room only by delaying or omitting one role, or changing the Bunnelby setup. Omitting/delaying Pidgeot ex gives up Quick Search; omitting/delaying Mega Lopunny gives up the intended 230-damage pressure line; omitting the Bunnelby pivot leaves Stoutland out of the Active Spot and Sentinel inactive.

There is also an unavoidable Active-slot conflict:
- Stoutland's Sentinel Supporter lock requires Stoutland to be Active.
- Mega Lopunny ex's Gale Thrust requires Mega Lopunny ex to be Active.
- Only one Pokémon can be Active. The second Stoutland may preserve the lock after one Stoutland Knock Out, but cannot keep Sentinel live while Mega Lopunny attacks.

## The separate Whismur double-lock v2

The exact v2 list is not the Bunnelby hybrid and not the Float Stone variant. Agent27's committed 60 removes Budew ×1, Bunnelby ×2 and TM: Evolution ×2; it adds Whismur CES 116 ×1, Rare Candy ×2, a second Stoutland BCR 122 and a third Lillipup CEC 174.

**Going second, the intended sequence is:**
1. On the player's first turn (game turn 2), use Whismur's Bawl. It prevents the opponent from playing Trainer cards from hand during game turn 3. This covers the turn that the Bunnelby hybrid leaves open.
2. Do not rely on Bawl to stop Abilities or effects of Stadiums already in play. In particular, an opponent's existing Grand Tree can still be used during game turn 3; the Trainer lock stops playing a new Stadium from hand, not activating the Stadium already in play.
3. On the player's next turn (game turn 4), attach Stealthy Hood to the two Lillipup and one Oddish before Vileplume enters play. Use Rare Candy on Lillipup #1 → Stoutland #1; use Rare Candy on Oddish → Vileplume; then use Grand Tree on Lillipup #2 → Herdier → Stoutland #2. Jet Energy promotes one Stoutland Active, leaving the second as a replacement.
4. Vileplume's Item lock is symmetrical, so both Rare Candy plays and the Tool attachments must happen before Vileplume is evolved. Grand Tree is a Stadium effect and Jet is Energy, not an Item.

The Whismur Bawl interaction and Grand Tree mechanics already have research-owned native tests; Agent27 explicitly recommends reusing them rather than creating duplicates. See [the evidence reuse handoff](../../../communications/agent28/20261112T165003594Z_agent27-v2-reuse-existing-native-evidence.md).

**Going first remains weaker:** the player cannot attack with Whismur on game turn 1, while the opponent (second player) can play a Supporter on game turn 2. The v2 can establish its double lock on the player's second turn (game turn 3), but the opponent's first Supporter opportunity has already occurred. This is not a complete both-seat solution.

### Prize sensitivity of the exact v2 turn-4 line

The committed v2 list contains exactly six physical cards required by Agent27's stated turn-4 double-lock sequence: Whismur ×1, Grand Tree ×1, Rare Candy ×2, and Stoutland ×2. With six random prizes from a 60-card list, the probability that **none** of these six cards is prized is

\[
\frac{\binom{54}{6}}{\binom{60}{6}} = 0.5158844 (**51.59%**)
\]

So the probability that at least one required piece is prized is **48.41%**. Individually, the singleton Whismur and Grand Tree each have a 10% prize risk; at least one copy of either two-card pair (Rare Candy or Stoutland) is prized with probability **19.15%**.

This is a hypergeometric calculation from the exact 60, not a simulation. It is an upper bound on immediate access to the *specified* turn-4 line: it ignores opening-hand/draw/search constraints, and assumes a prized piece is not recovered by taking a Prize before turn 4. If any one of the six is prized, this exact sequence cannot be completed on schedule without an alternative line. It does **not** mean the deck loses 48.41% of games; alternate, slower lines may still win. It does mean the double-lock plan's prize sensitivity must be measured before treating it as a reliable primary strategy.

**Remaining v2 risks, not resolved by the rules-derived sequence:**
- Bawl lasts only one opponent turn and does not stop playing Pokémon cards from hand, Abilities, Energy attachments, attacks, ordinary evolution, or use of a Stadium already in play.
- The authenticated field contains existing Grand Tree in ranks 2, 15 and 31; the opponent's activation remains possible during Bawl.
- Night Watch 150 can Knock Out one 140-HP Stoutland; the second copy may preserve Sentinel through that one Knock Out. Max Geist 130 alone does not Knock Out 140-HP Stoutland, but subsequent attacks can still remove the replacement.
- Rank-31 Dusknoir Cursed Blast versus Stealthy Hood still needs paper/Twinleaf validation.
- The exact v2 is a 60-card proposal, not a played or simulated matchup result. Agent27's companion [field counter census](agent27-sentinel-double-lock-field-counter-census-20261112.md) is list-presence evidence, not win-rate evidence.

## Rank-1 counter-reply and what it proves

[Agent28's native rank-1 counter-reply report](agent28-sentinel-rank1-guzma-counterreply-native-20261108.md) demonstrates a conditioned Guzma → Vileplume promotion → four-Psychic Max Geist 130 KO against an Item-lock-only board. It did not have Stoutland Active. It is consistent with the timing failure above: when going second, the opponent's game-turn-3 Supporter window exists before the Bunnelby hybrid can establish Stoutland through Rare Candy + Grand Tree.

This fixture does not show Guzma bypassing a live Sentinel lock. Conversely, the Whismur Bawl proposal is a rules-derived way to deny Trainer cards from hand during that one turn, but no full-game v2 result establishes that it wins the exchange.

## Do not conflate the Float Stone variant with either hybrid

The separate [candidate-sentinel-gust-escape-v2.psv](candidate-sentinel-gust-escape-v2.psv) is a one-slot Float Stone / Stealthy Hood substitution. It still has one Stoutland; it is neither the Bunnelby second-Stoutland proposal nor the Whismur double-lock v2.

Agent20's native run [42526570603](https://github.com/FlareZ123/experiment-01/actions/runs/42526570603) failed both Float Stone seat cases at the PassTurnAction activePlayer handoff before RetreatAction. The test did establish Float Stone attachment to Oddish before evolution, retention on Vileplume after evolution, and zero calculated retreat cost after the conditioned Guzma response. It did not execute the owner's retreat, so no rescue was demonstrated.

## Recommendation and next evidence gate

1. Keep V1 and Whismur v2 as separate, unpromoted exact-list candidates; keep the Bunnelby second-Stoutland idea as an uncommitted proposal. Do not silently merge their packages.
2. Do not add a new test, fixture, workflow, policy or field panel before the accepted first-trace stopline clears.
3. After the trace, establish one competent, reproducible candidate-policy / exact rank-1 opponent-policy pair first. If that pair identifies the turn-3 Supporter window as a dominant loss when going second, compare V1 against the exact Whismur v2 under the same policy and source list, both starts, and the paper-faithful Night Watch selector. Reuse the existing Whismur and Grand Tree native tests; do not duplicate them.
4. Record separately whether the opponent has a pre-existing Grand Tree, whether Bawl prevents hand-played Trainers, whether both locks establish on turn 4, whether one or both Stoutland survive, and what happens on the first unrestricted turn when going first.

The broader [lock-architecture field synthesis](agent35-lock-architecture-field-synthesis-20261117.md) remains controlling. No 99.5% claim, candidate promotion, or full-field performance claim follows from these structural results.
