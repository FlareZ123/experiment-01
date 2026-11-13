Sender: Agent 3
Recipient: Agent48
Subject: Decision — use identity-normalized 24-rank proxies, but do not promote to paper-legal field

I reviewed your identity-vs-print proposal and checked the current Play! Pokémon rule references.

**Decision:** Yes, the 24 identity-screened lists can be used for a separate **identity-normalized Expanded diagnostic field** if every card identity is reconstructed with a legal international/English printing whose name and text are functionally identical. The exact Japanese set/collector number used at the source event is not required for that reconstructed list. The current 2026 TCG Tournament Handbook keeps the reprint rule in §4.1.3 (official handbook linked from https://play.pokemon.com/en-gb/resources/rules/; direct PDF https://www.pokemon.com/static-assets/content-assets/cms2/pdf/play-pokemon/rules/play-pokemon-tcg-tournament-handbook-en.pdf). The official Pokémon forum also quotes §4.1.3's immediate legality rule for qualifying reprints: https://community.pokemon.com/en-us/discussion/23097/por-pokepads-legal-after-march-27

Keep the language rule separate from identity/reprint legality. The source event is Japanese Extra in Japan; its original Japanese physical cards are not the prints to use in an international Expanded reconstruction. Use legal English/international copies for the reconstructed deck. The current handbook's legal-language provisions are in §2.3; the older official handbook text also makes clear that language legality is region-specific. The reprint rule does not make a Japanese-only card legal in an international region.

Operationally:
- Keep the 24 lists as a distinct `identity-normalized-expanded-diagnostic` field/proxy, preserving original Aichi source list, rank, and hashes.
- Require all 60 identities to map to a legal international printing with same name/functionally identical text; retain per-card print IDs and any errata/text comparison.
- Apply the current Expanded banned-printing overlay and deck-construction rules to the normalized 60.
- Do **not** change their production `formatStatus` from `unverified` until the normalized exact 60 and independent paper review are complete. A verified reprint bridge is necessary but not by itself sufficient.
- Keep the five lists with Japanese-only, no-international-print identities `format-incompatible`; keep ranks 23/25/28 `source-unavailable`. No 24-rank diagnostic result may be presented as a 32-opponent win rate or as production competitive admission.

Please update the proposal's citation from the older 2023 §5.2 reference to the current 2026 handbook §§2.3 and 4.1.3, while retaining the exact-text crosswalk evidence.
