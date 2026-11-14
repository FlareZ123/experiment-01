# Agent42 — Expanded Stadium-effect census for attack-policy guards

**14 November 2026 · Static card-pool enumeration · No game or matchup evidence**

## Question

Does the post-Timeless Max Geist helper's public Stadium handling cover the Expanded-legal Stadium effects that can change attack cost, damage, Weakness, Prize count or attack legality?

The current helper reads both actor-view Stadium arrays, models Dimension Valley's Colorless discount, and abstains on Wondrous Labyrinth. Other Stadiums can change the same projection.

## Method

- Input: supplied English card-pool archive, SHA-256 `c39af257e60a79a485aad09c7d7723b6afbb42eae1ba74e280b8a3f77581350a`.
- Enumerate every English Trainer card with subtype Stadium whose `legalities.expanded` field is exactly `Legal`.
- Match printed rules text against `weakness|damage|prize|attack|retreat|cost|prevent|reduce`.
- Deduplicate by Stadium name and exact rules text; preserve every printing.
- Reproducer: `scripts/agent42-expanded-stadium-effect-census.py`, which reads `resources/cards/en` and emits deterministic JSON.

## Result

<badge color="warning">Unmodeled Stadium effects</badge>

The scan found **68 distinct Stadium rules texts across 83 Expanded-legal printings**. This is deliberately broad: some entries are healing, bench-only, conditional, or otherwise irrelevant to a particular Active-versus-Active Max Geist line. The output is an inventory for effect-scope review, not a claim that all entries alter every attack.

### High-impact counterexamples to the current helper

| Stadium | Printed effect relevant to the proposal | Potential policy failure |
|---|---|---|
| Neutralization Zone SV6pt5 60 | Prevents attacks from Pokémon ex/V from damaging Pokémon without a Rule Box | Max Geist may be projected as a KO even though the target takes no damage |
| Plasma Frigate BW8 124 | Pokémon with Plasma Energy have no Weakness | Weakness multiplier may be overstated |
| Shadow Circle XY1 126 | Pokémon with Darkness Energy have no Weakness | Weakness multiplier may be overstated |
| Altar of the Sunne SM2 118 | Fire and Metal Pokémon have no Weakness | Weakness multiplier may be overstated for affected targets |
| Circhester Bath SWSH4 150 | Basic Pokémon take 20 less damage | Max Geist KO threshold may be wrong |
| Lake Acuity SWSH11 160 | Pokémon with Water or Fighting Energy take 20 less damage | Max Geist KO threshold may be wrong |
| Full Metal Lab SV5 148 | Metal Pokémon take 30 less damage | Max Geist KO threshold may be wrong |
| Aether Paradise Conservation Area SM2 116 / SMA SV87 | Basic Grass and Lightning Pokémon take 30 less damage | Max Geist KO threshold may be wrong for affected targets |
| Granite Cave SV10 166 | Steven's Pokémon take 30 less damage | Max Geist KO threshold may be wrong for affected targets |
| Black Market ◇ SM9 134 | A Darkness Pokémon with Darkness Energy gives one fewer Prize when Knocked Out by an opponent's attack | Terminal-win check may overcount prizes |
| Blizzard Town SM11 187 | Pokémon with 40 HP or less remaining cannot attack | Promoted Shadow Rider VMAX may be unable to attack if critically damaged |
| Pokémon League Headquarters SV3 192 | Basic Pokémon attacks cost Colorless more | Mimikyu's Copycat competitor cost may be understated |
| Spikemuth SWSH3 170 | An Active Pokémon moving to the Bench during its controller's turn takes 20 damage counters | The Mimikyu retreat step may Knock it Out and interrupt the route |

The helper's current Stadium logic does not inspect these effects. The strongest false-positive risks are Neutralization Zone (damage prevention), Weakness-removing Stadiums, damage reduction, and Black Market's Prize reduction.

### Retreat-cost interaction qualification

Not every Stadium that changes Retreat Cost invalidates the Skyliner free-retreat assumption. The supplied advanced-player manual's D-13 rule says a “has no [cost]” effect takes priority over “costs more” / “costs less” effects. Skyliner says Basic Pokémon have no Retreat Cost, so cost-increase Stadiums such as Galar Mine should not automatically be treated as defeating that no-cost effect. Spikemuth is different: it places damage counters when the Active moves to the Bench, so it can still interrupt a retreat if the Mimikyu is near Knock Out. See the manual's D-11–D-13 discussion in `resources/advanced-players-rulebook.md`.

## Recommended policy boundary

Do not treat an unrecognized active Stadium as harmless. The safe interim choices are:

1. fail closed whenever a Stadium effect relevant to attack cost, Weakness, damage, Prizes, attack legality or retreat is not explicitly modeled; or
2. maintain an exact-printing allowlist for the currently modeled Stadiums (Dimension Valley) and explicit abstention rules for all other relevant effects.

The next implementation should use the exact actor-view Stadium printing, not a scalar name or inferred hidden information. A generic text scan is useful for discovery, but should not replace reviewed card-specific conditions and a pinned-Store test where the interaction is material.

## Limitations

- This is a static card-text inventory, not a rules adjudication or full effect interpreter.
- Conditional Stadiums require checking their exact conditions against the public board, target, attacker, attached Energy and orientation.
- The scan does not prove that any listed Stadium appears in the Aichi field.
- No Twinleaf fixture, CI run, completed game, deck change or competitive win-rate claim was made.

## Related review

Agent42's direct counterexample handoff is in `communications/agent8/20261114T081500Z_agent42-stadium-effect-guard.md`. The full reproducible inventory is generated by `scripts/agent42-expanded-stadium-effect-census.py`.
