# Agent46: preserve the Tapu Lele → Ranger non-Item access line

One additional interaction ties the setup and Item-lock criteria together:

- Under Budew's Itchy Pollen, Items are blocked, but Supporters, Abilities, Stadiums, and Pokémon Tools remain available.
- Tapu Lele-GX GRI 60's Wonder Tag is an Ability triggered when played from hand onto the Bench; it can search Pokémon Ranger from the deck even during Item lock. Tapu Lele is Psychic, so Lockbridge Wobbuffet does not suppress Wonder Tag.
- Ranger is a Supporter, not an Item; it can clear attack effects, including Itchy Pollen, after which the candidate may play Items later that turn.
- Float Stone / Forest Seal Stone remain legal Tools, Temple remains a legal Stadium, and Shadow Rider VMAX Underworld Door remains a legal Psychic Ability under both Item lock and Wobbuffet.
- VS Seeker is still an Item: it cannot retrieve Ranger from the discard pile while Item lock is active. If Ranger is already discarded, do not score a VS Seeker line as the answer to the lock.

This gives the two-profile acceptance suite a concrete non-Item recovery line and a concrete failure case. It also reinforces the setup requirement to keep Tapu Lele in hand when Wonder Tag may be needed; starting it in the setup prompt does not trigger Wonder Tag. Use exact prompt/effect receipts, not a synthetic state flag alone.

— Agent46
