# Grand Tree SCR 136: printed name restored with reversible native adapter

**Agent 18, 9 November 2026.** Research-side identity correction for the pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. This is a card construction and Store-effect fidelity contribution. It is not a played-game performance claim.

## Original-source gap

Original Aichi 2026 source ranks **2, 15 and 31** each contain one **Grand Tree SCR 136**, as recorded in `results/aichi-2026/full-decklists.json`. Agent4 found that the native `initializeCards().getCardByName('Grand Tree SCR')` returned no object and could not include the Stadium in a staged original-field Iron Thorns neutrality fixture.

The underlying pinned implementation is already present at `vendor/twinleaf/ptcg-server/src/sets/10-scarlet-and-violet/set-stellar-crown/grand-tree.ts`, exported as `GreatTree` by the set index. The class has `name='Grand Tree'`, `set='SCR'`, `setNumber='136'` and the incorrect `fullName='Great Tree SCR'`. Because the pinned CardManager indexes only `fullName`, the actual printed ID cannot be constructed by normal name-based lookup. This is a specific *printing-name lookup defect*, not evidence that the Grand Tree evolution effect is absent.

## Repair

`simulation/twinleaf/2026-11/agent18-grand-tree-printing-alias.cjs` provides:

- `installGrandTreePrintingAlias(manager)`: fails closed unless the original SCR 136 class is present; resolves the printed `Grand Tree SCR` to a cloned copy of the old registered object with the correct `fullName`; preserves the legacy lookup, keeps all other lookups unchanged, supports idempotent nested disposer calls and restores the original manager methods.
- `canonicalizePublishedGrandTreeDeck(nativeIds,publishedCards)`: checks the authenticated original printing row, converts the one old native typo identifier to the printed ID without mutating the 60-card list, accepts already canonicalized lists, and rejects card-count or provenance mismatches.
- `withCanonicalGrandTreeLookup(work)`: installs the lookup only for a synchronous native match or construction task and restores it in a `finally` block.

No upstream submodule file or pinned revision was changed. Old trials using `Great Tree SCR` remain intact and distinguishable. No new card implementation or extra ACE SPEC is registered.

## Executed native evidence

**[GitHub Actions native run 42565796402](https://github.com/FlareZ123/experiment-01/actions/runs/42565796402): success.** The pinned upstream Node server compiled. Pure tests passed. The compiled Store accepted canonical `Grand Tree SCR` through a physical `PlayCardAction` in **both owner-seat orientations**; one `UseStadiumAction` produced genuine `ChoosePokemonPrompt -> ChooseCardsPrompt -> ChooseCardsPrompt -> ShuffleDeckPrompt -> WaitPrompt`. Physical `Herdier SUM` and `Stoutland BCR` left the acting owner's deck and joined the same pre-existing `Lillipup CEC` Bench stack. Both native seats ended with **Stoutland BCR** atop the stack and `Grand Tree SCR` in the Stadium zone.

The two initial failed test attempts, [42565180666](https://github.com/FlareZ123/experiment-01/actions/runs/42565180666) and [42565586998](https://github.com/FlareZ123/experiment-01/actions/runs/42565586998), contained a *fixture* error: the test constructed multiple physical card objects in one `push(...)` call using the same array length for IDs. All selected cards thus shared one ID and were legitimately blocked by native prompt validation. The fixture was repaired using a monotonically incrementing ID, and the next native CI passed. The native engine was not changed.

Files: `tests/2026-11/agent18-grand-tree-printing-alias.test.cjs`, `tests/2026-11/agent18-grand-tree-printing-alias.native.test.cjs`, existing manual workflow `.github/workflows/agent18-funded-stadium-v10.yml` with default-off `grand_tree_alias_only` input. The existing eight-arm G&H experiment is unchanged under its default workflow input.

**[Follow-up original-source 60 native CI 42566064538](https://github.com/FlareZ123/experiment-01/actions/runs/42566064538): 7/7 PASS.** This run exercised both actual Store evolution seats again and additionally read all three complete authenticated original 60-card inventories. For each original rank **2, 15 and 31**, the pre-existing native `Great Tree SCR` was converted to canonical `Grand Tree SCR` with every other original card unchanged. The exact resulting 60 was accepted by the compiled native `DeckAnalyser(Format.EXPANDED)`, and **60/60 real native card objects resolved**, including exactly one `Grand Tree SCR` carrying the correct name and SCR 136 metadata. The actual reported receipts were `originalSize=60, translatedSize=60, allNativePhysicalCardsResolved=true` for each rank. These checks are engine deck-construction admission and deliberately do not claim complete Japanese paper printing legality or played-game performance.

## Actual two-player shared runner admission

**[Manual compiled native CI 42566652038](https://github.com/FlareZ123/experiment-01/actions/runs/42566652038): 8/8 tests PASS.** A new regression `tests/2026-11/agent18-grand-tree-original-two-player.native.test.cjs` constructed the **entire unchanged original rank1 Shadow Rider and rank2 Grand Tree 60s** under `EXPANDED_SOURCE_PROFILE`. It scoped the printed-identity alias around the **actual `runWithResearchProfile -> headless.runMatch`** bilateral runtime and used rank2 source in each physical seat independently.

The two actual headless matches accepted **30 genuine root Store actions each**, with source list ID hash `68f5fee725c15aaf88e59af9a5ed1e73fa7793f8dfc7b019686c5a642c7bc586` identical across source physical-seat orientations. Each matched the expected native shuffled printed 60 input hashes and preserved the original source arrays without mutation. Both stopped at the explicitly imposed **30-action cap**: `finished=false`, no native winner. This is a **two-player card-construction and runner-path compatibility** admission, not a match result or demonstrated opponent-policy activation. No claim that a Grand Tree effect happened naturally inside those 30 actions.

## Full source printing/name census and safe alias scope

**[Native source audit CI 42567138627](https://github.com/FlareZ123/experiment-01/actions/runs/42567138627): 9/9 checks PASS.** A new deterministic audit `tests/2026-11/agent18-original-source-fullname-census.native.test.cjs` compared **989 printed card rows across all 29 authenticated Aichi source decks** against the pinned registered `fullName` for exactly matching `name + set + collector number` objects. It found **75 matching rows involving 22 distinct printed identities** whose native `fullName` string differs from printed `name + set`.

Examples include `Grand Tree SCR` vs `Great Tree SCR`, `Dedenne-GX UNB` vs `Dedenne GX UNB`, `Pokémon Communication TEU` vs `Pokemon Communication TEU`, `Mega Absol ex MEG` vs `Mega Absol ex M1L`, and `Tropical Beach BWP #50` vs `Tropical Beach BWP 50`. The 22 are **observed lookup-string differences**, not 22 established engine defects: some encode Japanese/English product naming, punctuation normalization or collector-number disambiguation. In particular, normalizing an explicitly numbered reprint to an unnumbered `fullName` could collapse two distinct printings. Any new alias must demonstrate the unambiguous original printed metadata and absence of collision.

The Grand Tree repair remains *only* the authenticated SCR 136 singleton alias with a strict native class precondition. The census reports other printings for careful source-specific work; it changes no card ID, game rule, original list or CI profile.

## Boundary and integration

This is staged card construction, a genuine native Store resolution and a short bounded bilateral runner execution. Its starting state was deliberately constructed. It proves no naturally drawn Grand Tree opportunity, opponent counterresponse, source-policy activation, full competitive match, Japanese physical-print legality, or paper clock. The earlier source rank2 Grand Tree / Stoutland owner-turn work is independent and must not be treated as reproduced by this test.

For the proposed versioned shared paper-semantics profile, enable the alias for the full synchronous two-player match, canonicalize only original published source rows with SCR 136, and retain the first-turn Grand Tree correction separately. Do not enable it retroactively in the frozen v8-v10 comparison controls. Keep native `Great Tree SCR` as a separately reported pre-repair ID.

**Status:** 29/32 authenticated original Aichi 60s, zero competitively paper-qualified games, no demonstrated 99.5% win rate or selected final deck.
