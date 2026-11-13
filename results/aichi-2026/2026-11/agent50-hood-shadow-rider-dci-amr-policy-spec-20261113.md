# Hood Shadow Rider v1 — matchup-conditioned DCI/AMR policy notes

**Agent 50 · 13 November 2026 · heuristic policy specification, not a validated bot**

This note applies to the nominated Hood Shield Shadow Rider v1 list, which retains Dialga-GX and Mimikyu. It translates the repository's human concepts—UDP, DCI, AMR, K0/K1, Supporter contention and ALS—into concrete policy state and sequencing requirements. It is not a static card-value ranking.

## State the policy must track

At minimum, a deck-aware policy needs:

- Opponent archetype/posterior and confidence, updated from mulligan reveals and early board state.
- Whether the opponent is Regidrago and whether its last attack was Apex Dragon.
- Dialga-GX location: deck, hand, discard, Prizes, in play or otherwise unavailable.
- Mimikyu location and whether it can attack this turn.
- Whether the GX attack allowance has already been used; which GX attack was used.
- Whether the nested Timeless-GX copy line remains possible.
- Known Prize composition: use the supplied human-concept K0/K1 distinction (K0 before the first full deck search; K1 after searching and inferring Prize contents).
- Psychic Energy in hand, attached to each Pokémon, in discard and in Prizes.
- Shadow Rider V / VMAX counts in hand, deck, play, discard and Prizes; whether two VMAX targets remain for Radiant Eternatus.
- Hood count/location, attached Pokémon, opposing Ability-lock pieces, and opposing Tool/Stadium removal.
- Bench occupancy and remaining bench capacity; Active/Bench retreat state; Latias ex and Float Stone availability.
- Supporters in hand/discard/deck, VS Seeker availability, and whether a Supporter has already been played this turn.
- Whether each one-of tech's matchup-specific target/effect is currently relevant.

A scalar DCI alone is insufficient. Use conditional states or a vector keyed by matchup, turn, prize map, zone state and intended ALS.

## Critical Regidrago ALS

The counter-line is:

**Opponent uses Apex Dragon → Mimikyu Copycat → nested Apex Dragon chooses Dialga-GX Timeless-GX from your discard.**

The card-text/rule basis and remaining GX-allowance uncertainty are documented in the [Dialga counter-ALS audit](agent50-hood-shadow-rider-dialga-slot-audit-20261113.md).

### Regidrago-conditioned policy

| Piece | DCI/UDP state | Policy |
| --- | --- | --- |
| Dialga-GX | Effectively UDP while counter-line live | Preserve in discard; do not treat its unpayable normal attacks as evidence it is expendable |
| Mimikyu GRI 58 | Effectively UDP while Apex Dragon counter is live | Preserve access; its Copycat attack costs Psychic + Colorless |
| Battle Compressor | High AMR when Dialga is still in deck | Consider discarding Dialga among the three cards, but account for the other two cards' DCI |
| Mysterious Treasure | High AMR when Dialga is in hand | Can discard Dialga as cost while finding a Psychic/Dragon Pokémon; preserve the line |
| Night Stretcher | High DCI with Dialga in discard | Do not recover Dialga before the Copycat line unless deliberately resetting/rebuilding the line |
| GX attacks on Tapu Lele / Trevenant & Dusknoir | Preserve the once-per-game allowance | Do not spend a GX attack before Timeless-GX if the counter-line is intended; verify nested-copy ruling |
| Mimikyu Copycat timing | Conditional AMR | It can copy Apex Dragon only if the opponent used that non-GX attack during their last turn; the opponent can deny the line by choosing another attack |

After the line is executed or made impossible, recompute Dialga's DCI. Do not permanently classify it as “never discard” or “always discard.”

## Non-Regidrago DCI

Against a matchup without a relevant Dragon attack-copy line, Dialga may become a high-DCI discard target because its printed attacks are not payable and it has no Ability. It can still have value as a 180-HP Basic pivot, so the policy should compare that value against the immediate search/discard need.

Mimikyu is also matchup-dependent: Copycat can use other non-GX attacks from the opponent's last turn, but its value may be low if the opponent's attacks are poor copy targets. Identify the opponent's attack menu before discarding either piece.

## Turn sequencing and AMR

### Shadow Rider engine

1. Establish Shadow Rider V before spending search resources on secondary Pokémon, unless the matchup demands an immediate tech.
2. Use Fog Crystal first when it can find the required Basic Psychic Pokémon or Psychic Energy without a discard. Mysterious Treasure is more flexible (Psychic or Dragon Pokémon) but requires a discard; its AMR depends on having a sufficiently high-DCI card in hand.
3. Underworld Door is once per Shadow Rider VMAX per turn: attach a Psychic Energy from hand to a Benched Psychic Pokémon, then draw two. Choose the recipient based on the next evolution/attack and Max Geist's total attached Psychic Energy, not merely the first available Bench target.
4. Attach Stealthy Hood to the intended Shadow Rider V before evolving when the protected evolution line is planned; the repository's earlier hook test reports the Tool survives evolution. Hood protects against opponent Abilities, not opposing Tool removal. Treat it as temporary protection, not permanent immunity.
5. Use Arven with Supporter contention in mind: it can find an Item and a Tool, often Hood plus Fog Crystal/another Item. Tapu Lele-GX can find Arven, Guzma, Ranger, Teammates or Raihan with Wonder Tag, but that Ability can be suppressed.
6. Radiant Eternatus's Climactic Gate searches up to two Pokémon VMAX and ends the turn. Sequence other useful Supporters, Items, attachments and Underworld Door activations first; play Radiant Eternatus only when the bench and remaining VMAX targets make the Gate worthwhile.
7. Forest Seal Stone is a once-per-game broad search. Preserve its VSTAR Power until a genuine bottleneck; do not spend it on a card that Fog Crystal or Mysterious Treasure can obtain cheaply.

### Matchup tech and resource timing

| Card | State-dependent use / DCI rule |
| --- | --- |
| Stealthy Hood (2) | Very high value against relevant Ability lock; after sufficient protection is attached and no further lock threat exists, remaining copy can become discardable. Tool-removal answers remain live. |
| Pokémon Ranger | Removes attack effects, not Abilities. Do not treat it as a direct answer to Iron Thorns/Garbodor Ability lock. Preserve for relevant attack-based effects. |
| Field Blower | Preserve while opposing Tools/Stadiums matter; use against actual counter pieces rather than for low-value thinning. |
| Marshadow UNB 81 | Resetting Hole is a play-from-hand Stadium reset; time it against a relevant Stadium. |
| Girafarig LOT 94 | Get Lost is matchup-dependent: wait until high-value recovery cards are in the opponent's discard, then Lost Zone them. |
| Unfair Stamp | Preserve until its Knock Out condition is met; it is the ACE SPEC and cannot be replaced. |
| Teammates / Raihan | Their high AMR is conditional on a Pokémon having been Knocked Out during the opponent's last turn. Avoid treating them as generic early Supporters. |
| Acerola | Use on a damaged Pokémon when returning it and its attached cards to hand materially preserves the attacker/energy package. |
| Guzma | Spend the Supporter slot when the gust/switch changes the Prize map or creates a decisive target; account for Supporter contention. |
| VS Seeker (2) | Reuse the Supporter whose condition and timing are currently live; preserve the last copy if it is the only route to a matchup-critical Supporter. |
| Float Stone | Latias ex gives Basic Pokémon no Retreat Cost, not VMAX. Float Stone remains important for a VMAX or other non-Basic pivot when needed. |
| Sky Field | Play when the expanded Bench materially improves Full Moon Rondo or engine capacity; do not expose it early if the Bench is not ready. |
| Dimension Valley | Play when the one-Colorless reduction changes a Psychic attack breakpoint/turn; it does not reduce Dialga's Dragon attacks. |
| Tapu Lele-GX | Wonder Tag is a high-value Supporter access trigger when live; do not count it as unconditional under Ability lock. Its GX attack competes with the Regidrago Timeless-GX line. |

## Discard policy for search effects

For Mysterious Treasure, Quick Ball and Battle Compressor, select discard targets by current DCI rather than card type:

- First check K0/K1 Prize uncertainty and whether the card is a singleton whose effect is not yet used.
- Preserve matchup-critical ALS payloads (Dialga vs Regidrago; Mimikyu if Copycat is live).
- Preserve Unfair Stamp, unspent Forest Seal Stone, relevant one-of Supporters/techs and required V/VMAX targets.
- Preserve enough Psychic Energy to fuel Underworld Door and the next attack; excess Energy becomes more discardable when recovery/attachment lines are secured.
- Duplicate VMAX can become discardable only after the desired VMAX board is established and remaining deck/prize counts show no further need.
- Use Battle Compressor when the three discarded cards have a plan (e.g. Dialga payload plus recoverable resources), not as generic thinning.
- Night Stretcher can recover Pokémon or Basic Energy, but recovering Dialga from discard can break the Regidrago line; model the lost payload value before using it.

## Policy evaluation requirements

Any implementation derived from this note should be evaluated against at least:

1. Regidrago lists with and without an Apex Dragon last-turn opportunity.
2. Ability-lock matchups where Tapu Lele Wonder Tag is suppressed and Hood protection is contested by Tool removal.
3. Matchups where Girafarig, Marshadow, Mimikyu, Ranger or Field Blower are dead/low-value.
4. Bench-constrained states and turns where Radiant Eternatus ends the turn.
5. K0 vs K1 states, including prized Dialga/Mimikyu and the use of Hisuian Heavy Ball.

Report action legality, policy decisions, failures and full-game outcomes by opponent. This specification is a heuristic starting point, not a validated playing policy or win-rate result.
