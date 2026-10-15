# Pinned Twinleaf copy-of-copy conflict: Mimikyu GRI 58 vs Regidrago VSTAR

**Agent 7, 15 October 2026.** Status: **source-level behavioral mismatch identified; targeted stateful regression pending**. This is a simulation-validity issue, not a claim about matchup win rate or an evaluated deck change.

## Exact opposing card texts and human hypothesis

The original bundled English printings give:

1. **Mimikyu GRI 58**, *Copycat*: “If your opponent's Pokémon used an attack that isn't a GX attack during their last turn, use it as this attack.”
2. **Regidrago VSTAR SIT 136**, *Apex Dragon*: “Choose an attack from a Dragon Pokémon in your discard pile and use it as this attack.”
3. **Dialga-GX UPR 100**, Dragon type, *Timeless-GX*: deals 150 and allows another turn, with the ordinary once-per-game GX constraint.

The actual rank-1 Aichi Shadow Rider Calyrex list contains one Mimikyu GRI 58 and one Dialga-GX UPR 100. Published rank 30 Lillie's Clefairy also contains Mimikyu GRI 58, so the generic rejection can affect more than the champion's copy line. Regidrago is the most common archetype among Aichi Top 32 placements, with 11/32 entries and nine accessible full lists.

The provided Advanced Player's Rulebook 3.4 section **II-C-18** explains that copying an attack performs its effects/damage while the attack name remains the originally declared attack; the Zoroark *Foul Play* / *Mega Brave* example makes this explicit. *Apex Dragon* is itself a non-GX attack, even if it copied a GX attack's effects. The prior human-concepts document proposes Mimikyu Copycat copying Apex Dragon and then choosing a Dragon Pokémon such as Dialga-GX in Mimikyu's own discard to take a bonus turn. That candidate line must also respect GX usage state, real card access, Energy for Mimikyu's Copycat, and damage/counter rules.

## Reproducible source-level defect

The project pins [Twinleaf a9905a76](https://github.com/twinleafgg/twinleafgg/tree/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05), with research adapters in `simulation/twinleaf/`. Three source observations imply a hard rejection of this paper-permitted sequence:

- [Mimikyu GRI source](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/08-sun-and-moon/set-guardians-rising/mimikyu.ts) calls `COPY_OPPONENTS_LAST_ATTACK` for its Copycat attack.
- [Regidrago VSTAR source](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-silver-tempest/regidrago-vstar.ts) marks Apex Dragon `copycatAttack: true`.
- [Copied-opponent-last-attack prefab](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/prefabs/attack-effects.ts) immediately returns without executing when `lastAttack.copycatAttack === true || lastAttack.gxAttack === true`. GX rejection matches the Mimikyu printed condition; rejecting **all** copy-tagged attacks adds an unprinted restriction.
- [Player-turn reducer](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/reducers/player-turn-reducer.ts) records `state.playerLastAttack[player.id] = { attack, sourceCard: pokemonCard }` **after** `store.reduceEffect(state, useAttackEffect)`. This resets any nested delegation bookkeeping to the originally declared Apex Dragon, whose `copycatAttack` flag is true. Accordingly, using Regidrago's Apex Dragon on the preceding turn yields a Mimikyu Copycat handler that **returns before executing Apex Dragon's copied effect**.

The sibling [list-copy helper](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/prefabs/copy-attack-prefabs.ts) also defaults `disallowCopycatAttack = true` and returns on copied attacks carrying that flag. Whether its call sites need a narrower restriction is a separate card-text audit.

## Minimal stateful regression contract

Use an actual game-state test against the pinned compiled engine rather than changing the vendor submodule:

1. Opponent has Regidrago VSTAR Active. On their preceding turn they used *Apex Dragon* to copy an ordinary non-GX Dragon attack. Record the original last attack as Apex Dragon.
2. Player has Mimikyu GRI 58 Active with the Psychic + Colorless Energy to use *Copycat*, and a Dragon Pokémon in the discard with a non-GX attack. Trigger Copycat through normal game actions and resolve the attack choice prompts.
3. **Expected paper behavior:** Copycat accepts Apex Dragon as the opponent's last non-GX attack and allows the player to select a legal Dragon attack from **their own** discard. An observable effect or damage occurs as appropriate. **Expected pinned-engine behavior from source:** Copycat returns without the copied effect.
4. Repeat with opponent's last declared attack actually GX, which Copycat must reject.
5. Extend the successful non-GX case to Dialga-GX Timeless-GX in the player's discard, with GX unused; assert correct extra turn and GX marker. Separately verify used-GX prevents reuse and previously copied GX effects don't incorrectly change the declared attack name.

Preserve complete traces and keep this fixture outside `vendor/twinleaf`. As required in `prompt.md`, any correction should be an explicitly opt-in **research-side hook**, with exact upstream SHA and test, and should be revisited on upstream synchronization.

## Why it matters

The present completed Aichi engine fixtures use SimpleTacticsAi and have **no representative Regidrago Apex Dragon/Copycat counter-line demonstration**. The source-level discrepancy is a plausible systematic matchup distortion affecting both evaluation of Shadow Rider's current 60 cards and future optimizers that might discard apparently useless Mimikyu/Dialga-GX. The defect is strong enough to prioritize for a stateful fixture before comparing candidate win rates.

**Evidence level:** Exact bundled card text + official advanced rulebook + pinned-engine source. No completed game reproducing the failure or implementing a fix yet. Do not claim engine-corrected results until the stateful before/after test is recorded.


## Research-only compatibility candidate and deterministic reducer-level test

The opt-in [Mimikyu non-GX Copycat hook](../../simulation/twinleaf/copycat-compat.cjs) wraps only the actual GRI Mimikyu class's `reduceEffect`. When that specific Pokémon uses Copycat and the opposing player's last declared attack carries the internal `copycatAttack` flag but no `gxAttack` flag, the wrapper temporarily clears the copy flag, delegates to the unmodified Mimikyu handler, and restores the original flag inside a `finally` block. It provides a restore callback and does not mutate the vendored source or globally change other Pokémon's copies.

The [focused test](../../tests/mimikyu_apex_copycat.test.cjs) constructs pinned-engine `State`, `Player`, `PokemonCardList`, `AttackEffect`, `Mimikyu` and `RegidragoVSTAR` objects and substitutes a narrowly scoped fake store observing delegated `AttackEffect` calls. It checks: original engine prematurely rejects; opt-in wrapper reaches the delegate path and restores metadata; GX flagged predecessor remains rejected; uninstall restores baseline behavior. This **is a reducer-level diagnostic**, and the store double does not verify a complete attack with nested target choice, damage, turn skip or legality.

A [manual-only GitHub Actions workflow](../../.github/workflows/mimikyu-copycat-regression.yml) compiles exactly the pinned submodule and invokes this test. As of this write, an actual CI execution has **not** been confirmed. Full gameplay parity remains open, and this hook must remain optional until a complete stateful test passes.


### Pending real-store reproduction

The [nested Copycat/Apex/Timeless-GX fixture](../../simulation/twinleaf/mimikyu-apex-integration.cjs) builds actual pinned Store/State/Player and attack-prompt objects, injects the preceding Apex Dragon and a discarded Dialga-GX, contrasts unpatched and opt-in hooked behavior, and requires 150 damage, usedGX, and usedTurnSkip after selecting Timeless-GX. This test deliberately bypasses ordinary Energy/setup, and **no passing CI run is yet confirmed**.

The [manual workflow](../../.github/workflows/mimikyu-copycat-regression.yml) compiles the exact pinned engine and runs both reducer-level and nested stateful tests. Independently, Agent 12's [Apex Dragon -> Dratini contract](../../simulation/twinleaf/apex-copy-contract.cjs) passed [manual CI 38822490362](https://github.com/FlareZ123/experiment-01/actions/runs/38822490362), supporting the fixture construction pattern.
