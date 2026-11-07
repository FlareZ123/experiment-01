# Agent37: reversible pinned Store hook orders KO/Prize before Powerglass in both seats

**7 November 2026. Actual compiled headless Store A/B with physical prompt settlement; tested native scope, no paper-certified competitive matches.**

**Extended acceptance:** [CI 42347637304](https://github.com/FlareZ123/experiment-01/actions/runs/42347637304), job **128328735208**, **passed six native scenario types in both physical seats, twelve full baseline/treatment pairs**. This later run supersedes the earlier eight-pair coverage and adds the real pass-without-attack E-21 case and a three-Prize TAG TEAM KO. The original pinned Store remains untouched and every prompt chain fully settled.

## Motivation and governing rules

The supplied **Advanced Player's Rulebook v3.4** §A-01 resolves an attack through its Knock Out check; §D's KO procedure includes the Prize-taking step; §E resolves the game as soon as the last Prize is taken or a player has no Pokémon in play; §E-21 places the optional Powerglass attachment at end of turn **after the attack has completed**. [The independent original-artifact paper-order audit](agent37-powerglass-postko-prize-rule-order-adjudication-20261107.md) and [the two terminal Store counterexamples](agent37-powerglass-winning-ko-terminal-early-e21-native-20261107.md) established that the unmodified pinned engine offered a selectable `AttachEnergyPrompt` before a KO's Prize selection or a resulting game end.

At the pinned `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` upstream source, `game-effect.ts`'s `useAttack()` invokes `EndTurnEffect` at its conclusion. `game-phase-effect.ts` handles that turn-ending effect, including attached Tool effects, **before** it calls `checkState()` to settle pending KO/Prize/Active and game-end prompts. The source structure explains the observed ordering without requiring an invented card effect.

## Reversible research-side intervention

[`simulation/twinleaf/agent37-paper-ko-before-endturn-hook.cjs`](../../simulation/twinleaf/agent37-paper-ko-before-endturn-hook.cjs) installs a **temporary Store.prototype.reduceEffect interception** for `EndTurnEffect` when the game phase is `ATTACK`. It first executes the pinned native `checkState(store,state,onComplete)`, preserving prompt callback continuations. Once the native KO/Prize/promote chain completes, it invokes the original EndTurnEffect reducer. If the native KO has already marked the game `FINISHED`, it suppresses that optional end-of-turn action. The original method descriptor is restored in `finally`, and each fixture asserts restoration. The vendor submodule is unchanged. Regular `EndTurnEffect` in the `PLAYER_TURN` phase is untouched.

This is a candidate paper-order adapter hook with intentional opt-in. It has not undergone the full rules/regression coverage required to deploy into the common competitive policy.

## Executed native A/B experiments

The original physical fixture: one actual Store-played **Powerglass SFA** on owner Active **Unown AOR**, one attached Basic Psychic and another in owner discard, attacking opponent Active **Trubbish FST** (70 HP) with **Hidden Power**. A 60-damage precondition makes the 10-damage attack KO; 0 pre-damage provides a no-KO negative control. An opponent Bench includes **Tapu Lele-GX GRI** except in the last-Pokémon terminal case. Both players have populated Prize cards and decks. Native `WaitPrompt`, `AttachEnergyPrompt`, `ChoosePrizePrompt` and `ChoosePokemonPrompt` are resolved using actual physical CardList/PokémonCardList/EnergyCard objects, including Tool Energy transfer and one Prize removal. Every action goes through the pinned Store; no printed attack or Tool handler was replaced.

Test files:
- [Isolated physical fixture and end-to-end prompt-draining recorder](../../simulation/twinleaf/agent37-powerglass-winning-ko-native.cjs).
- [First-choice A/B guard](../../simulation/twinleaf/agent37-paper-ko-powerglass-first-prompt-native.cjs).
- [Full native settlement and winner A/B assertions](../../simulation/twinleaf/agent37-paper-ko-powerglass-full-settlement-native.cjs).
- [Manual-only reproducible workflow](../../.github/workflows/agent35-powerglass-ko-order-native.yml).

**Verified completed CI:** [42347202295](https://github.com/FlareZ123/experiment-01/actions/runs/42347202295), a full-settlement 3-scenario original seat0 comparison, **passed**; [42347358616](https://github.com/FlareZ123/experiment-01/actions/runs/42347358616), job **128327886748**, extended **all four attack scenarios to both physical actor seats**, yielding **eight actual baseline/treatment scenario pairs**, **passed**. Each run built the pinned Store. The latter printed all eight distinct `label + actorSeat` A/B outputs and completed every choice/promotion chain. No fixed deck opponent sample or win-rate statistic is being derived.

## Observed behavior, per physical seat

| Scenario | Original native prompt sequence (choices only) | Research-hook native prompt sequence | Conclusive state |
| --- | --- | --- | --- |
| No KO (opponent Active survives) | Powerglass attach | Powerglass attach | No Prizes taken; second Psychic properly attached |
| Ordinary one-Prize KO, defender has Bench | Powerglass attach → Prize choice → promotion | Prize choice → promotion → Powerglass attach | One Prize taken, Tapu Lele-GX promoted, second Psychic attached; no pending prompts |
| Last remaining Prize, defender has Bench | Powerglass attach, then native automatic final Prize | Automatic final Prize; no Powerglass choice | Correct winner in either seat, zero Prizes remaining, one original Psychic stays attached |
| Knock Out opponent's only Pokémon | Powerglass attach, then native KO/last-Pokémon win | KO and terminal winner; no Powerglass choice | Opponent has no Active or occupied Bench, attacker takes one Prize, winner correctly recorded, one original Psychic stays attached |

For the ordinary KO arm, both A and B finish with the **same Prize count, promoted Active and two attached Psychic Energy**, while B changes choice order to paper-compatible sequence. The terminal arms finish with the **same correct winner** in both A and B; the original unpatched Store permits an additional irrelevant Energy attachment after the already-winning attack, which B suppresses. The hook's terminal callback is invoked once per terminal fixture, its nonterminal callback once per ordinary fixture, and the original prototype descriptor is restored after each synchronous prompt-draining transaction.

All eight paired fixtures are synthetic, intentionally small and highly controlled. They certify direct engine behavior, not player policy or match competitiveness. They do not establish comprehensive cross-effect semantics, simultaneous KO ordering, end-of-turn attacks that place damage counters instead of damage, rule-specific exceptions, tournament setup, or complete Aichi Top 32 coverage.

## Additional validated genuine actions

- **Pass without attacking, both seats:** owner plays actual Powerglass, then real `PassTurnAction`. The research hook observes **zero** attack EndTurnEffect interceptions, leaves the native E-21 event in place, and the native Powerglass prompt transfers the second Basic Psychic in both baseline and treatment. This directly covers the manual's §E-21 statement that end-of-turn effects still activate after passing.
- **Three-Prize TAG TEAM KO, both seats:** source Active `Trevenant & Dusknoir-GX SMP` has printed 270 HP, with 260 preexisting damage. Owner Active Unown AOR's real Hidden Power10 KOs it and awards **three physical Prizes**. With a still-occupied opposing Bench, the pinned baseline selects Powerglass Energy **before** all three Prizes and promotion; the research hook resolves the exact three Prize cards and opponent Active promotion **before** Powerglass. Both final states contain three candidate Prizes remaining and the same two Psychic Energy attached, with all prompts closed.
- **No-KO attack, both seats:** with no prior Trubbish damage, the real Hidden Power attack deals 10 without KO. Both implementations present normal end-of-turn Powerglass and attach Energy, taking no Prize.

The later six-type workflow printed each label twice, once per physical actor seat, and all twelve full settlement assertions passed without a native decoder error. They provide method-level mechanistic evidence, with zero qualified matchup games.

## Separate printed Eon Blade next-own-turn safety regression

[Native CI 42348182264](https://github.com/FlareZ123/experiment-01/actions/runs/42348182264), job **128330396747**, passed the original twelve full native A/B Powerglass pairs **and** [the independent Eon Blade restriction safety test](../../simulation/twinleaf/agent37-eonblade-next-turn-hook-regression.cjs). Using the actual printed **Latias ex SSP** with three physically attached Psychic Energy, owner native Eon Blade does 200 damage to **Mega Absol ex M1L** and ends the turn. The opponent really passes, producing the owner's next turn, where both unpatched and hooked pinned Store reject another Eon Blade with **`BLOCKED_BY_EFFECT`**. The two physical owner-seat contexts preserve the same damage, next-turn prohibition, root prompt pattern, and actual attack rejection; the reversible hook restored its prototype method and its single `EndTurnEffect` interception completed. This confirms a targeted attack restriction safety invariant, and remains separate from the more general rules and competitive policy qualification gates.

## Cautions and next qualification gates

The first-pass audit deliberately stopped at the first substantive prompt and therefore could not by itself verify asynchronous closure. The subsequently green **full physical settlement** test supplies that missing evidence for the eight bounded arms. The expanded validation now covers native passing and a multi-Prize TAG TEAM Knock Out. Further admissibility requires testing simultaneous KOs, attack chains with other pending prompts, multiple card-specific end-turn effects, both sides' Ability locks, and the complete common-policy runner. Deck and field sampling remain independent mandatory requirements. Until then the current shared competitive qualification count remains **zero**, with **29/32** opponent inventories authenticated and no demonstrated 99.5% rate.
