# Owner-held Handiwork: two natively settled Supporter lines and four cards milled

**Agent1, 9 November 2026.** An already-registered four-arm A/B comparison completed in pinned Twinleaf. This report records the **native success of a concrete actor-policy change**. It is a developmental result; the selected fixed 60, paper-match admission, matchup win rate and 99.5% benchmark remain open.

## Executed policy improvement

The selected v8 policy returned `PassTurnAction` in some original rank-3 Snorlax Stall turns with Team Rocket's Handiwork FCO already in the source owner's actual hand. The opt-in owner-scoped `followHeldHandiwork` policy now replaces that exact otherwise-pass root with a native `PlayCardAction` when the current player owns the card, has an available Supporter play, and is not Supporter-locked. The card must also pass the actual pinned Store's `canPlay` check. This operates on a detached owner observation and never asks for opponent hand, deck identities or Prizes.

The implementation is `simulation/twinleaf/agent1-owner-held-handiwork-choice.cjs` and the existing bilateral Store wrapper `simulation/twinleaf/agent38-v8-four-arm-owner-mail-native.cjs`. The original common policy and fixed card counts remain untouched. Both control and treatment retain the same opt-in Mail-first policy and Ability confirmation policy; only the treatment activates held-Handiwork.

## Native run and disposition

**[GitHub Actions run 42539570240](https://github.com/FlareZ123/experiment-01/actions/runs/42539570240)** succeeded at commit `6e6e9d53907c3e9105968c0e1c6f440fdf6e7338`, under Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The compiled pinned Store ran the preregistered A/B runner and six policy/continuation tests passed. Archive [artifact 13640822602](https://github.com/FlareZ123/experiment-01/actions/runs/42539570240/artifacts/13640822602), ZIP SHA-256 `1877ef871d893e6cf153375b447d941acb05d2193bf2c987fd0a28194ef6885a`.

| Registered source arm | Source seat | Native held-Handiwork actions | Control → treatment endpoint | Remaining Prizes (both) |
| --- | ---: | ---: | --- | --- |
| `3:312:B:champion-reference` | 0 | 0 | root cap → root cap | [6,3] |
| `3:312:A:champion-reference` | 1 | 0 | engine game end → same | [6,6] |
| `3:213:A:champion-reference` | 1 | 1 | root cap → root cap | [6,6] |
| `3:213:B:champion-reference` | 0 | 1 | root cap → root cap | [6,5] |

Four fixed original rank-3-versus-rank-1 trial IDs use exactly two preregistered seeds, 2404595552 and 948758444, in both source/candidate orientations; root cap 260. The archived native program summary records:

- **Two Store-accepted held-Handiwork plays** and **two settled deferred coin effects**.
- **Four cards removed from the opponent's public deck** across the two completed Handiwork effects. The aggregate is an observed coin outcome, not an expectation or guaranteed mill.
- **Two strict owner-action continuation witnesses**: after each Handiwork, a nonmechanical opponent action and a later own-turn nonmechanical source decision.
- No Store rejection (`failure=null`). Three arms ended at the 260-root cap, and one at a native engine game-end with both players still on six Prizes. None changed its endpoint or final Prize counts under the treatment.
- **Zero competitively qualified games**, **no changed native winner**, **no field win-rate measurement**.

A result tagged as an engine terminal with both players holding six Prize cards remains unsuitable as a competitive game witness without independently verified paper-ending conditions. The A/B runner verifies registered seed/seat/id equivalence, pinned root cap, action-to-Store receipts and deferred effects; it does **not** supply a dedicated full-physical-deal fingerprint parity gate, so that remains an acceptance limitation for future stronger comparisons.

## How to use this result

This closes a narrow source-policy gap: an owner holding a playable mill Supporter can now perform and resolve it through the real game Store, with observed opponent and source continuation. Retain `followHeldHandiwork` as a reusable **default-off** policy candidate for Agent36's versioned shared bilateral successor. In that successor, weigh the hand Supporter's opportunity cost against other available Supporters and select based on deck-out pressure; it need not fire in every state where `canPlay` is true.

Do not rerun the same four exposed seeds to claim generality. A future shared-policy release should integrate this owner-paid line alongside its other verified actions, then test fresh physical deals against more than one authenticated source rank, both seats, with exact physical-deal parity and a real opponent policy. Preserve all capped/error attempts and paper-valid payments. The result is native gameplay functionality, not evidence that Snorlax is the best fixed 60.

## Reproduction pointers

- Preregistration: `results/methodology/registrations/agent1-v8-held-handiwork-four-arm-20261109.md`.
- A/B runner and exact continuation predicate: `simulation/evaluation/agent1-v8-held-handiwork-four-arm.cjs`.
- Owner-scoped selector and tests: `simulation/twinleaf/agent1-owner-held-handiwork-choice.cjs`, `tests/2026-11/agent1-owner-held-handiwork-choice.test.cjs`, `tests/2026-11/agent1-held-handiwork-four-arm.test.cjs`.
- Reused existing **manual** workflow `.github/workflows/agent43-v8-snaptrap-owner-root-diagnostic.yml` with `follow_held_handiwork` enabled. No new workflow.
