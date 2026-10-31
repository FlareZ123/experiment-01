# Rank-1 Mimikyu Copycat: missing last-turn timestamp in pinned native engine

**Agent 8 | 31 October 2026 | evidence: exact published source print, pinned engine source inspection, unexecuted two-seat native regression.** No claim of a competitive game or empirically confirmed incorrect native result.

## Revision after cross-agent repository audit: repair already exists

**Correction (same invocation):** The research repository already contains `simulation/twinleaf/last-attack-pass-hook.cjs::installPassClearsLastAttackHook`, a source-preserving, opt-in research-side repair of **exactly this stale `playerLastAttack` bug**. `simulation/twinleaf/headless.cjs` imports it, activates it only when `passClearsLastAttackCorrection:true`, and enforces that flag in its existing Mimikyu Apex/Timeless counterpolicy preflight. Other historical project work has therefore independently identified and repaired the failure mode. My contribution is a new **raw-pinned regression and opt-in-coverage audit**, not discovery of a previously unrecognized mechanic or a need to invent an additional hook.

The staged new native test imports `headless.initializeCards` but does not invoke the full headless match runner with the pass-clear opt-in, so it tests **unhooked pinned Store behavior**. It must gain a second explicitly hooked control before it can qualify the installed correction. The test remains unexecuted in compiled CI. Preserve the existing opt-in flag and repaired match comparisons; do not overwrite or duplicate the already established hook.

## Authenticated tournament exposure

The original `results/aichi-2026/full-decklists.json` records **Mimikyu GRI 58** in exactly two of the 29 authenticated final-source sixty-card lists: **rank 1 champion** and **rank 30**, one copy in each. Its printed **Copycat** attack costs one Psychic plus one Colorless and reads: *If your opponent's Pokémon used an attack that isn't a GX attack during their last turn, use it as this attack.* This is a tactical counter-line: its eligibility is a function of the opponent's *immediately preceding turn*, even if the opponent's current Active is no longer the attacker.

## Pinned source-level error path

At pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`:

1. `ptcg-server/src/sets/08-sun-and-moon/set-guardians-rising/mimikyu.ts` calls `COPY_OPPONENTS_LAST_ATTACK` for Copycat.
2. `ptcg-server/src/game/store/prefabs/attack-effects.ts::copyOpponentsLastAttackGenerator` obtains `state.playerLastAttack[opponent.id]`, rejects copycat/GX, then delegates the stored attack; it does **not** inspect when the attack occurred.
3. `ptcg-server/src/game/store/reducers/player-turn-reducer.ts` updates `state.playerLastAttack[player.id]` on **AttackAction**, while **PassTurnAction** only resolves `EndTurnEffect`.
4. `ptcg-server/src/game/store/state/state.ts` stores that last attack with `{attack,sourceCard}`, lacking a turn number; `game-phase-effect.ts::initNextTurn` resets movement history and starts the new turn, with no corresponding removal of `state.playerLastAttack`.
5. A repository-wide source search for `playerLastAttack` located no reset on PassTurn or new turn. Other consumers intentionally read persistent last-attack information, so a blanket state reset might break their mechanics. There is also a separate copied-attack delegation reducer that writes this map.

**Source-derived hypothesis:** if player A uses a non-GX attack on turn T, B passes on T+1, A passes on T+2, and B uses Mimikyu Copycat on T+3, the native last-attack map may still supply the stale T action even though printed Copycat should do nothing. This is a specific falsifiable implementation concern, not a verified reproduced bug until actual native Store execution.

## Two-seat executable regression

`tests/agent8-copycat-stale-last-turn-native.test.cjs` committed as [e325d228](https://github.com/FlareZ123/experiment-01/commit/e325d22856c1efcdd3e49f57b429dd0bdb053017). It stages two actual physical seats with owner Venonat's funded **Gnaw** and opposing Mimikyu GRI with two Psychic Energy. The native control has Copycat immediately after Gnaw; the contrasted arm inserts a genuine opponent Pass and owner Pass, then uses Copycat. It resolves real Store action and Wait prompts and compares native damage. **Not yet run** in the pinned compiled CI; the 10-damage assertion is the hypothesized flawed behavior, not an observation.

The minimal correct-engine expectation is that the immediate Copycat can use Gnaw while the after-Pass Copycat has no eligible preceding-turn attack and therefore should do no copied damage. If the actual Store automatically resets the map elsewhere or rejects the stale action, the hypothesis is falsified and the regression should be updated rather than forcing a bug conclusion.

## Independent model implication

The research-side `simulation/twinleaf/actor-observation-contract.cjs` omits public `lastOpponentAttack` event identity and its turn. As a result, even after the engine bug is resolved, an owner-information-safe decision policy cannot value the exact rank-1 Mimikyu Copycat counter-line from its detached observation alone. Add a turn-stamped last-opponent-attack public receipt only through the authenticated Store observer, and preserve source attribution without inspecting concealed zones. Do not copy a historically older attack merely because it is the last stored attack.

This requires a narrow research-owned Twinleaf compatibility **hook** if the native bug is confirmed; never patch upstream submodule in place, per the project rules. Any native fidelity repair must be regression-tested on both physical seats and across supported copied-attack cards. Full existing strict physical-zone, policy, source-list and paper-clock qualification gates remain applicable.

**Benchmark status:** 29/32 original 60s, missing ranks 23/25/28, zero competitively qualified games, no evidence-backed 99.5% final deck.
