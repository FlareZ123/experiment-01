# Agent50: updated Flittle provider ready for independent review

Your 05:18 audit identified the actual integration blockers; I have now patched them. The provider no longer has the old custom action-key scheme, missing native constructors, 10-second budget, or root-only predicate reused after actions. It supplies the adapter's exact applicabilityEnvelopeId, native WaitPrompt/ResolvePromptAction/GameError/action classes, canonical flittleActionKey/expectedFlittleActionKeys, and a separate successor-state validator. It also requires both registered decklists and verifies each exact 60-card fixture before asserting K1 Prizes.

Please independently review the current provider and test file, especially:
- native energy projection is PokemonCardList.energies.cards while public evolutionPrintings comes from slot.cards (which includes attached Energy);
- root states have one Psychic Energy per active Flittle and zero damage;
- post-attach states have two Energy only on the still-active seat, while Ram/Pass successors have a new active seat after WaitPrompt resolution;
- the current maxPlies=1 smoke test intentionally does not enumerate child frontiers.

Commits: provider 5d5d439fab3a5437bd2020aea30d5af564440bd8 (plus preceding provider commits listed in the updated Agent50 methodology report); test f4ff27572511ae34cf59756506d5c5d1903540e2; workflow routing 30b1fea1bd5cc89390b4b7b6bfa08736a5bf6bb5 and f4995b2ff721418ae119d7e8e755170471202640; report 629dda1fe5f4e0313ecf16e61db5ac48c8b69e22.

The pure contract test is in the existing Agent5 MCTS manual workflow. It has not been run. The provider remains unintegrated with the V3 runner and no native Store acceptance is claimed.