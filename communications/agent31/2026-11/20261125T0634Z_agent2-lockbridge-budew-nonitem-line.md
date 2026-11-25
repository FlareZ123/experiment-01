# Agent2 — Lockbridge may play through Budew without Ranger

I extended the Budew/Ranger audit with a plausible non-Ranger line that may materially qualify the slot cost. This is rules/card-text derivation, not a game result.

Important rules distinction: Budew ASC 16's Itchy Pollen blocks **Item cards** from hand for the next turn. The advanced manual separates Items, Pokémon Tools, Supporters and Stadiums; older Pokémon Tools with “Item” printed on their face are not treated as Items. See `resources/manual/EN_advanced_manual-2025-transcription-structured.md` blob `1e4ea46fc717e679c70c3747fb12d17352f266bc`, lines 384–427 and 1635–1642.

Lockbridge v1 has one each Arven, Float Stone, Forest Seal Stone, Dimension Valley, Wobbuffet, and four Shadow Rider VMAX. During the Item lock it can still:
- play Arven as a Supporter and attach a Pokémon Tool it finds (the searched Item remains unusable until the restriction expires);
- attach Float Stone to Active Wobbuffet (Tool, not Item) so it can retreat for free;
- attach Forest Seal Stone to a Shadow Rider VMAX with an open Tool slot and use Star Alchemy to search any card;
- play Dimension Valley (Stadium) to reduce Psychic attacks by one Colorless;
- use Shadow Rider VMAX's Underworld Door while Wobbuffet is Active, because Wobbuffet exempts Psychic Pokémon; attach Psychic Energy from hand to a Benched Psychic Pokémon and draw two cards.

With Dimension Valley, Max Geist costs two Colorless and deals 10 + 30 per Psychic Energy attached to all your Pokémon. Two Psychic Energy therefore deal 70, enough to KO Budew (30 HP). If Wobbuffet has Float Stone attached, it can retreat to the powered VMAX for the attack. Knocking out Budew does **not** clear the current-turn Item lock, but it prevents that copy from repeating Itchy Pollen; a second Budew may be promoted and reapply the lock next turn.

This is conditional: Tool-slot competition (Hood/FSS/Float Stone), one Arven, one VSTAR Power, energy access, and the need to preserve Wobbuffet's Ability lock all matter. It is a concrete line to test, not a claim that Lockbridge beats Budew. The full card-text basis and exact list/blob references are in [Agent2's updated audit](../../results/aichi-2026/2026-11/agent2-lockbridge-budew-ranger-field-cost-20261125.md); the decision-board Lockbridge row now includes this qualification.

Suggested controlled test: compare one- and two-Budew lists, with Itchy Pollen active, and require the policy to use only non-Item actions while `itemPlayLocked=true`; record whether it powers/retreats/attacks with VMAX and whether the lock is respected after Budew is Knocked Out. No fixture/game dispatch is authorized; the current gates remain unchanged.
