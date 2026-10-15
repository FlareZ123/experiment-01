# Tool suppression and removal fidelity in pinned Twinleaf

**Agent 11, 15 October 2026.** Engine `twinleafgg` at immutable revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. This report concerns board-state execution fidelity, with no inference of competitive win rates.

## Two source-verified defects

1. **Tool Jammer BST 136 was a no-op in the pinned engine.** [Its upstream implementation](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-battle-styles/tool-jammer.ts) contains a commented-out `TrainerEffect` branch without the `ToolEffect` check required to suppress opposing Active Pokémon Tools. A minimal state with Active Iron Thorns ex holding Tool Jammer and opposing Active Shadow Rider Calyrex VMAX holding Stealthy Hood incorrectly exposed the latter's Underworld Door, contrary to the former's printed effect. [First failing CI run 38822855722](https://github.com/FlareZ123/experiment-01/actions/runs/38822855722) isolates the wrong expected/actual values.
2. **Megaton Blower SSP 182 missed attached Pokémon Tools.** [Its upstream implementation](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/10-scarlet-and-violet/set-surging-sparks/megaton-blower.ts) tries to identify Tools inside `PokemonCardList.cards`, although the compiled engine stores them in `PokemonCardList.tools`. It already removed a Stadium and Special Energy, but left Tools attached in our state fixture. This contradicts [the published card text](https://asia.pokemon-card.com/sg/card-search/detail/16747/).

Both flaws matter to the published Aichi 2026 Iron Thorns lists. Ranks 6, 24 and 29 each contain one Tool Jammer and one Megaton Blower, plus one Faba; see [full field manifest](../aichi-2026/full-decklists.json). Both source errors could make a Stealthy Hood response appear more durable than it truly is. These are paper-interaction and engine implementation issues, independent of whether the card sequence can be established by skilled players.

## Research-owned reproducible corrections

| Fix | Narrow hook | Fixture | Validation |
| --- | --- | --- | --- |
| Tool Jammer Active-only ToolEffect suppression, preserving the other player's Bench Tools and the Tool Jammer exemption | [`tool-jammer-hook.cjs`](../../simulation/twinleaf/tool-jammer-hook.cjs) | [`hood-vs-thorns.cjs`](../../simulation/twinleaf/hood-vs-thorns.cjs), six positional states | [Manual CI 38823182503](https://github.com/FlareZ123/experiment-01/actions/runs/38823182503), passed |
| Megaton Blower discards all attached opposing Tools and Special Energy and the Stadium, leaving own Tool attached | [`megaton-blower-hook.cjs`](../../simulation/twinleaf/megaton-blower-hook.cjs) | [`megaton-blower-fixture.cjs`](../../simulation/twinleaf/megaton-blower-fixture.cjs), upstream anomaly plus corrected board | [Manual CI 38823746450](https://github.com/FlareZ123/experiment-01/actions/runs/38823746450), passed |

Every hook lives under `simulation/twinleaf/`, overrides the corresponding card prototype at runtime, and returns a restoration callback. Both hooks are now installed for every `runMatch()` call in the [headless adapter](../../simulation/twinleaf/headless.cjs) and restored in `finally`, with no source or submodule commit changed. The Tool Jammer hook checks whether its own Tool is disabled before suppressing another.

### What was actually checked

- The raw pinned Tool Jammer failed specifically in the Hood-protected Active VMAX versus Tool Jammer case; Benched Hood protection worked under the same Iron Thorns Initialization, and no-Hood baseline was blocked.
- The patched Tool Jammer passed six visibility assertions across Hood present/absent, VMAX Active/Benched and opponent Tool Jammer present/absent.
- The raw pinned Megaton left one Hood on the opposing Active and another on a Benched evolved VMAX, while removing one attached Speed Lightning Energy and the Stadium.
- With the patch, both Hoods, the Speed Lightning Energy, and the Stadium were removed, with the initiating player's own Tool Jammer unchanged.
- Card-manager instances, copied Tools and concrete board-zone arrays were used. The Megaton test executed its resolving `TrainerEffect` directly; the Hood test queried `CheckPokemonPowersEffect` rather than completing an Underworld Door attachment and draw.

## Remaining acceptance gates

These are deterministic, synthetic midgame effect fixtures. They do not establish full turn legality, priority among competing Tool and Stadium effects, combinations with Item lock or Ability lock, exact card-game correctness of all other effects, or strategic policy quality. The compatibility patches must be tested against completed field matches under the same pinned engine. The [Aichi full-match source fixture](../../simulation/twinleaf/aichi-fixture.cjs) provides a bounded smoke test, while actual matchup strength requires a substantially stronger policy and both seats.

The headless-integrated compatibility checks should become explicit components of each experiment's research-code revision and engine hook manifest. A future pinned Twinleaf update should re-run each raw-upstream anomaly test; if upstream correctly implements the card, remove or revise the hook under review.

**Evidence category:** defect reproduced and fixed in a pinned headless engine on manually dispatched CI, separate from paper legality and actual winning strength.
