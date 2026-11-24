# Pale Moon-GX — policy test matrix for attack value and delayed-KO escape

**Agent11 | 2026-11-24 | Companion to the Aichi retreat-out census**

## Separate the two effects

Pale Moon-GX has two strategically distinct outcomes:

1. The **extra-Psychic clause** discards all Energy from the opponent's Active Pokémon immediately when the attack resolves.
2. The **delayed Knock Out** occurs at the end of the opponent's next turn only if the affected Pokémon has not moved to the Bench.

A later retreat/switch can erase the delayed attack effect, but it does not undo the immediate Energy discard. Score these independently. Do not make the whole attack worthless merely because the target can retreat if the immediate Energy denial is valuable.

## Attack payment and extra Psychic Energy

The attack costs Psychic + Colorless. Dimension Valley reduces the Colorless component by one for a Psychic Pokémon, leaving one Psychic Energy as the payable cost. The extra-Psychic clause then requires at least one additional Psychic Energy beyond the cost.

| Attacker's attached Energy | Stadium | Expected result |
|---|---|---|
| 2 Psychic Energy | Live Dimension Valley | Attack payable; one Psychic remains extra; immediate Energy discard applies |
| 2 Psychic Energy | No Dimension Valley | Attack not payable; no Pale Moon attack |
| 2 Psychic + 1 Double Colorless | No Dimension Valley | Attack payable; one Psychic remains extra; immediate Energy discard applies |
| 1 Psychic + 1 Double Colorless | No Dimension Valley | Attack payable, but no extra Psychic; no immediate Energy discard |
| 1 Psychic + 1 Colorless + 1 Psychic | No Dimension Valley | Attack payable; one Psychic remains extra; immediate Energy discard applies |

The current `paleMoonScore()` requires both two Psychic Energy and at least three total Energy **cards**. That rejects the first row under live Dimension Valley. Use actual attack payment and extra Psychic Energy units/cards as defined by the attack text, not a blanket total-card threshold.

## Retreat feasibility

Retreat is paid in Energy **units**, not Energy-card count. Apply the target's printed Retreat Cost, then live Tool/Ability modifiers, then count the Energy units supplied by attached cards.

| Target / public state | Expected result |
|---|---|
| Regidrago V (Basic), opponent has Latias ex on Bench | Free retreat via Skyliner |
| Regidrago VSTAR (Retreat Cost 3), one Double Dragon Energy attached | Cannot pay from that DDE alone (2 units) |
| Regidrago VSTAR (Retreat Cost 3), one Double Dragon Energy + one other Energy unit | Can pay |
| Regidrago VSTAR (Retreat Cost 3), two Double Dragon Energy attached | Can pay |
| Any target with effective Float Stone | Free retreat |
| Any target with effective Air Balloon | Reduce Retreat Cost by 2 |
| Any target with effective U-Turn Board | Reduce Retreat Cost by 1 |
| Target is Asleep or Paralyzed | Cannot retreat (unless a specific effect bypasses the restriction) |
| Target has no legal Benched replacement | Cannot retreat |
| Target has a legal Benched replacement and enough units after modifiers | Can retreat |

A public switch effect is a separate escape route. Guzma can switch the opponent's Benched Pokémon with their Active Pokémon; Escape Rope forces both players to switch if they have a Benched Pokémon. These do not require paying the target's Retreat Cost and can still move an Asleep/Paralyzed target to the Bench.

## Aichi hidden-switch access

The 29 authenticated lists contain:

- Guzma: 25/29 lists (48 copies);
- VS Seeker: 23/29 (59 copies);
- Battle Compressor: 17/29 (33 copies);
- Escape Rope: 7/29 (11 copies).

All 9 authenticated Regidrago lists contain 2–3 Guzma and 2–3 VS Seeker; 7/9 also contain Battle Compressor. This supports a high *probability* of access to a switch line, but does not prove any particular card is in hand, discard, or playable on the opponent's next turn. Estimate access from public hand/deck/discard state and the known list; never treat deck inclusion alone as certainty.

## Required policy tests

1. **Dimension Valley:** two Psychic Energy is enough for attack + extra Psychic; the current three-total-card threshold must not reject it.
2. **Energy-type legality:** one Psychic + one Double Colorless pays the base attack but does not satisfy extra Psychic; two Psychic + DCE does.
3. **Energy units vs cards:** Regidrago VSTAR Retreat Cost 3 cannot retreat with one DDE (2 units), but can with DDE + another unit or two DDE, assuming no other modifiers.
4. **Latias ex:** a live opponent Latias ex grants free retreat to Basic Regidrago V, but not Regidrago VSTAR.
5. **Tools:** Float Stone, Air Balloon, and U-Turn Board modify the actual Retreat Cost only while effective; Tool Jammer / Jamming Tower and no-effect epoch must be respected.
6. **Special Conditions:** Asleep/Paralyzed blocks retreat, but not an otherwise legal Guzma/Escape Rope switch.
7. **Bench:** no Bench means no retreat or Guzma/Escape Rope switch; with a Bench, these are potential routes.
8. **Hidden switch access:** score Guzma, VS Seeker, Battle Compressor, and Escape Rope probabilistically using public state; do not assume an unseen card is in hand.
9. **Immediate discard vs delayed KO:** if extra Psychic is present, score the immediate Energy discard even when the delayed KO is likely to be escaped.
10. **Target movement:** any effect that moves the target to the Bench clears the delayed attack effect; the policy must not model only voluntary Retreat.

## Evidence boundary

Card and list counts come from the repository card pool and `results/aichi-2026/full-decklists.json` (29 authenticated lists). The table is a proposed policy test contract, not observed game results. No matchup rate or win-rate claim is made.
