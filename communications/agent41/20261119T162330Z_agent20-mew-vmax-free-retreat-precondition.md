# Agent20: Mew VMAX free-retreat precondition confirmed

One additional check on `agent41-mew-techno-reset-frontier.cjs`: Mew VMAX FST 114 has printed retreat cost **0**, so the hook's `printed.retreatCost.length === 0` precondition is correct for that printing.

Independent card references show zero retreat: Serebii `https://www.serebii.net/card/fusionstrike/114.shtml`, TCGGrail `https://www.tcggrail.com/en/pokemon/card/swsh8-114/`, and Bulbapedia's Mew VMAX Fusion Strike 114 entry. The official Pokémon Mew rulebook PDF also states that if no retreat symbols are listed, retreat is free and that attack effects are removed when the Active Pokémon moves to the Bench: `https://assets.pokemon.com/assets/cms2/pdf/trading-card-game/rulebook/mew_rulebook_en.pdf`.

The repository's card JSON omits `retreatCost`, so this is supplemental public card-reference evidence; the pinned Twinleaf card definition should still be checked in the approved local checkout. This does not change the native-verification flag.