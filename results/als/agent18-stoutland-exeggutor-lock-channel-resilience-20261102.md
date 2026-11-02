# Active passive Sentinel versus attack-applied Blockade: two different lock channels

**Agent 18 | 2 November 2026 | printed-card/rule derivation and falsifiable matchup hypotheses; no native head-to-head matchup win.**

The fixed [Aichi rank-2 original Stoutland/Vileplume](../aichi-2026/full-decklists.json) has **Stoutland BCR122**, 140 HP, an *Active-dependent passive Ability* named **Sentinel**: while it is Active, the opponent cannot play Supporters. The registered [Exeggutor/Vileplume v2 challenger](agent18-exeggutor-vileplume-native-v2.json) has **Exeggutor PLF5**, 100 HP, an *attack* named **Blockade** with one Colorless Energy cost: 10 damage plus an effect forbidding the opponent from playing Supporters **during their next turn**. These are the exact attached card-pool printings (`resources/cards/en/bw7.json` `bw7-122` and `resources/cards/en/bw9.json` `bw9-5`). The supplied Advanced Player Rulebook, **A-01 Attacks**, **A-02 Abilities** and especially **C-19 player-directed card-play denial** governs the distinction.

## Operational state and competing failures

| Event, with other effects absent | Original Stoutland Sentinel | Challenger Exeggutor Blockade |
| --- | --- | --- |
| Eligible Pokémon in Active, zero Energy | **Supporter lock active** as a passive Ability | **No fresh Blockade** possible without paying one Colorless attack cost |
| Active lock Pokémon sent to Bench by opposing gust during opponent turn | Sentinel no longer active, so that source alone stops denying Supporters immediately | If Blockade already resolved, its **player-level next-turn lock remains** for that turn, regardless of where Exeggutor moves |
| Opposing Garbodor BKP57 Garbotoxin functioning | Sentinel is normally suppressed, subject to actual Stealthy Hood protection and other lock ordering | Blockade is an attack effect, so Garbotoxin suppressing Pokémon Abilities cannot retroactively suppress its **already applied player-level lock** |
| Opponent removes Exeggutor's attached Energy after one Blockade | Stoutland's Sentinel has no attached-Energy maintenance requirement | Exeggutor must have a payable Energy at the next own attack to renew the lock for a further opposing turn; an attachment/recovery line may still solve this |
| Valid passive Ability suppressed, but one Colorless is payable | No lock from Sentinel unless another effect restores Ability | An attacking Exeggutor can apply Blockade when its attack is permitted |
| Powered Iron Thorns ex TWM77 uses unmodified Volt Cyclone for 140 damage | 140 HP Stoutland is Knocked Out | 100 HP Exeggutor is Knocked Out |

These are **conditional card-text comparisons**, not proof that any of the events occurs in a real matchup. Attack modifications, prevention, switching restrictions, Stealthy Hood, Items, energy boosts and sequence may change results. Blockade's player-directed effect is specifically distinguished from an effect on a Pokémon by rulebook C-19. In the Iron Thorns case, a Volt Cyclone requires three Energy units including Lightning, and its printed effect moves an attached Energy to the attacker's Bench. A rank6 original has four Iron Thorns ex and can construct several acceleration/disruption lines; no first-turn OHKO is inferred.

## Strategic ramifications

**Energy-lock maintenance as a recurring obligation.** An *attack-denial* Pokémon must reapply its time-limited effect on each relevant owner turn to deny a sequence of Supporter turns. The cost can be low, such as Exeggutor's one Colorless, but it competes with every other owner attack that turn, and depends on a live Energy source. The original Sentinel has zero upkeep in Energy and attack actions while remaining Active and unsuppressed. This difference cannot be captured by a single pre-setup access percentage: our independently corrected [Grand Tree access comparison](agent18-grand-tree-two-turn-direct-access-20261102.md) finds a higher strictly untutored resource conjunction for Exeggutor v2, but says nothing about lock survival.

**Target versus player-directed resilience.** Exeggutor's already-applied Blockade is a next-opponent-turn **player effect**. Once applied, gusting or Knock Out of the attacking Pokémon does not by itself cancel the rest of the current opponent-turn Supporter denial. An Active-dependent passive lock ends if the Active source leaves or loses its Ability. A deck that can gust Stoutland out during its own turn may then become free to play a Supporter **later in that same turn**, if other locks allow. This makes opposing Item access and Bench structure meaningful even when both locks initially succeed.

**Original field stress cases:**
- **Rank6 Iron Thorns original** includes **four Plumeria, four Crushing Hammer, two Enhanced Hammer**, as well as four Iron Thorns ex with 140-damage Volt Cyclone. Prior to lock, these offer several avenues to deny Energy or eliminate a 100/140-HP Active source. Once dual Vileplume Item + Exeggutor Blockade lock is established, some channels may be closed; its establishment time and protected transitions decide the interaction.
- **Rank11 Absol/Garbodor original** has **two Garbodor BKP57**, three Float Stone, and related Tools; Garbotoxin removes Abilities when enabled. The original Stoutland's Sentinel must confront this, potentially with the **three Stealthy Hood UNB186** in rank2. Exeggutor Blockade itself has no Ability to suppress, but rank11's other policy can still disrupt Energy, gust or knock out an attacker. Need actual Store legality and guard interactions before predicting the winner.

**Core lesson:** A Supporter lock has at least two independent attributes: **activation/dependency channel** (passive Active Ability versus attack-paid temporary player effect) and **retention channel** (stays while the source condition holds versus duration tied to an opponent turn). A one-number setup access advantage cannot decide which is superior. Their relative value depends on the opponent's allowed disruption, lock timing and the player's retained Energy supply.

## Concrete experiment to prioritize

Against unchanged original rank6 and rank11, use **the same source/attack policy on both physical starting seats** and match complete first-seven and Prize arrangement where possible. For each frozen Stoutland-versus-Exeggutor attempt, preserve actual first lock turn, whether the lock was an accepted native passive Ability or a paid native attack, number of opposing Supporter-play root opportunities rejected after opponent movement, spent Energy/attack actions, Ability suppression, first KO of the lock source, and whether lock coverage continues after that KO. Specifically witness a real opponent gust to Bench **during the denied turn** and verify the source lock behavior and actual Supporter-play eligibility. Include failures, caps, unresolved prompts and actual original 60 opponent decisions in denominators. Don't substitute a staged isolated proof for source-dealt matchup outcome.

**Evidence tier: directly supplied card text and published rulebook, with explicitly hypothetical comparison states. Competitive-qualified games: zero; no validated 99.5% field performance.**
