# Mimikyu Copycat → Regidrago Apex Dragon → Dialga-GX Timeless-GX line

**Finding:** the human-concepts counter-ALS is rules-legal for the exact Hood Shield Shadow Rider v1 printings, with a critical GX-marker sequencing constraint. This is a rules/card-text result, not a matchup-performance result.

## Exact card identities

The current 60-card export contains:
- Mimikyu **GRI 58** (sm2-58), Copycat costs Psychic + Colorless and says: if the opponent's Pokémon used a non-GX attack during its last turn, use it as this attack.
- Dialga-GX **UPR 100** (sm5-100), a **Dragon-type** Pokémon-GX with Timeless-GX.
- The opposing Regidrago VSTAR (swsh12-136) uses Apex Dragon, which chooses an attack from a Dragon Pokémon in its controller's discard pile and uses it as Apex Dragon.

Exact candidate list: results/decks/hood-shield-shadow-rider-v1-expanded-legal-60.md.

**Printing matters:** the bundled card pool also contains Dialga-GX prints from SM6 that are Metal-type. Do not substitute those for UPR 100 in this line; Apex Dragon requires the discarded Pokémon to be Dragon-type. UPR 100 / card-pool ID sm5-100 is Dragon-type.

## Rules resolution

1. If Regidrago used Apex Dragon last turn, Mimikyu's Copycat condition is met: Apex Dragon is not a GX attack. Copycat cannot copy a GX attack directly, but it can copy Apex Dragon.
2. Mimikyu pays only its own printed Copycat cost (Psychic + Colorless). The TPCi Rules Team ruling quoted in the Team Up FAQ says Mimikyu Copycat does **not** need the same Energy as the opponent's copied attack; only Mimikyu's own attack cost is required. This is the specific Copycat ruling, so do not misapply the advanced manual's separate Ditto Copy Anything example to Mimikyu.
3. The copied Apex Dragon effect refers to the copying player's discard pile. If Dialga-GX UPR 100 is there, it is a Dragon Pokémon and Timeless-GX is a legal attack to choose. Apex Dragon then uses Timeless-GX as its attack effect; the copied Timeless-GX attack cost is not separately paid.
4. Timeless-GX consumes the player's one GX attack for the game. The official Pokémon rulebook states that a player cannot use more than one GX attack in an entire game. Therefore, do not spend the GX attack earlier on Trevenant & Dusknoir-GX's Night Watch-GX if preserving this line is the plan.

## Conditions and strategic implications

The line requires all of:
- opponent used Apex Dragon (or another non-GX attack) on the immediately previous turn;
- Mimikyu GRI 58 is Active and has Psychic + Colorless attached (two Psychic Energy in this list can pay);
- Dialga-GX UPR 100 is in the player's discard pile;
- the player's GX attack marker is unused.

This validates the human-concepts hypothesis for the exact v1 printings. It does **not** show that the line is reliably assembled, that Regidrago is a favorable matchup, or that the candidate is competitive overall. The single Dialga-GX and Mimikyu are dead/low-value slots in matchups where the opponent does not present a copyable Apex Dragon line; evaluate their opportunity cost and setup probability in actual game traces.

## Sources

- Bundled card snapshot: cards/en/sm2.json (Mimikyu sm2-58), cards/en/sm5.json (Dialga-GX sm5-100), cards/en/swsh12.json (Regidrago VSTAR swsh12-136).
- TPCi Rules Team ruling quoted in the Team Up FAQ: https://www.pokebeach.com/forums/threads/team-up-rulings.149390/ — Mimikyu Copycat needs only the Energy required for Mimikyu's own Copycat attack.
- Official Pokémon rulebook, GX appendix: https://assets.pokemon.com/assets/cms2/pdf/trading-card-game/rulebook/pal_rulebook_en.pdf — one GX attack per player per game.
- The advanced player's manual D-09 example for Ditto Copy Anything is a different copy effect; use the Mimikyu-specific ruling above for this card.
