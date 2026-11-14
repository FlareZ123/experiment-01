# Agent46: exact rank19 turn-27 alternate KO line — Full Moon Rondo vs Max Geist

I downloaded and inspected the preserved 58-group artifact `agent3-hood-vs-shadow-all29-native` (run 42578010606, artifact 13656062292). This is a concrete deterministic fixture for the worker's attack-comparison tests.

For `hood-shield-v1`, rank19, repeat7002, candidate seat1, the final candidate attack is Max Geist at action ordinal150 / turn27. The artifact's public board immediately before it shows:

- Opponent Active: Raging Bolt ex TEF, Dragon type, 240 HP, 0 damage.
- Opponent Bench: Latias ex, Flutter Mane, Marshadow, Sudowoodo (4).
- Candidate Active: Shadow Rider Calyrex VMAX with 5 Basic Psychic Energy.
- Candidate Bench: Dialga-GX (0 Energy), Mimikyu (1 Basic Psychic), Latias ex (0 Energy), Lillie's Clefairy ex JTG (2 Basic Psychic) (4).
- No Stadium in play.
- Prizes 6–6 before, 6–4 after the Max Geist KO.

Thus Max Geist counts **six** owner-board Psychic Energy (5 on VMAX + 1 on Mimikyu), not merely the five attached to VMAX: 10+30×6 = 190 nominal; Fairy Zone makes the Dragon target Psychic-weakness ×2, so 380 and a KO.

There is a second publicly apparent KO line at that exact state:
- Full Moon Rondo sees B=8 actual Benched Pokémon across both sides, so 20+20×8 = 180 nominal; live Fairy Zone doubles this to 360, also enough to KO the 240-HP Raging Bolt ex.
- Clefairy has two Psychic Energy and its cost is Psychic + Colorless, so the attack is payable.
- Candidate Latias ex is on the Bench; Skyliner grants the Basic Active Mimikyu free retreat, so Clefairy can become Active without paying away the Mimikyu Energy.
- No Stadium or known Ability lock appears in the public board; the opponent's Flutter Mane is Benched, not Active.

Both attacks take the same two Prizes, but the Rondo line attacks with a **two-Prize Clefairy ex** rather than exposing a **three-Prize Shadow Rider VMAX**. This is not proof of a game win or a strict optimal choice—the artifact is not fully competitive-qualified and the live Store must validate the line—but it is a strong deterministic policy test case. It also demonstrates why the worker must compare Max Geist, Rondo, and prize liability rather than hard-code the first KO.

Caveats:
- The artifact's "5 Energy" description refers to VMAX attachments; total Max Geist scaling is 6 including Mimikyu.
- The earlier 12 Filch attacks remain descriptive; this turn27 alternative is a separate comparison.
- The exact public-board state is sufficient for the damage arithmetic; the host must still validate Skyliner, Fairy Zone liveness, attack cost, and typed actions through the live Store.
