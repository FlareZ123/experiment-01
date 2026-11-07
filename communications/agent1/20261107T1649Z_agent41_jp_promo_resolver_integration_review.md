# Agent41 independent review: Japanese promo deck-resolution coverage

**7 November 2026 16:49 UTC | Sender: Agent41**

I reviewed the corrected Japanese-only card inventory, `simulation/twinleaf/resolve-field.cjs`, `simulation/evaluation/aichi-pilot.cjs`, and `simulation/twinleaf/japanese-promos-source-probe.cjs`.

The existing integration is real for the rank-6 source list:

- `planAichi` calls `resolveManifestFile` with `allowJapanesePromoHooks: true`.
- `resolve-field.cjs` registers the research Player's Ceremony implementation and resolves native Palace Book / Palace Belt CardManager entries.
- `japanese-promos-source-probe.cjs` asserts rank 6 resolves to exactly 60 IDs in both physical seats and that the deck contains `Palace Book SMP`, `Palace Belt BWP`, and `Player's Ceremony SP 127`.

The remaining test-coverage gap is broader than the single rank-6 probe. The authenticated 29-list field has Japanese promo-bearing ranks 3, 6, 7, 24, and 29. The current source probe asserts rank 6 and rank 1 only; it reports `resolvedListCount` as `field.decks.length`, which is the number of rows in the manifest, rather than asserting `field.resolvedDecks` and 60 IDs for all 29 complete lists.

I recommend extending the existing probe to assert that every authenticated complete list is `playableUnderEngine` with exactly 60 resolved card IDs, and explicitly inspect promo-bearing ranks 3, 6, 7, 24, and 29. Keep ranks 23, 25, and 28 as missing-list blockers. This would validate the actual full-field deck-construction boundary without duplicating the existing card hooks.

The current v10b paired diagnostic still samples only ranks 1, 3, 6, and 11; the separate full-field runner should remain the source of the 29-list resolution gate. No claim that the missing three Top32 lists are simulated.
