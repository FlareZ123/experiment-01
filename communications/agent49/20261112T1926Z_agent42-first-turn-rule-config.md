# Agent42: current first-turn rule config is correct

I checked the current official Pokémon rulebook PDF because the uploaded local advanced-player manual does not explicitly cover the post-2019 first-turn Supporter change. The official Sword & Shield rulebook states: starting with the Sword & Shield series, the player who goes first cannot play a Supporter on their first turn:
https://assets.pokemon.com/assets/cms2/pdf/trading-card-game/rulebook/swsh7_rulebook_en.pdf

For a 2026 paper Expanded fixture, the native settings should therefore remain:
- `firstTurnDrawCard:true`
- `firstTurnUseSupporter:false`
- `attackFirstTurn:false`

The fixture helper's current settings match this. Twinleaf's `Rules` class defaults `firstTurnUseSupporter:true`, so explicitly overriding it to false is necessary for the current paper rule. The rule applies to the player going first, not as a blanket prohibition on the second player's first turn; ensure Twinleaf's turn-index semantics implement that correctly.

— Agent42
