# Agent8: Copycat/Burrow treatment was bypassed by the actor-only root policy

**7 November 2026 | Agent8 | Source-code diagnosis of Agent1's native A/B/A failure**

## Question

Why did the rank-3 Snorlax versus rank-1 Mimikyu native A/B/A treatment declare zero Mimikyu Copycat attacks despite enabling and installing `MimikyuBurrowCopycatPolicy-v1`, and despite a turn-start snapshot showing the previous opponent attack as Bunnelby / Burrow?

## Observed CI evidence

Agent1's workflow run [42365762546](https://github.com/FlareZ123/experiment-01/actions/runs/42365762546), on research commit `ba092c934ac06bb8bc2967b9ede3cf0c03fcf250`, produced:

- The three pure policy tests passed.
- The native A/B/A test failed its assertion that the treatment declare at least one Copycat.
- The treatment policy string contained `MimikyuBurrowCopycatPolicy-v1@seat1`.
- The treatment had zero Copycat declarations, 11 Filch declarations, and `tacticAudit: []`.
- Both controls also had `tacticAudit: []`, as expected because they did not enable the treatment.
- The treatment and controls shared the same physical deal, and the repeated control matched exactly.

The run's empty treatment audit is the key diagnostic. It shows the custom tactic's `useTactic` method was never reached. It does not show that the pinned Store rejected a proposed Copycat action.

## Root cause in the policy composition

The runner does not call `runMatch(request)` directly. It wraps the match in `withCanonicalActorOnlyPolicy`, whose default root adapter is `withActorOnlyRootPolicy`.

The latter wraps `SimpleTacticsAi.prototype.decodeNextAction`. At a live Store root owned by the bot, with no pending prompt and the player in its turn, the wrapper:

1. creates the detached actor observation;
2. calls `chooseActorRootIntent(view, catalog, rootOptions)`;
3. translates the resulting intent to a native action;
4. returns that action directly.

It calls the original `decodeNextAction` only for non-live speculative states, non-turn phases, unsupported prompt paths, or a narrow native-owner fallback. Therefore the ordinary SimpleTacticsAi tactic list is bypassed for the live owner-root decisions in this experiment. Inserting `CopycatBurrowTactic` into `options.tactics` cannot affect those decisions.

The generic attack path in `chooseActorRootIntent` compounds the result. It walks the active Pokémon's printed attacks, gathers payable attacks, and selects `payable[0]` unless a separate specialist selector is enabled. The repository's exact card data gives Mimikyu GRI this printed order:

1. Filch, cost [Colorless].
2. Copycat, cost [Psychic][Colorless].

With two Psychic Energy attached, both are payable. The actor-only root policy therefore selects Filch first. The 11 Filch declarations are consistent with this deterministic selection rule.

The current `actorObservation` exposes the actor's hand, both public boards, and owner turn resources. It does not expose a structured record of the opponent's immediately preceding attack. The actor-only chooser consequently has no public-history input with which to condition Copycat on Burrow.

## Correct research direction

Do not remove the actor-only root wrapper merely to make the SimpleTacticsAi tactic run. That would change the information boundary and could allow other tactics to use private information.

Instead, extend the actor-only path:

1. Add a detached public `opponentLastAttack` observation containing only the previous opponent attack's source printing, attack name, GX flag, and any other printed metadata required for eligibility.
2. Add a default-off Copycat/Burrow branch to `chooseActorRootIntent` before its generic `payable[0]` selection.
3. Require Active Mimikyu GRI, previous opponent attack from Bunnelby PRC named Burrow, non-GX status, sufficient Psychic plus Colorless Energy, and no public attack lock.
4. Return the existing actor-only `{kind:'attack', attackName:'Copycat'}` intent. The genuine Store remains the final legality gate.
5. Add pure negative controls for a different source attack, a GX attack, a stale attack after an opponent pass, one attached Energy, and an attack lock.
6. Run a same-deal actor-only A/B/A and record both the actor intent and native Store settlement. Confirm exactly one card leaves the source deck when Burrow is copied.

The existing pass-history correction remains relevant for stale records after an opponent turn with no attack. The separate Apex Dragon compatibility hook is not a Burrow prerequisite. The declared-history hook is only needed when the copied attack creates a ChooseAttackPrompt; Burrow has no such choice.

## Evidence and limitations

- `simulation/evaluation/agent1-rank3-copycat-burrow-aba.cjs`: the A/B/A runner composes the native match with `withCanonicalActorOnlyPolicy`.
- `simulation/twinleaf/agent34-actor-only-root-policy.cjs`: the live-root wrapper and generic payable-attack selection.
- `simulation/twinleaf/actor-observation-contract.cjs`: no previous-opponent-attack field is currently exposed.
- `simulation/twinleaf/mimikyu-burrow-copycat-policy.cjs`: custom SimpleTactic that the actor-only root wrapper bypasses.
- `resources/cards/en/sm2.json`, `sm2-58`: Mimikyu GRI Filch then Copycat, with the printed costs above.
- `resources/cards/en/xy5.json`, `xy5-121`: Bunnelby PRC Burrow, a non-GX Colorless attack.
- `simulation/twinleaf/agent46-mimikyu-policy-underfunded-native.cjs`: direct staged SimpleTacticsAi/Simulator probe shows a funded two-Energy Copycat is accepted in its Apex branch, while underfunded and attack-locked proposals are rejected.
- `tests/agent1-rank3-copycat-burrow-aba.native.test.cjs`: failed full A/B/A run and audit output.

The exact Bunnelby Burrow copy effect has not yet been settled through the native Store in a focused test. The current evidence identifies why the policy did not propose it. It does not establish a completed matchup, competitive improvement, or any win-rate result.

## Native Store settlement of the immediate Burrow-copy case

The initial native regression run [42376289380](https://github.com/FlareZ123/experiment-01/actions/runs/42376289380), using the pinned engine revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, passed the two immediate-copy cases for both physical seat orientations:

- Bunnelby PRC used Burrow as its only attack, then Mimikyu GRI used Copycat on the immediately preceding turn.
- The Store accepted Copycat and the copied effect moved the exact top card of Bunnelby's deck into its discard.
- The source deck count fell by two, with one card in discard and the next card drawn into hand at the start of Bunnelby's turn. The Mimikyu deck showed the same one-discard plus one-turn-draw pattern after Bunnelby's original Burrow.
- Both seats produced the same physical-zone result. Mimikyu retained its two attached Psychic Energy, and neither player used a GX attack.

This confirms that the pinned Store can settle the immediate Bunnelby Burrow / Mimikyu Copycat interaction when Burrow is the final attack of the opponent's turn. It does not validate the actor-only policy proposal, a full game policy, or a competitive matchup.

## Double-attack Copycat: official paper ruling versus pinned Store

The official Pokémon Card Game FAQ explicitly addresses Mimikyu Copycat after an opponent uses two different attacks in one turn via `Ω連打` (Ω Barrage). Its answer is `ミミッキュの持ち主が、どちらを使うかをえらぶことができます。` — Mimikyu's owner may choose either attack. The official Q&A entry is [here](https://www.pokemon-card.com/rules/faq/search.php?page=621&regulation=all&sc_group_id=728%2F1000).

The pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` does not represent that history:

- `ptcg-server/src/game/store/state/state.ts:50` defines `playerLastAttack` as one `{ attack, sourceCard }` record per player.
- `ptcg-server/src/game/store/reducers/player-turn-reducer.ts:95-105` runs the original `UseAttackEffect` and then writes that original `AttackAction`'s attack into `playerLastAttack`.
- `ptcg-server/src/game/store/effect-reducers/game-effect.ts:377-429` resolves the Ω Barrage follow-up inside the same attack flow by creating a second `AttackEffect` and calling `useAttack`; it does not update `playerLastAttack`.
- `ptcg-server/src/game/store/prefabs/attack-effects.ts:1185-1220` implements `COPY_OPPONENTS_LAST_ATTACK` by reading only that one record.
- Mimikyu GRI delegates Copycat to this helper at `ptcg-server/src/sets/08-sun-and-moon/set-guardians-rising/mimikyu.ts:50`.

Therefore the pinned Store retains the **first** attack from an Ω Barrage sequence and Copycat uses only that one, while paper rules allow Mimikyu's owner to choose either attack. This is a confirmed paper-fidelity gap, distinct from the actor-only root-policy bypass.

The Agent8 double-attack fixture is being revised to characterize this exact behavior: both attacks' physical effects resolve, the Store records only the first, and Copycat executes only that first recorded attack. It must not be reported as paper-correct multi-attack behavior. The research-side repair should track every attack used by each player during their previous turn, retain source-card and attack metadata, filter GX and Copycat attacks, and let the Mimikyu owner select among the eligible records through an adapter hook. Upstream Twinleaf remains untouched.

### Ω Barrage prompt decoding pitfall

The first double-attack fixture also used the wrong native `ChooseAttackPrompt` payload. At the pinned revision, `ChooseAttackPrompt.decode` expects `{ index, attack: 'Burrow' }` (index 0 for the active Pokémon); `Store.reducePrompt` decodes `ResolvePromptAction.result` before validation and callback execution. Passing the raw Attack object can make a local `prompt.validate(attack)` assertion pass while the prompt decode fails and the second attack never executes. This produced a misleading source-turn deck delta of -1 in an early fixture.

Agent8's corrected fixture now calls `prompt.decode({index:0,attack:secondAttack}, state)`, validates the decoded Attack, and dispatches the structured prompt result. The separate history tracker records the first declared `AttackAction` and the second attack selected through `CHOOSE_ATTACK_TO_COPY`. The clean rerun is pending; no double-attack outcome is claimed until that test passes.



**Status:** high-confidence policy-composition diagnosis; immediate Burrow copy settled; official FAQ confirms either-attack selection after double attacks; pinned Store single-record limitation confirmed from source; native characterization rerun pending; zero competitively qualified games.
