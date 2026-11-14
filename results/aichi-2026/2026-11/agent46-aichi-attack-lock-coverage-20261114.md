# Aichi Top32: Ability-based attack restrictions in the 29 complete lists

**Status:** static card-text/source-list coverage audit. No matchup result or win-rate claim.

## Question

Which Expanded-legal Pokémon Abilities that explicitly prevent attacks occur in the 29 authenticated Aichi Open League 2026 Top32 lists, and do they affect the candidate's Mimikyu Copycat versus Shadow Rider Max Geist routes differently?

## Method

- Input field: `results/aichi-2026/full-decklists.json` (29 complete 60-card lists).
- Input card pool: supplied BW+ English card list, filtered to `legalities.expanded == "Legal"`.
- Scanned Ability text for explicit attack prohibitions such as “this Pokémon can't attack”, “your opponent's Basic Pokémon can't attack”, and “can't attack unless”.
- Matched exact card names and printings against the 29 decklists. This is a targeted text scan, not a complete rules engine or a census of attack restrictions printed on attacks, Trainers, Tools, Stadiums, or nonstandard wording.

## Field result

Only Vileplume appears among the scanned Ability-based attack restrictions:

| Rank | Player | Archetype | Printing | Count | Ability |
|---:|---|---|---|---:|---|
| 15 | Ryotaro Nozawa | Lopunny Vileplume | Vileplume BUS 6 (`sm3-6`) | 1 | Disgusting Pollen |

Vileplume BUS 6 says: “As long as this Pokémon is your Active Pokémon, your opponent's Basic Pokémon can't attack.”

Rank2 Takahiro Ando's Vileplume Control list has Vileplume AOR 3 (`xy7-3`) ×2, whose Ability is Irritating Pollen (Item lock), not an attack restriction. Rank15 also has Vileplume AOR 3 ×2, but the attack restriction is specifically the additional BUS 6 printing.

The BW+ Expanded pool contains other Ability attack restrictions (including Slowbro BW5 Airhead, Slaking BW6 Unobservant, Latios-GX SM11 Power Bind, Ultra Necrozma SM12 Ultra Burst, Regigigas SM4 Seal of Antiquity, Vanilluxe SV4 Frigid Room, Slaking V / Slaking ex, and Team Rocket's Mewtwo ex), but none of those printings appears in the 29 complete Aichi lists.

## Candidate-policy consequence

The BUS 6 effect is conditional on Vileplume being Active and applies only to the opponent's **Basic Pokémon**:
- Mimikyu GRI 58 is Basic, so it cannot use Copycat while Vileplume BUS 6 is Active.
- Shadow Rider Calyrex VMAX is not Basic, so it is not blocked by this Ability and can still use Max Geist, subject to its own attack cost and other effects.

Therefore a post-Timeless evaluator must check Copycat legality against the opponent's Active Ability and the actual attacker class. It must not treat Copycat → Power Beam as an available competitor when BUS 6 is Active, but it must not apply a generic “can't attack” veto to the VMAX route. If BUS 6 is Benched, the printed Active-Spot condition is not met.

This is a source-level legality distinction. The source list does not establish that Vileplume BUS 6 was Active in any actual game, nor that the opponent used it successfully.

## Limitations

- Three Top32 lists (ranks 23, 25 and 28) remain missing; their attack-lock cards are unknown.
- The event is Japanese Extra, not a uniformly paper-Expanded-legal field. Existing scope audit identifies ranks 3, 6, 7, 24 and 29 as Extra-only incompatible.
- The scan is Ability-only and text-pattern-based. Other effects may prevent or alter attacks; native Store remains final legality authority.

## Reproduction

Compare `results/aichi-2026/full-decklists.json` against the Expanded-legal Ability text in the supplied card pool. Exact BUS 6 printing is `sm3-6`; AOR 3 is `xy7-3`. Do not collapse Vileplume by Pokémon name alone.
