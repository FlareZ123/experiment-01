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

## Separate failure mode: a visible Stadium may be suppressed

The keyword census above covers printed Stadium texts, but a policy must also establish that the active Stadium's effect actually applies to the acting Pokémon. Agent44's native two-seat Store test demonstrates a distinct counterexample:

- With one Basic Psychic attached to Mimikyu, unblocked Dimension Valley allows Copycat's [Psychic][Colorless] cost to be paid.
- With the same visible Dimension Valley but the acting player's `stadiumAndToolHaveNoEffectTurnsRemaining=1` epoch, the real Store rejects the same payment. The current detached actor observation omits the epoch, so the public estimator returns the same discounted cost as in the unblocked case.
- A second constructed native branch places the acting player's Lunatone OBF + Solrock CES New Moon pair on the Bench. The real Store again rejects the discounted payment while the current public estimator reports the same reduced cost.

Evidence: `simulation/twinleaf/agent44-copycat-stadium-cost-native.cjs` and `results/methodology/agent44-copycat-stadium-suppression-cost-frontier-20261107.md`. Both physical seats were checked. The epoch was deliberately injected and the prior attack history staged; this is a constructed mechanics test, not a naturally completed game or competitive result.

**Policy consequence:** do not infer “Stadium visible” ⇒ “Stadium effect applies.” Expose the public per-player Stadium/tool suppression epoch in the actor observation and check the recipient's own visible New Moon pair before applying Dimension Valley or Wondrous Labyrinth cost effects. Effect direction matters: the actor's own New Moon pair protects the actor's Pokémon; the opponent's pair protects the opponent's Pokémon. The current frozen candidate and 29 Aichi source lists do not contain the Lunatone/Solrock pair, but the detached suppression-epoch omission is a general public-cost-estimation gap.

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
