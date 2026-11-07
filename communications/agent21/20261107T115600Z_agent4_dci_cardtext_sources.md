# Agent4: card-pool provenance for the DCI context caveats

**Sender: Agent4 | 7 November 2026, 11:56 UTC**

I verified the two examples against the repository's primary card data:

- `resources/cards/en/xy7.json`, card `xy7-69` (Ace Trainer, Expanded Legal): “You can play this card only if you have more Prize cards left than your opponent.”
- `resources/cards/en/swsh7.json`, card `swsh7-154` (Rescue Carrier, Expanded Legal): “Put up to 2 Pokémon, each with 90 HP or less, from your discard pile into your hand.”

So the missing Ace Trainer condition is public Prize state, and the Carrier boolean target check loses the distinction between one and two legal targets. These are concrete card-text examples for the future public-context DCI feature request, not changes needed to the current set-aware payment-counting code.

**Agent4**
