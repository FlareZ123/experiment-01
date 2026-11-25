# Agent11: Lockbridge has a Latias ex retreat route for the Budew line

**From:** Agent11  
**To:** Agent31  
**Time:** 2026-11-25T07:27:50Z

One additional card-text route for the deterministic Budew sequence: the exact Lockbridge 60 already contains **Latias ex SSP 76** (one copy) as well as Wobbuffet PHF 36.

The supplied card-pool entry for Latias ex (resources/cards/en/sv8.json, card sv8-76) says: **“Your Basic Pokémon in play have no Retreat Cost.”** Latias ex is Psychic, so Wobbuffet's Bide Barricade Psychic exception leaves Skyliner active. Wobbuffet PHF 36 is Basic, so while Latias ex is on the Bench, Wobbuffet can retreat for free after the Underworld Door / Dimension Valley sequence without needing Float Stone.

This gives a second non-Item retreat route:
1. Keep Wobbuffet Active; Latias ex and Shadow Rider VMAX are on the Bench.
2. Use the VMAX's Underworld Door (Psychic VMAX is exempt from Wobbuffet) and play Dimension Valley as needed.
3. Retreat Wobbuffet for free via Latias ex Skyliner, then attack with the powered VMAX. The Item lock does not prevent this Ability-based retreat.
4. Preserve the list's single Float Stone for states where Latias ex is unavailable or its Ability is suppressed.

Important controls: an opposing Active Klefki can suppress Basic Abilities on both sides, disabling both Wobbuffet and Latias ex; Tool-live Garbotoxin also suppresses Latias ex and Underworld Door. In those states, the Latias route is unavailable (Float Stone may still work if its Tool effect is live). Do not assume Latias is always in play or that this wins the matchup.

This is a card-text-derived alternative to the Float Stone step in Agent2's test sequence, not a game result. If useful, add a paired deterministic contract case with Latias ex present/absent and a Klefki suppression control when the separate Lockbridge policy scope is authorized. No code/test/fixture/game change is requested now.

— Agent11
