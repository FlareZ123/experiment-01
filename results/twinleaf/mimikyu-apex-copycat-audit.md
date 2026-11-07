# Pinned Twinleaf copy-of-copy conflict: Mimikyu GRI 58 vs Regidrago VSTAR

**Initial audit: Agent 7, 15 October 2026. Current status: 7 November 2026.** The staged two-seat native Copycat/Apex/Timeless line and a constructed original-60 two-Knock-Out sequence have since been reproduced with opt-in research hooks. Full natural shuffled-60 games remain untested, these hooks remain outside the selected v8 policy, and zero competitive games qualify. The October pending-test statements below are historical and are superseded by the November synthesis at the end. This remains a simulation-validity and matchup-research issue, not a win-rate claim.

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


### Historical October pending real-store reproduction plan (superseded 7 November)

The [nested Copycat/Apex/Timeless-GX fixture](../../simulation/twinleaf/mimikyu-apex-integration.cjs) builds actual pinned Store/State/Player and attack-prompt objects, injects the preceding Apex Dragon and a discarded Dialga-GX, contrasts unpatched and opt-in hooked behavior, and requires 150 damage, usedGX, and usedTurnSkip after selecting Timeless-GX. This test deliberately bypasses ordinary Energy/setup, and **no passing CI run is yet confirmed**.

The [manual workflow](../../.github/workflows/mimikyu-copycat-regression.yml) compiles the exact pinned engine and runs both reducer-level and nested stateful tests. Independently, Agent 12's [Apex Dragon -> Dratini contract](../../simulation/twinleaf/apex-copy-contract.cjs) passed [manual CI 38822490362](https://github.com/FlareZ123/experiment-01/actions/runs/38822490362), supporting the fixture construction pattern.


## Historical pinned-engine CI result, 15 October 2026 (superseded by November native tests)

[First manual run 38823906814](https://github.com/FlareZ123/experiment-01/actions/runs/38823906814) compiled the pinned Twinleaf submodule successfully. All **five** reducer-level regression checks passed, proving the original copy-tag rejection, the opt-in Apex-only hook's ability to reach delegated attack logic, preserved GX exclusion and reversibility.

The subsequent **actual Store/State nested attack fixture failed**: with the opt-in hook, selecting Dialga-GX's Timeless-GX from Mimikyu's discard gave the opponent 150 damage, but the player's `usedGX` remained false (assertion at `mimikyu-apex-integration.cjs:93`). The assertion of `usedTurnSkip` was never reached, so the additional-turn effect remains unmeasured. This is direct computational evidence that the isolated hook has **not** restored full copied attack semantics. It is inappropriate to enable it in matchup research yet. The failure could be a nested engine delegation defect or an isolated reducer-fixture lifecycle artifact; further trace instrumentation and fully declared attack-state regression are required.

A subsequent optional-diagnostics run was dispatched after instrumenting the nested Dialga reducer entry/exit and marker state. Official Pokémon [Expanded-format strategy analysis](https://www.pokemon.com/uk/features/a-deep-dive-into-the-2025-pokemon-tcg-expanded-format) independently describes Timeless-GX as a once-per-game extra turn attack and explicitly cites Regidrago's Apex Dragon copying it. The expected GX accounting remains a rules matter pending precise copy-specific ruling.


## 7 November 2026 synthesis: the conditional Copycat line is native-reproduced, natural access remains unproven

### Paper and engine semantics

The original rank-1 Shadow Rider 60 contains one Mimikyu GRI 58, one Dialga-GX UPR 100, one Radiant Eternatus CRZ 105, and two Lillie's Clefairy ex JTG 56. Regidrago VSTAR's Apex Dragon is a non-GX attack. Mimikyu's Copycat costs Psychic plus Colorless and permits copying a preceding non-GX attack. Advanced Player's Rulebook C-18 says that when an attack is used "as this attack", unless specified otherwise, the user can perform the chosen attack's effects and damage even without the Energy required for the chosen attack's cost. Mimikyu therefore pays Copycat's own two-Energy cost; it does not pay Apex Dragon's Grass/Grass/Fire cost or the nested Timeless-GX and Power Beam costs. The staged original-60 line uses Dialga-GX for Timeless-GX, Radiant Eternatus for Power Beam, and Lillie's Clefairy ex's Fairy Zone to make the opposing Dragon Pokémon weak to Psychic. The resulting Psychic Copycat attacks double the printed 150 Timeless-GX damage to 300 and 200 Power Beam damage to 400. Timeless-GX grants the extra turn, and the official FAQ says that extra turn does not reset the opponent's preceding attack memory, permitting the second Copycat. The complete line requires Mimikyu active with Copycat's cost, Dialga-GX and Radiant Eternatus in the user's discard, at least one Clefairy ex in play, the opponent's Apex Dragon in last-attack history, and the user's GX allowance unused.

Pinned Twinleaf had two distinct mismatches in this line:

1. The raw `playerLastAttack` record could contain the nested chosen attack, Overclock, instead of the declared Apex Dragon. The opt-in `copycat-declared-history-hook.cjs` preserves the printed declared attack history after the native choice prompt.
2. The raw Mimikyu Copycat helper rejected any previous attack carrying `copycatAttack:true`, which also blocked the non-GX Apex Dragon. The opt-in `copycat-compat.cjs` narrows that gate for Mimikyu and retains the GX exclusion.

The current compiled evidence is materially stronger than the original October reducer-only diagnosis:

- [Agent46's actual two-seat native Copycat/Apex history test](../methodology/agent46-copycat-real-apex-history-paper-hook-two-seat-20261107.md) uses a genuine preceding Regidrago Apex Dragon, a real ChooseAttackPrompt selecting Dialga-GX Overclock, and a subsequent Mimikyu Copycat. Both physical owner seats reproduce the copied Timeless-GX effect, 150 damage, `usedGX:true`, and `usedTurnSkip:true`, with no unresolved prompts or native errors.
- [Agent46's original-60 A/B comparison](../methodology/agent46-original60-copycat-real-apex-unpatched-vs-paper-bothseats-20261107.md) preserves both authenticated original 60-card inventories and a genuine preceding Apex action. On a deliberately constructed, already-funded board, the unpatched branch produces no Copycat damage or payoff. The two-hook branch copies Timeless-GX for 300 damage and two Prizes, then uses the bonus turn to copy Power Beam for 400 damage and two further Prizes in both physical seats.
- [The physical custody ledger](../methodology/agent46-original60-rank1-rank10-copycat-apex-physical-ledger-20261107.md) accounts for 60 distinct original-owner card objects in every reported zone checkpoint across both physical seat orientations. It is a constructed midgame state, not a natural shuffled game.
- [The spent-GX control](../methodology/agent46-mimikyu-apex-spent-gx-prompt-choice-20261107.md) shows that an already-spent GX allowance blocks the copied Timeless-GX payoff. The native prompt still exposes the unusable choice repeatedly, while choosing non-GX Shred deals 80 damage. The specialized `mimikyu-counter-policy.cjs` already guards the spent-GX Timeless branch.

The [official Japanese Timeless-GX FAQ](timeless-bonus-turn-copycat-ruling.md) also says an extra turn does not reset the opponent's preceding attack memory. That supports the proposed second Copycat during the bonus turn. It does not establish that the player can naturally assemble the required cards or win the game.

### Natural-access constraints

The opening-zone work quantifies necessary card-location constraints:

- [Agent6's exact 27-location model](../aichi-2026/2026-11/agent6-copycat-27-location-opening-frontier-20261107.md) gives a **2.366909%** immediate Prize-only cut for the Mimikyu/Dialga pair with one Hisuian Heavy Ball, conditional on a legal initial seven. This is the event where one Heavy Ball cannot recover the required Basic cards because of the specific Prize placement.
- [Agent46's independent four-Basic extension](../methodology/agent46-champion-four-basic-heavyball-legal-opening-prize-frontier-20261107.md) raises the necessary pre-Prize obstruction to **4.6811456582%** when the line also requires Radiant Eternatus and at least one of two Clefairy ex. This assumes optimistic Heavy Ball recovery capacity. It is a physical-location ceiling, not a successful-line probability.
- [The earlier 24-attempt native A/B/A observer](../aichi-2026/2026-11/agent6-copycat-24triad-native-opening-zone-proof-20261107.md) captured a stable pre-action turn-one frame after setup. Its eight B snapshots showed no Mimikyu in the opening/field zone, Dialga-GX Prized in four, and Heavy Ball Prized in two. This is a post-setup location snapshot, not the original seven-card hand. It should not be used as a direct starting-seven probability estimate.
- [The subsequent preregistered exact-seven A/B/A observer](../aichi-2026/2026-11/agent6-copycat-exact-seven-native-A-B-A-20261107.md) captured the source owner's first seven at the first genuine `CHOOSE_STARTING_POKEMONS` prompt, before starting Pokémon placement, then joined that receipt to the six face-down Prizes at the first stable turn-one root. In its eight B captures: Mimikyu was 1 in the original seven, 1 Prized, and 6 in deck; Dialga-GX was 3 in hand, 0 Prized, and 5 in deck; Heavy Ball was 1 in hand, 1 Prized, and 6 in deck; Forest Seal Stone was 0 in hand, 1 Prized, and 7 in deck. A versus A-repeat roots were identical 8/8, B versus A matched root/status/outcome 8/8, and physical-deal identities matched 8/8. Three of 24 native attempts reached a native terminal and 21 hit the 96-root cap. None qualified as a competitive paper game. The capture is first-attempt based, so source mulligan histories must be cross-checked before treating these as accepted legal sevens. Eight samples are not a probability estimate.
- [The Prize-progression recovery model](../aichi-2026/2026-11/agent6-copycat-prize-cut-recovery-by-awards-20261107.md) shows the pair-only 2.366909% structural cut falls to 1.596674% after one random Prize award, 0.969245% after two, 0.490243% after three, and 0.165288% after four. It is guaranteed to clear by the fifth random Prize award. This assumes unobserved uniform Prize order and no additional Prize exchange or retrieval. It says nothing about whether the opponent can take those Prizes in time or whether the recovered cards can be used.
- [The Forest Seal Stone route analysis](../aichi-2026/2026-11/agent6-copycat-star-alchemy-firsthand-physical-route-20261107.md) identifies a possible physical connector: Star Alchemy can search the draw deck for Heavy Ball when an eligible Pokémon V carries Forest Seal Stone. For the champion's 14-Basic/3-Shadow-Rider-V list, 14.383282% of valid openings have exactly one core Basic Prized while Heavy Ball remains in deck. Within that event, 4.075146% of openings have both Forest Seal Stone and a Shadow Rider V in the original seven, or 0.586140% of all valid openings. This is one possession prerequisite, not an overall rescue probability. It also requires a usable Tool slot, an eligible V in play, an unspent VSTAR Power, Item use, and a viable turn sequence.

The original rank-1 60 also contains four Mysterious Treasure, four Fog Crystal, one Quick Ball, one Battle Compressor, one Hisuian Heavy Ball, and one Forest Seal Stone. The local Expanded card pool text gives the access roles: Mysterious Treasure discards a hand card and searches a Psychic or Dragon Pokémon; Fog Crystal searches Psychic Energy or a Basic Psychic Pokémon; Quick Ball discards a hand card and searches any Basic Pokémon; Battle Compressor discards up to three cards from the deck; Heavy Ball exchanges one Basic from the Prizes into hand; Forest Seal Stone's Star Alchemy searches any deck card when attached to a Pokémon V. Mimikyu and Clefairy ex are Psychic, while Dialga-GX and Radiant Eternatus are Dragon, so all four required Pokémon can be searched by Mysterious Treasure. Mysterious Treasure can also discard Dialga-GX or Radiant Eternatus from hand while searching another needed Pokémon. Battle Compressor can put either Dragon into the discard directly from the deck. Quick Ball is a separate any-Basic route. These routes show why starting-zone cuts are not overall line-assembly probabilities. They also impose sequencing, discard, Item, Tool-slot, and once-per-game VSTAR opportunity costs.

[Agent6's min-cut and field-budget analysis](../aichi-2026/2026-11/agent6-champion-copycat-two-basic-prize-mincut-20261107.md) estimates that the Regidrago label appears in 11/32 field entries, with nine complete original 60s and two incomplete entries. Under the extreme hypothetical that every other matchup is a win, a uniform 99.5% aggregate still requires at least **98.5455%** wins against Regidrago. If every 2.3669% pair-only Prize-cut case were an automatic loss, the field ceiling would be **99.186375%** under that same hypothetical. Applying the same intentionally pessimistic assumption to the four-Basic 4.6811456582% obstruction gives a 98.39085618% aggregate ceiling. This second calculation also treats inability to execute the exact line as a full-game loss, which has not been demonstrated. The Prize cut is not an automatic loss, and the pair-only cut also declines rapidly under the random-award model above. The 99.186375% sensitivity bound treats the initial cut as a full-game loss in every affected game, which is deliberately pessimistic. Neither the actual rescue rate nor the full Regidrago matchup win rate has been measured. These figures are prioritization bounds, not observed results.

### Integration and release status

The research hooks remain opt-in. The shared v8 bilateral policy has not admitted the Mimikyu/Apex correction bundle. A separate headless lifecycle issue was found and fixed: pending end-turn cleanup had been restored after earlier Store dispatch wrappers, leaving Copycat and Pass wrappers installed across matches. The correction restores pending cleanup first, followed by earlier wrappers in reverse installation order. The combined Copycat/Pass/pending regression passed in [manual smoke run 42339130590](https://github.com/FlareZ123/experiment-01/actions/runs/42339130590), with the complete workflow successful. See [the stack-order report](../rules/agent44-headless-store-dispatch-stack-20261107.md).

The source-locked turn-27 setup helper also had an Active-Mimikyu edge case that could emit a `SlotType.BENCH,index:-1` target. It now only prepares a Benched Mimikyu. The pure helper regression passed in [manual smoke run 42341667159](https://github.com/FlareZ123/experiment-01/actions/runs/42341667159), with all 49 workflow steps successful. This does not validate the complete turn-27 Store/prompt sequence or the actor-relative Bench target; see [the active-target guard report](../methodology/agent44-mimikyu-turn27-setup-active-target-guard-20261107.md).

### What this evidence supports

The paper-legal counterline exists as a staged, native-reproduced sequence. The exact engine corrections are isolated, reversible, and tested in both physical seats. The original lists contain the necessary named card roles, and the combinatorial work quantifies some initial Prize obstructions.

The evidence does not establish natural assembly frequency, optimality against an adversarial Regidrago policy, opponent counterplay, official event-clock outcomes, or a competitive win rate. The two-Knock-Out result starts from a constructed midgame board. The 24 native observer attempts are development-only and mostly action-capped. No candidate deck or card count is promoted by these findings.

### Highest-value next experiment

Run a prospectively frozen, natural shuffled original rank-1 versus rank-10 60-card experiment in both physical seats. Keep the original card inventories fixed. Use the actual native Store and an actor-visible policy that does not inspect opponent hidden zones. Record every gate in order: Mimikyu and Dialga location, Heavy Ball access and use, Radiant/Clefairy availability, Energy attachment and Active access, Dialga discard setup, the opponent's actual Apex declaration and selected attack, Mimikyu's Copycat prompt, GX allowance, bonus-turn handoff, second Copycat, Power Beam choice, opponent response, and final game adjudication under the official 25-minute event clock. Register matched A/B/A controls and preserve abort prefixes. Compare the line with alternative rank-1 plans when the required state is absent. Only then can this counterline's practical value against the Regidrago field be estimated.

**Global benchmark status remains unchanged:** 29/32 original opponent inventories are authenticated, ranks 23/25/28 remain unresolved, zero games qualify competitively, no final fixed 60 has been selected, and 99.5% remains unproven.



## Ordinary non-GX Copycat payload: Eon Blade's delayed restriction

A separate both-seat native Store regression now covers an ordinary non-GX donor attack with a next-turn restriction, rather than the nested Apex Dragon case. [Agent46's Eon Blade lock report](../methodology/agent46-mimikyu-copycat-eonblade-next-turn-lock-20261107.md) and [native runner](../../simulation/twinleaf/agent46-mimikyu-copycat-eonblade-lock-native.cjs) use a real preceding Latias ex SSP Eon Blade, then promote the same physical Mimikyu GRI from Bench and execute Copycat. Eon Blade deals 200 damage; the copied effect arms the physical Mimikyu's `cannotAttackNextTurn` flag, the flag remains after the opponent passes, and both a repeated Copycat and the different Filch attack are rejected on Mimikyu's next own turn with `BLOCKED_BY_EFFECT`.

Both physical seats pass. Baseline, declared-history-hook-only, Apex-compatibility-hook-only, both-Mimikyu-hooks, and complete four-hook headless runs are identical for damage, declared history, active identity, and lock. The copied payload is Eon Blade, while the declared last-attack record remains Copycat by Mimikyu. The Copycat sequence creates only WaitPrompt animations and no ChooseAttackPrompt, so the declared-history hook has no action to repair in this case. The compatibility hook is explicitly scoped to Mimikyu copying Regidrago VSTAR's Apex Dragon and does not match Latias ex Eon Blade. In the complete headless set, the pass-clears-last-attack hook clears the opponent's stale Eon Blade record after its subsequent pass, while the Mimikyu lock remains active.

The initial step passed in [manual workflow 42357724295](https://github.com/FlareZ123/experiment-01/actions/runs/42357724295); the expanded full-headless-hook version passed in [manual workflow 42359221578](https://github.com/FlareZ123/experiment-01/actions/runs/42359221578); the final version with both Copycat and Filch rejection passed in [workflow 42360765987](https://github.com/FlareZ123/experiment-01/actions/runs/42360765987), using pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. This closes the specific question of whether the donor's delayed attack lock transfers to Mimikyu in this staged case. It does not establish natural access, a full paper game, or any competitive matchup result; qualified games remain zero.



## Automated-player legality gate for the specialized Apex Copycat tactic

The policy's specialized `CopycatApexTimelessTactic` does not check attached Energy in its own situation predicate. This is safe at the final action boundary in the pinned `SimpleTacticsAi`: the bot asks the tactic for an action, then validates that action through `isValidAction`, which dispatches it in a `Simulator` and rejects exceptions before returning it. [Agent46's native policy test](../methodology/agent46-mimikyu-policy-underfunded-copycat-20261107.md) instruments the actual tactic and tests both seats. With the visible Apex/unused-GX/Dialga-discard conditions held true, one Psychic Energy produces a proposed but rejected Copycat; the final bot action matches the unmodified bot. With two Psychic Energy and the next-turn lock set, the tactic still proposes Copycat, but the Simulator rejects it with `BLOCKED_BY_EFFECT` and the final action again matches the unmodified bot. With two Psychic Energy and no lock, Copycat passes validation and is selected. The initial [runner](../../simulation/twinleaf/agent46-mimikyu-policy-underfunded-native.cjs) passed in [manual workflow 42358715870](https://github.com/FlareZ123/experiment-01/actions/runs/42358715870); the expanded locked-branch policy step passed in [workflow 42360502325](https://github.com/FlareZ123/experiment-01/actions/runs/42360502325).

This closes the concern that the custom tactic can return an underfunded or attack-locked Copycat as the bot's chosen action. It can still spend an unnecessary speculative simulation because its situation predicate does not inspect attached Energy or the next-turn lock. Local predicates could improve efficiency, while the common validator preserves correctness in the tested cases. The board and previous Apex attack are staged, so this is policy-dispatch validation only; it adds no competitive game or win-rate evidence.



The full `headless.cjs` integration additionally refuses to enable the Apex Copycat policy unless all four compatibility/history/pass-clearing flags are explicitly enabled, then restores those hooks after the run. The existing [headless hook-options regression](../../tests/mimikyu-headless-hook-options.test.cjs) covers that fail-closed dependency contract; Agent46's new underfunded-policy test isolates the independent SimpleTacticsAi legality gate.



Agent37's separate [archived Eon Blade chronology](../methodology/agent37-v8-latias-eonblade-turnrestriction-archive-audit-20261107.md) records original Latias ex using Eon Blade on alternate turns after intervening PassTurnAction turns, consistent with the one-own-turn restriction lifecycle. That archive concerns the original attack, while the present native test directly checks Mimikyu's copied lock on its immediately following own turn.



The separate Agent3 direct-injection Eon Blade lock fixture also passes after its native attack-cost assertions were corrected to use `CardType` enum values; it ran as step 23 in [manual workflow 42361499358](https://github.com/FlareZ123/experiment-01/actions/runs/42361499358). This is a lower-cost staged-history cross-check alongside Agent46's real preceding AttackAction sequence.



The consolidated [manual regression workflow 42361499358](https://github.com/FlareZ123/experiment-01/actions/runs/42361499358) passed the full-headless Copycat/Filch sequence, Agent3's corrected direct-injection fixture, and the underfunded/attack-locked/funded SimpleTacticsAi legality test in one pinned-engine build.



Event-incidence boundary: Agent3's [v29 registered-trial scan](../methodology/agent3-v29-public-preattack-board-physical-root-join-20261107.md) found four accepted Eon Blade attacks, all direct Latias ex SSP declarations, and zero delegated Mimikyu GRI Copycat -> Eon Blade events. The tests above are staged rule and policy-legality witnesses; they do not show this Copycat sequence occurred naturally in the registered trial.
