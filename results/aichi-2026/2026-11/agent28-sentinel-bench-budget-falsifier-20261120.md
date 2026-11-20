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

### Corrected Prize sensitivity and Gladion/Jet recovery

The exact v2 list contains Gladion CIN 95 ×1 and Jet Energy PAL 190 ×3, which the earlier six-piece calculation did not account for. The earlier 48.41% raw exposure was never a game-loss probability: one Gladion can recover a single missing named piece, and the Prized-Whismur case has a separate Gladion + Jet route that can still enable Bawl on game turn 2.

The corrected enumeration conditions on a valid opening with at least one of the 13 Basics, deals the opening seven first, then deals six Prizes from the remaining 53 cards. It distinguishes these events:

| Prize-zone event or recovery | Probability |
|---|---:|
| None of Whismur ×1, Grand Tree ×1, Rare Candy ×2, Stoutland ×2 is Prized | **51.5279%** |
| Exactly one of the other five named pieces is Prized, with Whismur and Gladion not Prized | **28.8340%** |
| That non-Whismur piece is recovered by Gladion by turn 4 using the opening hand or two natural draws | **4.6195 percentage points** |
| Whismur is the only named piece Prized, with Gladion not Prized | **5.5583%** |
| Two or more of the six named pieces are Prized | **10.5420%** |
| Exactly one named piece and Gladion are both Prized | **3.5378%** |
| Residual outside the ideal one-Gladion/Jet recovery model | **14.0798%** |
| Prized Whismur is recovered for turn-2 Bawl by Gladion + Jet Energy | **0.3854 percentage points** |
| **Natural-draw-only named-piece Prize-zone viability** | **56.5327%** |
| **Ideal one-Gladion recovery ceiling** (Gladion available by the deadline and Jet available for Prized Whismur) | **85.9202%** |

The **14.0798%** residual outside the ideal recovery model decomposes into **10.5420%** with at least two of the six named pieces Prized and **3.5378%** with exactly one named piece plus Gladion Prized. This is a multi-Prized failure of the modeled one-Gladion recovery mechanism, not a game-loss probability; slower or alternative lines are not modeled.

This residual can be reproduced by enumerating the valid opening composition. Let \(w\in\{0,1\}\) be Whismur in the opening, \(o\) the number of the other 12 Basics, \(k\) the number of the other five named pieces (Grand Tree, Rare Candy ×2, Stoutland ×2), \(g\in\{0,1\}\) be Gladion in the opening, and \(r=7-w-o-k-g\) the other cards. Valid openings satisfy \(w+o\ge1\), with multiplicity

\[
N(w,o,k,g)=\binom{1}{w}\binom{12}{o}\binom{5}{k}\binom{1}{g}\binom{41}{r}.
\]

After that opening, the remaining named-piece count is \(K=6-w-k\) and the remaining Gladion count is \(G=1-g\). For six Prizes drawn from the remaining 53, the conditional probability of \(j\) named pieces and \(h\) Gladion being Prized is

\[
\frac{\binom{K}{j}\binom{G}{h}\binom{53-K-G}{6-j-h}}{\binom{53}{6}}.
\]

Weighting by \(N\) and normalizing over valid openings gives the two residual probabilities above. This explicitly accounts for named pieces already present in the opening and for the fact that Gladion itself can be Prized.

#### Three-Hood protection package: stricter Prize-only ceiling

The v2 setup plan attaches Stealthy Hood ×3 to two Lillipup and one Oddish before Vileplume enters play. These are additional to the six evolution/bridge pieces above and are required for the fully Hood-protected two-Stoutland + Vileplume board. Therefore the **85.9202%** six-piece ceiling is not the ceiling for the fully protected core.

Conditioning on the same valid opening and six Prizes from the remaining 53, the nine-card named package (the six pieces plus all three Hoods) has:

| Prize-zone event | Probability |
|---|---:|
| None of the nine package cards is Prized | **35.8289%** |
| Exactly one package card is Prized and Gladion is not Prized | **38.0739%** |
| Exactly one package card and Gladion are both Prized | **4.1739%** |
| At least two of the nine package cards are Prized | **21.9232%** |
| **Ideal one-Gladion/Jet-available recovery ceiling for the nine-card package** | **73.9029%** |
| **Residual outside that ideal recovery model** | **26.0971%** |

In isolation, none of the three Hoods is Prized in **72.3057%** of valid openings. The nine-card ceiling assumes Gladion is always accessible by turn 4 whenever it is not Prized and Jet is accessible if Whismur is the single missing package card. It allows one recovery only; it does not model the Lillipup/Oddish copies, other setup cards, hand access, board/energy requirements, or opponent actions. This is a stricter Prize-only bound for the fully protected core, not full lock assembly or a win estimate.

For reproducibility, split the 41-card residual in the preceding opening enumeration into three Hood copies and 38 other cards. Let \(h\) be Hoods in the opening and \(r=7-w-o-k-h-g\); replace the opening multiplicity with

\[
N_9(w,o,k,h,g)=\binom{1}{w}\binom{12}{o}\binom{5}{k}\binom{3}{h}\binom{1}{g}\binom{38}{r}.
\]

The remaining nine-card package count is \(P=9-w-k-h\), and the remaining Gladion count is \(G=1-g\). For six Prizes, the conditional probability of \(m\) package cards and \(j\) Gladion being Prized is

\[
\frac{\binom{P}{m}\binom{G}{j}\binom{53-P-G}{6-m-j}}{\binom{53}{6}}.
\]

Normalize the weighted sum over valid openings (\(w+o\ge1\)). The ideal ceiling is \(P(m=0)+P(m=1,j=0)\); its complement is \(P(m\ge2)+P(m=1,j=1)\).

The Gladion + Jet route also adds **0.3854 percentage points** to first-turn Bawl access. The existing exact opening model's 12.0433% without Guzma & Hala and 22.8575% under the optimistic two-discard assumption therefore become **12.4287%–23.2429%**, conditional on a valid 13-Basic opening and going second. With a 50/50 seat assignment, that is **6.2144%–11.6214% of valid-opening games** before opponent interaction. The rescue requires another Basic in the opening, Gladion and Jet available by the first turn, an open Bench slot, and no live Supporter lock; it does not rely on Guzma & Hala's two-discard assumption.

These are Prize-zone and card-access sensitivities, not lock-assembly probabilities. The 56.5327% natural-draw result does not establish access to the necessary Lillipup/Oddish board, Tools, Energy, or the rest of the hand; it omits extra draw/search when locating Gladion while also omitting the other access and board constraints. The 85.9202% figure is an idealized ceiling for this one-card recovery mechanism, not for the deck. Neither figure is a game-loss or win-rate estimate.

Reproduction: [Agent35's Gladion/Jet recovery derivation](agent35-whismur-gladion-prize-recovery-20261120.md) and [standard-library enumerator](../../../simulation/evaluation/2026-11/agent35-whismur-gladion-recovery.py).

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
