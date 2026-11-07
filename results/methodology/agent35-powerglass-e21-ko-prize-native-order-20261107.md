# Agent35: isolated native Powerglass E-21 ordering mismatch and scoped research correction

**7 November 2026 | Pinned Store rules-fidelity investigation | Original native observation, independent paper-rule adjudication, and reversible research-side correction.**

## Original reproducible native observation

The independent [genuine pinned-Store probe](../../simulation/twinleaf/agent35-powerglass-ko-prize-order-native.cjs) ran successfully in [CI 42344386817](https://github.com/FlareZ123/experiment-01/actions/runs/42344386817), job **isolated-store-rule-order**, against Twinleaf pin **a9905a76a6c4103ba4b6cb9a49e86bad795c5c05**, without bot policy wrappers. It created a public legal-shape battle state: acting Active **Unown AOR** with one Basic Psychic attached and genuine played **Powerglass SFA**, original opponent Active **Trubbish FST** with 60 damage on 70 HP, and an opponent Benched **Tapu Lele-GX** available to promote. Six face-down Prizes remained on each side. It submitted an actual Store **AttackAction Hidden Power** for 10 damage, then resolved only a native WaitPrompt to inspect the first substantive prompt.

The returned live Store output is:

- Real pending prompts observed in order: **WaitPrompt, AttachEnergyPrompt**.
- **First choice-requiring prompt: AttachEnergyPrompt**, for the end-of-turn Powerglass effect.
- Source Active Pokémon after the attack: **null** (the damaged Trubbish is already physically removed).
- Attacking owner remaining Prizes: **6**. Defending opponent remaining Prizes: **6**. No Prize has yet been selected.
- Diagnostic **PowerglassBeforePrize = true**.
- All actions were actual compiled pinned Store actions. The staged simulation is neither a full game nor a win.

The same interleaving occurs in the independent natural registered rank11 versus New Moon replay [CI 42343871719](https://github.com/FlareZ123/experiment-01/actions/runs/42343871719): candidate **Attack107 → Wait108 → Powerglass AttachEnergy109 → ChoosePrize110 → opposing promotion111**. At that time original defending Trubbish has already left Active, and the candidate still has six Prizes. The game subsequently resolves the candidate's genuine one-Prize Knock Out successfully.

## Paper-rules interpretation and native implementation cause

The supplied *Advanced Player's Rulebook* v3.4 lays out attack resolution at A-01: step 7 checks for Knock Outs after damage and outside-damage effects. Section D's Knock Out procedure includes taking Prize cards in step 4. Section **E-21, End of the turn**, places end-turn effects after an attack has been completed, before Pokémon Checkup, and explicitly includes Powerglass even when no attack was declared.

Agent37 independently adjudicated this exact chronology against the supplied rulebook in [the Powerglass post-KO Prize-order report](agent37-powerglass-postko-prize-rule-order-adjudication-20261107.md). The rulebook-supported order for the tested ordinary KO is **KO, Prize selection and promotion, then E-21 Powerglass**. The original pinned Store presents the Tool's owner-discard AttachEnergyPrompt before Prize-choice and promotion. This is a specific, repeatable paper-order discrepancy in the tested scenario, rather than a card-strength or matchup conclusion.

Agent37's pinned-source inspection identifies the cause: `useAttack()` emits `EndTurnEffect` at attack completion, and the pinned turn reducer applies the Tool's end-turn effect before calling `checkState()` to settle pending KO, Prize, promotion, and game-end prompts. Agent37's independent [winning-KO terminal probe](agent37-powerglass-winning-ko-terminal-early-e21-native-20261107.md) also found that the unmodified Store offers a selectable Powerglass prompt before resolving the winning Prize or empty-board terminal condition.

## Reversible research-side correction and validation

The non-vendor adapter is [`withPaperKoBeforeEndTurn`](../../simulation/twinleaf/agent37-paper-ko-before-endturn-hook.cjs). It temporarily intercepts `Store.prototype.reduceEffect` for an `EndTurnEffect` emitted during the `ATTACK` phase, settles the actual pinned native `checkState(store,state,onComplete)` KO/Prize/promotion chain first, then applies the original end-turn reducer. If that settlement has already finished the game, it suppresses the optional post-win E-21 action. The original method descriptor is restored in `finally`; normal `PLAYER_TURN` end-turn effects remain untouched. No upstream Twinleaf file was modified.

Agent37's [full native A/B report](agent37-paper-ko-before-endturn-native-two-seat-20261107.md) records successful manual CI **42347637304** against the same pinned engine. It covered six conditions in both physical actor seats, **12 fully settled A/B pairs**:

1. Pass without an attack: ordinary E-21 Powerglass remains active.
2. Non-KO Hidden Power: no Prize is taken and Powerglass attaches normally.
3. Ordinary one-Prize KO: baseline order is Energy, Prize, promotion; hook order is Prize, promotion, Energy. Both final states match.
4. Three-Prize TAG TEAM KO: all three Prizes and promotion precede the Powerglass attachment under the hook.
5. Last-Prize KO: the winning Prize resolves before E-21, and no post-win Powerglass prompt is offered.
6. Last opposing Pokémon KO: the KO/Prize terminal condition resolves before E-21, and no post-win Tool prompt is offered.

The fixtures use genuine native Store actions, physical CardList/PokémonCardList/Energy objects, actual prompt resolution, Prize transfers, promotion, and final-state assertions. The result is a bounded engine-fidelity regression, not a full-game paper certification.

## Scope, status, and next work

- Keep the hook **opt-in**. It is not integrated into the selected v8 developmental common policy and does not qualify any complete game.
- Broader tests still matter for simultaneous KOs, additional end-turn cards, attack effects that place damage counters, effect-specific exceptions, and complete policy/clock behavior.
- The original native finding remains reproducible and is preserved as the unpatched control. Do not rewrite its receipt as though the hook changed upstream Twinleaf.
- The simultaneous final-Prize tie resolver is a separate paper-fidelity issue. Its v3 regression is tracked in [Agent37's terminal-resolution report](agent37-simultaneous-last-prize-tie-order-20261107.md).
- The stage still has **zero competitively qualified games**, no selected final fixed 60, and no demonstrated 99.5% Aichi Top 32 win rate.

Related [Agent35 full Powerglass payoff and root-cap report](agent35-v9-powerglass-actual-prize-root-cap-20261107.md). Shared Aichi field status remains 29/32 authenticated original name/count inventories, with ranks 23, 25, and 28 missing.


## Integrated current-main regression suite

At Agent37's request, I reran the existing manual-only `.github/workflows/agent35-powerglass-ko-order-native.yml` after the later terminal-resolver v3 changes. **Run [42396818544](https://github.com/FlareZ123/experiment-01/actions/runs/42396818544), run 31, completed successfully** on 7 November 2026 at 17:34 UTC, main head `9b3c6742ec29221010b47d28288f0e1b9b8a3252`. The actual submodule pointer at that head is `vendor/twinleaf` commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

Checkout, direct submodule restoration, pinned Store compilation, the original Agent35 isolated E-21 observation, and all 11 subsequent Agent37 native/pure regression steps passed. The suite includes the v3 simultaneous last-Prize resolver matrix, simultaneous-KO promotion ordering, Powerglass/KO ordering and full physical settlement, scoped Store isolation/restoration, Technical Machine E-21 custody, Eon Blade retreat reset, and public attack-settlement identity tests. All 16 execution steps were successful.

This closes the requested **integrated workflow validation** for the current v3 test suite. It does not broaden the hook's explicitly tested rule scope, certify a complete paper game, select a deck, or change the zero-qualified-game status. Keep all research-side corrections opt-in until the common release receives its own acceptance review.
