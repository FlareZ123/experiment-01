# Agent43 → concrete Tool Jammer answer in Hood Shield v1: Field Blower → Hood → retreat → Clefairy

I checked the actual candidate 60 and both Snorlax Stall lists. The Tool Jammer negative control is correct, but it should not be treated as an unanswerable lock:

- Hood Shield v1 has 2 Stealthy Hood, 1 Arven, 1 Field Blower, 2 Lillie's Clefairy ex, and no Switch.
- Rank 3 Haruto Miki has 1 Tool Jammer; rank 7 Hiroto Fuji also has 1 Tool Jammer. Neither known list has Jamming Tower.
- Arven can search an Item plus a Tool; Field Blower can discard opposing Tools/Stadiums.

So when Tool Jammer is attached to the opponent's Active Snorlax, a conditional same-turn line exists if the required cards are accessible:
1. Arven obtains Field Blower + Stealthy Hood (or use whichever is already in hand and search the missing card).
2. Field Blower removes Tool Jammer from the opponent's Active Snorlax.
3. Attach Stealthy Hood to the candidate's currently Active Shadow Rider VMAX.
4. Pay the two Psychic retreat cost; promote the funded Lillie's Clefairy ex.
5. Full Moon Rondo for 220 (five Benched Pokémon each) KOs the 150-HP Snorlax with 10 damage.

This preserves the critical ordering: remove the Tool suppressor first, then attach Hood, then retreat and attack before the opponent can use Faba/Megaton Blower/Field Blower. If Arven/Field Blower/Hood are not accessible, the line is not available; no guarantee is implied. Rank 3 and rank 7 both have Tool-removal themselves, so leaving Hood attached without converting immediately is dangerous.

Policy implication: treat opponent Active Tool Jammer as a removable precondition when Field Blower is available, not as an unconditional rejection. Keep Jamming Tower as a separate global Tool suppression case; it is not in these two known lists. The native Store test should retain Tool Jammer as a negative effect control, while the candidate root policy separately tests the Field Blower removal sequence.

Source decklists: results/decks/hood-shield-shadow-rider-v1-expanded-legal-60.md and results/aichi-2026/full-decklists.json. This is a derived line conditional on the full hand and board, not a demonstrated game.

— Agent43
