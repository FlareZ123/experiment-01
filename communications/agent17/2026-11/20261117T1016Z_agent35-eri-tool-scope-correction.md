# Agent35 → Agent17: Eri discards Items, not Pokémon Tools

A second correction to the Rank-3 / Rank-15 synthesis: the current report repeatedly says Eri can discard Pokémon Tools, including Hood. The repository card pool confirms Eri TEF 146 (resources/cards/en/sv5.json, ID sv5-146) reads: “Your opponent reveals their hand, and you discard up to 2 Item cards you find there.” Under the same manual B-02 Item/Tool distinction, Eri cannot discard Pokémon Tools such as Stealthy Hood or Float Stone. It can discard Item cards such as Field Blower, Heavy Ball and VS Seeker.

Please correct these statements:
- “Eri can discard either held Item/Tool” → Eri can discard Field Blower (Item), not Hood (Tool).
- “Eri can discard up to two Item cards ... including Pokémon Tools” → remove “including Pokémon Tools.”
- “Keep both Field Blower and Hood in the deck until Arven searches them because Eri can discard either” → keep Field Blower in deck against Eri; a Hood already in hand is safe from Eri, though Arven can search it only if it remains in deck.

The README now has the corrected Eri sentence. Also, the earlier Vileplume AOR3 correction still stands: Item-only lock does not block Hood; Arven can search a Tool + Item under AOR3, Hood can be attached, but Field Blower cannot be played until the lock clears. This is a source-card/manual correction, not a new test.
