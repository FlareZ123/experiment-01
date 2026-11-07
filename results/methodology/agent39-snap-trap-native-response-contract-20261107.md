# Agent39: Snap Trap native response-contract settlement

**Date:** 7 November 2026  
**Pinned Twinleaf:** `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`  
**Test code:** `simulation/twinleaf/agent35/snap-trap-choice-response-contract-native.cjs`  
**Harness correction:** commit `b6b6cea7c5ae58107d155af65ca31f3531debcba`  
**CI run:** [42403132882](https://github.com/FlareZ123/experiment-01/actions/runs/42403132882)

## Result

**PASS: narrow native settlement contract**

The `Agent35 native Snap Trap ChooseCards response contract` step completed successfully in run 42403132882. At the time this note was written (2026-11-07T18:51:39.547Z), the overall workflow was still running later Powerglass/Prize checks; this note makes no claim about the overall workflow conclusion.

## What the test proves

The fixture uses the actual pinned Store and card implementations:

- Owner Active: Galarian Stunfisk SSH with the Snap Trap power.
- Attacker Active: Marshadow UNB with Red Knuckles (10 damage) and two Psychic Energy.
- The test dispatches a genuine AttackAction.
- The pinned attack generator pauses on its real `WaitPrompt` ("Attack animation") before applying damage. The fixture resolves that prompt using `ResolvePromptAction(waitPrompt.id, null)`; `undefined` is the Store's unresolved sentinel and does not resume the generator.
- After the wait resolves, the positive-damage AfterDamageEffect creates the genuine Snap Trap ChooseCardsPrompt.
- The test-local resolver selects a physical Energy card reference that is present in both the full attacking Active PokemonCardList and its Energy sublist, applies the exact prompt filter/blocked-index rules, calls `prompt.validate`, and returns a `ResolvePromptAction` containing a `Card[]`.
- Hidden-zone identity reads are guarded; public zone counts remain available.
- The test captures the native MoveCardsEffect and checks the attacking Active as source, the attacker's discard as destination, the same physical Energy reference, the Stunfisk/Snap Trap source, and the final board state: selected Energy moved, second Energy and Marshadow remain.

The WaitPrompt ordering was verified against pinned source `ptcg-server/src/game/store/effect-reducers/game-effect.ts`: phase becomes ATTACK before the attack effect; the animation WaitPrompt is yielded before BeforeDoingDamageEffect/DealDamageEffect; resolving it resumes the generator and reaches Snap Trap naturally. No prompt was injected or fabricated.

## Limitations

This is a narrow native rules/response-contract result. It does **not** establish:

- the Prism Star Energy destination exception;
- both-seat or broad board-state coverage;
- general-purpose prompt-resolution quality;
- a production policy improvement;
- any competitive matchup or win-rate result.

Agent12 identified Beast Energy ◇ (`sm6-117`) and Super Boost Energy ◇ (`sm5-136`) as Expanded-legal Prism Star Energy candidates for a separate test. Beast Energy is a clean next case: it still pays Colorless for Red Knuckles, but Snap Trap should route the selected physical card to the Lost Zone rather than discard. Keep that as a separate assertion so the ordinary Psychic Energy positive case remains clear.

The phase-A source/zone join is separate evidence: Agent12's v7 diagnostic [run 42402401871](https://github.com/FlareZ123/experiment-01/actions/runs/42402401871) identifies the same Galarian Stunfisk/Snap Trap source, the attacking Active PokemonCardList as the prompt's parent list, and the Energy sublist as the selectable subset. This settlement test proves one native response and movement path; it does not retroactively turn the phase-A diagnostic into a completed game.

## Next action

Add and run the distinct Beast Energy ◇ Lost Zone case, then join the two native settlement cases with the v7 source/zone/quarantine evidence in a new, explicitly versioned candidate runner. Keep frozen v10/v10b registrations unchanged. No competitive inference is justified from this test alone.
