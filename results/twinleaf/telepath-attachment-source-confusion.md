# Compiled source-engine failure: origin of Special Energy attachment is conflated

**Agent 3, 17 October 2026. Engine revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Evidence class: real Store attack/prompt reducer on constructed board. Zero competitive games.**

[Manual compiled CI 39040280110](https://github.com/FlareZ123/experiment-01/actions/runs/39040280110) **passed the two-seat negative regression** in [`telepath-nonhand-solburst-source.cjs`](../../simulation/twinleaf/telepath-nonhand-solburst-source.cjs). [Machine-readable artifact](https://github.com/FlareZ123/experiment-01/actions/runs/39040280110/artifacts/12103484131).

## Reproduction and directly supported result

1. Construct a legal *attack-action context* with Active Solgaleo-GX UPR bearing the Metal Energy required for `Sol Burst-GX`, a Benched Psychic Mewtwo & Mew-GX UNM, a Telepathic Psychic Energy **in the deck and absent from hand**, and two Basic Psychic Pokémon in the deck. Ordinary Bench slots exist. This is a staged effect board, not an evolved-source 60-card game.
2. Dispatch a real `AttackAction` for Sol Burst-GX. The resulting `AttachEnergyPrompt` uses the **deck** as its selection zone. Its selected Telepathic Psychic Energy is assigned to the Benched Mewtwo & Mew-GX through a real `ResolvePromptAction`.
3. In **both physical seats**, the pinned Store then queues a **`ChooseCardsPrompt` for Telepathic Psychic Energy's two Basic Psychic search**, even though its printed trigger requires attachment **from hand**. The exact same Telepath Energy remains in the source **deck** and is simultaneously listed among the target Pokémon's **attached Energies**, despite starting absent from the player's hand. Both negative assertions are enforced by the script and confirmed by the compiled green CI.

These two deviations are separable: the unsupported search is a trigger-origin error; the source card remaining in deck is an energy-zone conservation error. Neither is permissible under the printed effects.

## Source-level cause

- [`TelepathPsychicEnergy.reduceEffect`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/11-mega-evolution/set-perfect-order/telepath-psychic-energy.ts) fires on `AttachEnergyEffect && effect.energyCard === this`. It does **not test** that the effect originated in the player's hand.
- [`SolgaleoGx` Sol Burst-GX](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/08-sun-and-moon/set-ultra-prism/solgaleo-gx.ts) legitimately prompts for Energy **from the deck** but calls `new AttachEnergyEffect(player, energyCard, target)` for each selection.
- [`playEnergyReducer`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/effect-reducers/play-energy-effect.ts) performs `player.hand.moveCardTo(effect.energyCard,effect.target)` unconditionally and then unconditionally pushes the Energy into the target `energies.cards` if absent. Because the chosen card was in the deck, the attempted hand move cannot remove it from its source deck. `AttachEnergyEffect` carries no source-zone field.

## Consequences and boundaries

A legal Pokémon TCG effect can attach Energy directly from a deck. The advanced-player rulebook explicitly treats these card-effect attachments separately from the manual once-per-turn attachment. This source path can therefore create a fictional Basic-Psychic search and divergent Energy-zone accounting. It is a concrete reason to distrust source games exercising a non-hand `AttachEnergyEffect` path without a validated adapter.

The test **does not measure** how often this occurs in the Aichi 2026 lists, which candidate would profit, or any game's winner. Solgaleo-GX is an adversarial effect fixture, not an assertion that any Top32 deck actually includes it. The scripted board bypasses natural Stage-2 evolution only to isolate the attack reducer and source zone. It retains the actual pinned attack and prompt actions.

**Suggested qualification work:** inventory all non-hand callers of `AttachEnergyEffect` in source-legal decks, implement a reversible research-side source-location-aware correction that conserves the same physical card across zones, suppress from-hand-only triggers when not actually attached from hand, and regress ordinary manual attachments against the correction. Test both seats, source-dealt completed games, and effect-specific paper rules before using any win outcomes from affected paths. Do not silently patch upstream Twinleaf or count this result as a qualified game.

## Reversible research-side correction: compiled paired result (18 October UTC)

[Manual CI 39071635599](https://github.com/FlareZ123/experiment-01/actions/runs/39071635599), pinned source commit `48d64111a7ff42143153db5d40222e7a9139e9bc`, **completed successfully** with a machine-readable [paired artifact](https://github.com/FlareZ123/experiment-01/actions/runs/39071635599/artifacts/12115537193). The workflow executes [`telepath-source-origin-paired.cjs`](../../simulation/twinleaf/telepath-source-origin-paired.cjs) against compiled Twinleaf in both physical seats. It first reproduces the two raw non-hand failures, installs the opt-in [`telepath-source-origin-hook.cjs`](../../simulation/twinleaf/telepath-source-origin-hook.cjs), checks that deck-origin Telepath neither triggers its printed from-hand search nor remains in deck, verifies it is physically attached, and verifies an ordinary from-hand Klefki/Telepath search-and-retreat example. Finally, it restores the Store method and reproduces the original raw failures. The CI job's green status and saved artifact establish these assertions for the **staged, two-seat fixture only**.

**Limits:** The hook is keyed to the pinned Telepath fullName and detects deck/discard origin only while the physical card is still there at `AttachEnergyEffect` dispatch. It does not address other Special Energy triggers, effects that pre-move cards, or the generic `AttachEnergyEffect` source-origin API. No authentic rank-9/30/31 game has yet been shown to encounter this defect. Do not enable the hook as a globally certified card-rule fix or count any engine game as competitively qualified on this evidence.

**18 October follow-up:** The [read-only physical ownership instrument](physical-card-ownership-source-audit.md) also passed in both raw and repaired Store fixtures, and its five pure tests passed 5/5, in [CI 39081821001](https://github.com/FlareZ123/experiment-01/actions/runs/39081821001). The **overall workflow failed at a later, unrelated Horror House/Volt Cyclone step**, so this is a verified per-step result only; see [paired artifact](https://github.com/FlareZ123/experiment-01/actions/runs/39081821001/artifacts/12119735457). Neither run proves genuine rank-9/30/31 source-game exposure.
