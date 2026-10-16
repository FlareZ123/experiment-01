# Hood Shield: Arven, protected evolution and immediate opponent Tool answer

**Agent 15, 16 October 2026.** [Pinned-engine effect and policy fixture](../../simulation/twinleaf/hood-arven-removal.cjs); [manual engine CI 38829270890](https://github.com/FlareZ123/experiment-01/actions/runs/38829270890) passed for both Faba and Megaton response paths. This report describes **isolated injected midgame board states**, not complete legal-match setup or a win-rate estimate.

## Reproduced turn sequence

On turn three, a Shadow Rider player with a Benched `Shadow Rider Calyrex V`, an `Arven` and `Shadow Rider Calyrex VMAX` in hand faces an opposing Active `Iron Thorns ex`. The local fixture uses distinct numeric IDs on synthetic cards, avoiding a false search-prompt failure caused by the pinned CardManager's default `id=-1` on unregistered clones. It initializes six Prize slots for both players and otherwise uses normal pinned `Store` card effects.

1. Announce `Arven` as the turn's Supporter. Its actual `ChooseCardsPrompt` allows a maximum of one Tool and one Item; the directed policy chooses the unprized `Stealthy Hood` and `Mysterious Treasure`. Both are transferred into the hand through the ordinary prompt flow.
2. Attach Hood to the Benched Calyrex V using `AttachPokemonToolEffect`. The Tool is transferred out of the hand and occupies the Pokémon's Tool slot.
3. Evolve from the hand into `Shadow Rider Calyrex VMAX` with `PlayPokemonEffect`. The attached Hood remains, and `CheckPokemonPowersEffect` now exposes **Underworld Door**, despite opposing active Initialization.
4. Move to the opposing player's following turn. In two independent cases, resolve opposing `Faba` or `Megaton Blower`. Faba's actual choice prompts place Hood into its owner's Lost Zone; Megaton discards it using the research compatibility hook required at pinned upstream. In either case, there are zero Tools left attached and **Underworld Door is suppressed again by Iron Thorns**.

Each transition was checked with assertions. This establishes a **conditional playable counterline and counter-counterline**. It does not establish that the opening draw, Board/Energy setup or competitive decision policy will select and execute these steps naturally. The full `PowerEffect` energy attach and draw is separately tested by [Underworld Door action fixture](../../simulation/twinleaf/underworld-door-action.cjs).

## Generic bot's actual choice

Before the directed search step, the fixture asks the actual pinned `ChooseCardsPromptResolver` to resolve *the same* Arven prompt and validates the proposed cards. In both cases the original `SimpleTacticsAi` resolver chooses:

`Fog Crystal + Float Stone`

It skips `Stealthy Hood`, even while Initialization currently makes an unprotected Benched VMAX's draw Ability unusable. The source's generic hand scoring treats these early Trainers primarily as inventory/card counts and selects high-ranked items/tools by its generic ordering, with no future protected-attacker valuation. This is a **specific policy counterexample**, not proof Fog Crystal or Float Stone is bad in other game states. A follow-up policy must account for the opportunity cost of the Arven search and competing Tool slots.

## Methodological correction from failed CI

Three earlier manual attempts failed on invalid synthetic assumptions rather than an established game-rule bug:

- The first erroneously expected an off-board `CheckPokemonPowersEffect` to reject VMAX abilities. The API's raw power discovery is meaningful for cards in play; the pre-evolution check was removed.
- The second and third used CardManager clones all having the default `id=-1`, so a blocked-Psychic-Energy filter in the real `ChooseCardsPrompt` reconstructed every card as blocked. The fixture now assigns unique synthetic IDs like registered real-match cards do.

Both corrections are retained in source. Never infer general game weaknesses from unvalidated synthetic board fixtures. The final passing CI checked the actual Arven prompt constraints, Tool attachment, evolution, Ability discovery, and both Tool-removal outcomes, with an opt-in research-owned Megaton hook. A subsequent commit also preserves the Supporter-use counter into the opponent's turn instead of manually resetting it.

## Field importance

The [complete published-field removal census](hood-response-field.md) finds at least one named Tool-removal card in **20 of 29** source lists. Crucially, **every published Iron Thorns opponent** (ranks 6,24,29) carries `Faba` and `Megaton Blower`. These counter-counterlines are therefore not exotic possibilities; they are printed on the exact benchmark opponents. Their actual availability and value remain state- and policy-dependent.

**Recommended next experiment:** evaluate a deliberately skilled Arven/Tool-choice policy and a similarly skilled Faba/Megaton response policy against identical opponent source states in both seat orders. Preserve the alternative search lines the policy gives up, including Forest Seal Stone, Float Stone and Pokémon access.
