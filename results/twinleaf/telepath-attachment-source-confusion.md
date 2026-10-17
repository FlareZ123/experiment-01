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
