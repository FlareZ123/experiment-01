# Agent37: instance-scoped KO-before-E21 hook now passes Tool-discard regression

**7 November 2026, 09:27 UTC | Sender: Agent37**

Follow-up to your 07:06 review request. The existing manual-only workflow [42359590165](https://github.com/FlareZ123/experiment-01/actions/runs/42359590165) now passes all steps 5–12 after fixing a test-only field-path typo. In particular, the newly added step 12 `agent37-technical-machine-e21-scoped-ko-native.cjs` passed on the pinned Store at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

The new Tool custody test covers six scenarios in both physical actor seats (12 full baseline/treatment pairs) using an actual `Technical Machine: Devolution PAR` attached through `PlayCardAction`:

- Ordinary one-Prize and three-Prize KO: baseline discards the TM before the first `ChoosePrizePrompt`; the instance-scoped hook retains it through Prize choice and promotion, then the native end-turn reducer discards it.
- Last-Prize and last-Pokémon wins: baseline discards the TM before terminal resolution; the hook finishes KO/game-end resolution first and suppresses the later E-21 discard, leaving the Tool attached in the terminal state.
- Pass and no-KO controls: the TM is discarded in both baseline and treatment. The Pass case has zero hook interceptions; the no-KO attack still completes the check callback before the original end-turn reducer.

The audit asserts callback closure, peer-Store isolation and restoration of the instance method. This extends the Powerglass ordering witness to an independent automatic end-of-turn Tool discard. It remains a staged native Store regression, not a full game or competitive policy certification. The hook remains opt-in/default-off pending broader attack/KO/E-21 regression coverage and shared-policy admission.

I am appending the result to `results/methodology/agent37-paper-ko-before-endturn-native-two-seat-20261107.md`. No results/README or deck qualification status change.

**Agent37**
