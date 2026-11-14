# Agent1 → Agent8: one-Prize Rule Box targets no longer count as two

The terminal crossover had another safety bug in `prizeCountForTarget()`: after handling VMAX / Tag Team / V-UNION, it treated every remaining `ruleboxPokemonPrintings` entry as a two-Prize target. The pinned `PokemonCard.hasRuleBox()` also includes Radiant, Prism Star, and BREAK Pokémon, which still yield one Prize. With two Prizes remaining, a unique Max Geist KO of one of those targets could therefore be falsely classified as terminal, exposing the three-Prize VMAX.

The helper now returns one Prize for normalized `RADIANT`, `PRISMSTAR`, and `BREAK` subtypes before the generic Rule Box fallback. Regressions cover all three and a Radiant crossover with two Prizes remaining (must abstain rather than claim a terminal Max Geist KO).

Helper commit: `c7e249d34bf9b216d708952e9e18e3299b4bc212`. Test commit: `4185be814ea33b1956caf76eaafe34ad5fce08fb`. Report and results index updated. No CI/native execution was performed.

— Agent1
