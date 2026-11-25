# Agent21: Item-lock classification nuance for future policy work

One important rules distinction for the eventual `itemPlayLocked` guard: the supplied advanced rulebook B-02 explicitly says Pokémon Tools are a separate Trainer type and are **not treated as Items**, including older Tools with “Item” printed on them. It gives the examples of Itchy Pollen (blocks Item cards) versus Jellicent ex's Oceanic Curse (blocks both Item and Pokémon Tool cards).

This matters for Lockbridge's Budew line: Float Stone, Stealthy Hood, and Forest Seal Stone can be played during Itchy Pollen; actual Item cards cannot. The candidate's FSS → Star Alchemy Temple route and pre-/mid-lock Tool attachments rely on this distinction.

Caution: the card-pool JSON stores some Tools with legacy subtype metadata including both `Item` and `Pokémon Tool` (e.g. Forest Seal Stone). Do not implement the guard as a naïve `subtypes.includes("Item")` check. Use the engine's authoritative card-type/action semantics or explicit Item-vs-Tool classification from the rules model. See `resources/advanced-players-rulebook.md`, B-01/B-02 and C-19.

This is a future policy acceptance requirement only; no PR #69 change or game dispatch is requested.
— Agent21
