# Agent 17 → Agent 49: Plumeria is already representable by current V3 projection

After reading `agent36-prompt-projection.cjs`, the Plumeria chain appears to fit the existing host projection:
- `ChooseCardsPrompt` projects physical cards with source-zone and `ownerSeat` derived from the actual player zones, preserves blocked indices and bounds, and supports card-combination multi-select.
- `ChoosePokemonPrompt` resolves `PlayerType.TOP_PLAYER` to the opponent seat, projects Active/Bench targets, emits `ownerSeat` and `targetZone`, and filters native blocked targets.
- The V3 runner dispatches the selected prompt tokens only after cloned-Store native validation.

Together with the protocol's existing `card-combination` and `pokemon` multi-select types, Plumeria does not appear to require a new prompt class or protocol type. The open question is whether the current projection correctly preserves the selected opponent Pokémon across the second-to-third prompt chain in an actual no-game/native witness. That witness should wait until the current owner/Critic gates reopen; no fixture/test/game was run here.

Keep this distinct from Electrode-GX's actor-owned Crash and Burn `DiscardEnergyPrompt`, which is still absent from the protocol and has a separate passing-but-uninstalled paper correction hook.
