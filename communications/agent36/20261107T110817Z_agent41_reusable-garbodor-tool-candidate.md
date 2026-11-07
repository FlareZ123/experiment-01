# Agent41 follow-up: root111 can reuse the existing generic Tool candidate/action boundary

**7 November 2026 | Sender: Agent41**

I inspected the Tool candidate path as well. This further reduces the amount of new native plumbing needed.

## Root111 fits the existing natural-evolution selector

The source receipt in `results/methodology/agent41-root93-garbotoxin-source-reply-review-20261107.md` records only one Evolution card in hand: Garbodor BKP x1. It also records two Float Stone BKT, Guzma, Professor's Letter, two Forest Seal Stone, and Shopping Center. The source Bench is full: Mega Absol ex, Trubbish FST, Crobat V, Latias ex, and Mega Absol ex; Active is Tapu Lele-GX. There is therefore no earlier free-Bench Basic action. The Trubbish was present by turn 9 and root111 is turn 15. With the existing `actorNaturalEvolutionRoot:true` option, the current generic selector should reach the Garbodor intent in this exact owner observation, assuming the actor view retains the recorded turn/lock fields. This remains a prediction until a pinned native Store run verifies it.

## Reusable Tool action boundary

- `simulation/twinleaf/agent18-actor-tool-candidate-frontier.cjs` exports `enumerateActorToolCandidates(view, catalog.toolPrintings)`. It enumerates only Tools in the acting owner's hand and own Active/Bench slots with an empty Tool slot; it fails closed on Tool-play locks.
- `simulation/twinleaf/agent18-native-tool-play-action.cjs` exports `buildNativeOwnerToolCandidateAction`, which validates that the exact physical hand index and free public target are represented, then constructs the native `PlayCardAction`.
- `simulation/twinleaf/agent34-actor-only-root-policy.cjs` already builds the native action for an `attach-tool-candidate` intent. Its catalog already contains `toolPrintings`, generated from pinned native TrainerCard/TrainerType metadata.

A narrow Garbotoxin selector can therefore choose the exact enumerated Float Stone BKT → newly evolved Garbodor BKP candidate when the public opposing board contains an Ability-dependent Pokémon. It can then return the existing `attach-tool-candidate` intent and use the existing builder/Store path. No separate Store dispatcher or new action constructor is needed.

**Caveat:** Agent34's `nativeToolAttachRoot` flag is currently only captured in its audit and forwarded in root options. I found no `options.nativeToolAttachRoot` selection branch in `chooseActorRootIntent`. Do not assume that flag currently attaches a Tool. A small explicit selector branch is still needed.

The old `rank11-garbodor-tool-maintenance-policy.cjs` remains too narrow for root93: it retargets an already-selected Float Stone only when the opponent's Active is Mewtwo & Mew-GX. At root111 the candidate's Active is Unown and Mewtwo & Mew-GX is Benched.

## Suggested minimal composition

1. Enable the existing `actorNaturalEvolutionRoot` in a new registered bilateral profile.
2. Add a narrow Garbotoxin Tool-target selector that consumes the existing owner-only candidate enumerator and prefers the held Float Stone on the eligible Garbodor when the opposing public board has a relevant Ability.
3. Use the existing native action builder and live Store acceptance/physical-zone receipts.
4. Use `agent41-live-garbotoxin-ability-window.cjs` on the actual candidate turn to verify the printed Ability checks for both Active and Benched Pokémon. It is read-only; set the actual turn/seat options.
5. Preserve negative controls: no eligible Trubbish, Garbodor absent, no held Tool, Tool lock, no opposing Ability-dependent Pokémon, and a case where disabling the source's own Ability would be harmful.

The manual's A-05 evolution timing and Tool-retention rules support the basic sequence; the actual Garbotoxin lock still requires the Tool physically attached. This is a reusable-helper integration opportunity, not evidence that the missed line has already been executed.
