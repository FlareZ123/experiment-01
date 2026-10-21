# Path to the Peak permits Forest Seal Stone Star Alchemy: official ruling versus pinned native Store

**Agent 21 | 21 October 2026 | Native mechanical test, not a competitive game.**

## Paper-rule source

The [official Japanese Pokémon Q&A](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%80%8C%E9%A0%82%E3%81%B8%E3%81%AE%E9%9B%AA%E9%81%93%E3%80%8D%E3%81%8C%E5%87%BA%E3%81%A6%E3%81%84%E3%82%8B%E3%81%A8%E3%81%8D%E3%80%81%E3%83%9D%E3%82%B1%E3%83%A2%E3%83%B3%E3%81%AE%E3%81%A9%E3%81%86%E3%81%90%E3%80%8C%E6%A3%AE%E3%81%AE%E5%B0%81%E5%8D%B0%E7%9F%B3%E3%80%8D&regulation_faq_main_item1=all) expressly asks whether an **Unown V** with Forest Seal Stone attached may activate `Star Alchemy` while `Path to the Peak` is in play. The official answer is **yes**. This is consistent with the Tool-granted VSTAR Power retaining its usability despite printed Pokémon-V Ability suppression. Do not treat a Path Stadium as equivalent to Jamming Tower Tool-effect suppression.

## Controlled executable contrast

The [dedicated original-state staging test](../../simulation/twinleaf/forest-seal-path-to-peak-action.cjs) uses actual native `Store.dispatch` and pinned Twinleaf **a9905a76a6c4103ba4b6cb9a49e86bad795c5c05**. It sets **Oranguru V ASR** with attached **Forest Seal Stone SIT**, a nonempty owner deck containing Boost Shake, and a true opposing Active Bunnelby. The opponent plays a real **Path to the Peak CRE** Stadium via `PlayCardAction`. The next owner turn selects **Star Alchemy** via `UseAbilityAction`, resolves the native animation WaitPrompt when emitted, then asserts:

- A genuine `ChooseCardsPrompt` is pending rather than the Ability being suppressed.
- The owner's one-game `usedVSTAR` marker is consumed.
- The Path Stadium remains in play.
- Both real physical source seats **0 and 1** pass independent stage instances.

The existing [Jamming Tower contrast](jamming-tower-forest-seal-animation-audit.md) already establishes the opposite behavior for Tool-effect suppression: attached Stone remains, Star Alchemy cannot be used. The [one-card Star Alchemy correction gate](forest-seal-search-gate.md) separately tests native Store search resolution with a reversible hook. No new vendor-side code was modified.

## Executed compiled CI and source-field relevance

[Manual workflow **39616986476**](https://github.com/FlareZ123/experiment-01/actions/runs/39616986476), source head `88f00652804579cd97970dbe310433804b37a610`, completed **success**. The new Path-to-Stone step and the existing pinned compile, one-card correction, and combined headless smoke steps each independently report **success** in the native GitHub Actions job-step conclusions. It runs only on manual `workflow_dispatch`; no per-commit CI added.

A strict count of [the 29 published source 60s](../aichi-2026/full-decklists.json) finds **two decks containing both cards**: rank **5** (one Stone, two Path) and rank **9** (one Stone, one Path). Seven of the 29 published lists include Path and 12 include Forest Seal Stone. The cross-deck occurrence is a card-location fact; it does not prove concurrent use in any actual registered match. The interaction also matters when an opposing player establishes Path.

## Boundaries

This is a focused paper-ruling/native-engine agreement on one staged case. It does not certify all sources of Ability lock, opponent tactical behavior, actual preregistered turn order, match clock, complete paper Expanded fidelity, a qualified match, or progress toward a 99.5% win-rate claim. No fixed candidate, opponent manifest or legal registration was changed. **29/32 source 60s and zero competitively qualified games remain unchanged.**
