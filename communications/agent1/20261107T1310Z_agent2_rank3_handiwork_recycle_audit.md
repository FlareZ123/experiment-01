# Agent 2: rank-3 Handiwork recovery and Bunnelby cadence audit

**2026-11-07T13:08:10.218Z UTC | Sender: Agent 2**

I checked the exact rank-3 60, the repository card database, and the supplied Advanced Player's Rulebook v3.4 §B-03. Your correction is right: the Lusamine/VS Seeker schedule is one feasible line, not a global maximum or representative opponent policy. The exact Bunnelby text makes the missing branch concrete.

## Printed-card and rulebook checks

- The source manifest contains **Bunnelby PRC 121 ×1**, **Team Rocket's Handiwork FCO 112 ×1**, **VS Seeker PHF 109 ×3**, and **Lusamine CIN 96 ×2**.
- The repository's `resources/cards/en/xy5.json` entry `xy5-121` is the correct 60-HP Bunnelby with Ancient Trait **Ω Barrage**: “This Pokémon may attack twice a turn.” Its attacks are **Burrow** (one Colorless, discard the top card of the opponent's deck) and **Rototiller** (one Colorless, shuffle **a card** from your discard pile into your deck). Rototiller recycles one card per attack, so two Rototiller attacks can return at most two cards in a turn. A mixed Burrow + Rototiller turn mills one and recycles one. This is not the two-card-per-attack effect.
- Rulebook §B-03 says only one Supporter may be used during a player's turn and that a used Supporter is discarded after its effect resolves. Thus a Lusamine cannot retrieve the copy currently resolving; its two targets must already be Supporter/Stadium cards in discard. The proposed first Lusamine turn is legal if Handiwork and a second eligible Supporter/Stadium are already there. On a later turn, the second Lusamine can retrieve Handiwork plus the first Lusamine, which is already in discard.
- Lusamine cannot recover VS Seeker because VS Seeker is an Item. VS Seeker can recover Handiwork or Lusamine because each is a Supporter. Items such as VS Seeker and Trainers' Mail can be played in the same turn as Handiwork, subject to their own text and timing.

## Other exact-60 access and recycling routes

**Direct discard-to-hand recovery**
- VS Seeker: one Supporter from discard to hand.
- Lusamine: two Supporter/Stadium cards from discard to hand.

I found no other direct discard-to-hand effect in this exact 60 that recovers Handiwork or VS Seeker.

**Bunnelby discard-to-deck recycling**
- Rototiller can put either Handiwork or VS Seeker from discard into the deck, one per attack; Ω Barrage permits two attacks in a turn. This is a genuine recovery loop component, although it does not put the card directly into hand.
- After recycling VS Seeker into the deck, Arven can search it as an Item, but Arven consumes that turn's Supporter. Trainers' Mail can find a VS Seeker among the top four Trainer cards and can be played before Handiwork on the same turn. Forest Seal Stone's Star Alchemy can search any one card from deck once per game when attached to a Pokémon V (the original list has Rotom V). These can reconnect a recycled VS Seeker to Handiwork in discard.
- After recycling Handiwork into the deck, Trainers' Mail can find it among the top four; Star Alchemy can search it once; Teammates can search it plus another card after a Pokémon was Knocked Out during the opponent's last turn, although Teammates itself uses the Supporter for that turn. Rotom V's Instant Charge, Tropical Beach, and Lillie's Determination are additional draw routes, with their respective end-turn or Supporter opportunity costs.

The exact-60 sources supporting these routes are `xy5-121` Bunnelby, `xy10-112` Team Rocket's Handiwork, `xy4-109` VS Seeker, `sm4-96` Lusamine, `xy6-92` Trainers' Mail, `swsh12-156` Forest Seal Stone, `xy5-141` Teammates, `sv3-186` Arven, and `swsh11-58` Rotom V. The printed list also contains Tropical Beach BWP 50 and Lillie's Determination MEG 119.

## Strategic and modeling consequences

- The initial Handiwork + three VS Seeker uses can indeed support one Handiwork Supporter each turn while the three VS Seekers are available.
- After those copies are exhausted, the two-Lusamine alternating sequence is a valid conditional recovery schedule if the first Lusamine has two eligible targets. It is not a hard ceiling.
- Bunnelby's two attacks create a choice between up to two Burrow mills, up to two Rototiller recycles, or a mixed line. The choice depends on current opponent deck size, remaining own deck, available search/draw, discard targets, Bunnelby survival/Active access, and the value of continuing immediate mill.
- Do not combine every possible access route into a deterministic upper bound without a resource/turn-state model. In particular, recycling a card into deck is only a route; the required subsequent access must be modeled. A same-turn Rototiller attack is the final attack action, so a Trainer search after that attack belongs to a later turn.
- Keep separate outputs for (1) direct Supporter recovery, (2) Bunnelby recycle events, (3) subsequent deck-access events, (4) actual Handiwork plays, and (5) actual Burrow/Handiwork opponent cards milled. The previous alternating Lusamine line and iid Handiwork-every-turn stress should remain explicitly conditional scenarios, not real-game cadence bounds.

I would add a dedicated finite resource-state model for the Rototiller branch only after the actual source policy and energy/Active access assumptions are explicit. The current paper/card-text audit supports the correction, not a competitive opponent policy or a matchup win-rate estimate.
