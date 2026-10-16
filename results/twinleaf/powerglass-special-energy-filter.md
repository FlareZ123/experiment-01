# Pinned Twinleaf: Powerglass permits an out-of-filter Special Energy prompt result

**Agent 27, 16 October 2026.** Scope: real pinned Twinleaf Store reducer and `ResolvePromptAction`, staged board, no full game or win-rate inference. Upstream vendor submodule remains untouched.

## Printed rule versus staged engine action

[Official printed Powerglass](https://www.pokemon.com/uk/pokemon-tcg/pokemon-cards/series/sv6pt5/97/) allows its Active holder to attach a **Basic Energy card from discard** at end of turn. The pinned implementation at `ptcg-server/src/sets/10-scarlet-and-violet/set-shrouded-fable/power-hourglass.ts` checks that at least one Basic Energy is in the discard, then creates an `AttachEnergyPrompt` filtered to `energyType: BASIC`. It later moves whatever physical card that prompt returns to the Active Pokémon.

The pinned `AttachEnergyPrompt.validate` verifies quantity and several optional constraints but does **not** enforce the prompt's card filter. The pinned `Store.reducePrompt` consumes `ResolvePromptAction.result` without calling the prompt validator. Thus the presence of one Basic Energy can enable a prompt where a policy or client supplies a **different Special Energy**.

## Actual Store reproduction

[Staged runner](../../simulation/twinleaf/powerglass-energy-filter-store.cjs) with Active Mewtwo & Mew-GX and attached Powerglass SFA, an opposing Active Pokémon, six nonempty Prize cards on **both** sides, and precisely two physical Energy cards in the player's discard: `Psychic Energy MEE` (Basic) and `Double Colorless Energy SUM` (Special).

- **Legal control:** Submit Basic Psychic Energy. Pinned Store attaches Basic Psychic Energy to Active; DCE remains in discard.
- **Out-of-filter selection:** Submit DCE. The native prompt's `validate` returns `true`, and the Store accepts the dispatch and physically attaches DCE to Active, leaving the Basic Psychic Energy in discard. [CI run 38879634286](https://github.com/FlareZ123/experiment-01/actions/runs/38879634286) directly logs the two distinct Active Energy zones.
- **Fixture correction:** An earlier probe without Prize cards caused the Store to enter sudden-death game resolution and reset the staged board, obscuring the attachment. The successful reproduction includes six Prizes per player to prevent this unrelated terminal transition.

This verifies an **engine-input validity defect**, not that any shipped bot, human client or real-game opponent will naturally select the out-of-filter Special Energy.

## Research-side correction

The opt-in `simulation/twinleaf/prompt-integrity.cjs` `assertValidPromptAction` now checks, for `AttachEnergyPrompt`, that each selected card is in `prompt.cardList.filter(prompt.filter)` and each selected physical card is used at most once. The research-side strict guard rejects DCE while allowing the Basic Energy control. Ordinary pinned Store dispatch continues to reproduce the source defect and is left unchanged for comparison.

Files: [real-Store regression](../../tests/powerglass-energy-filter-store.test.cjs), [isolated guard regression](../../tests/prompt-integrity-energy-filter.test.cjs), [manual-only pinned build](../../.github/workflows/aichi-powerglass-energy-filter.yml). Future benchmarks should record whether the strict guard was active and establish how automated policies actually choose Energy before inferring an effect on game outcomes.

## Competitive-research relevance

The archived 52nd-place [New Moon Perfection source 60](../als/new-moon-perfection-source-60.md) contains three Basic Psychic Energy plus three Telepathic Psychic Energy (Special). The [exact Prize feasibility extension](../als/new-moon-powerglass-energy-gate.md) counts the Basic Energy as a separate necessary role in the source pilot's prescribed Powerglass acceleration sequence. An unguarded Powerglass attachment of Special Energy could make otherwise blocked game states appear playable and contaminate simulated strength; occurrence frequency under the default bot is unmeasured.

## Default bot selection path (source audit)

The pinned `simple-bot/prompt-resolver/attach-energy-prompt-resolver.ts` builds legal candidates with `cardList.filter(prompt.filter)` before evaluating targets. Therefore the default `AttachEnergyPromptResolver` appears to honor the Basic-only filter in its normal search, despite the unsafe Store acceptance boundary. The reproduced failure requires an explicit out-of-filter result; this finding does **not** show that the default bot would spontaneously attach a Special Energy with Powerglass. The strict research-side guard closes this input-validation hole for opted-in headless runs and reveals mistakes made by future/custom policies.
