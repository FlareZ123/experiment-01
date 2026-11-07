# Articuno-GX CES 31: D-02 zero-transfer prompt fidelity

**Status:** Paper-rule interpretation supported. The source-scoped native prompt correction passed its dedicated two-seat CI step. The headless runner flag is default-off. No competitive matchup result is claimed.

## Question

Can the player accept Legendary Ascent's Active switch and then move zero Water Energy from other Pokémon to Articuno-GX CES 31?

## Rule and card evidence

The repository's advanced manual defines D-02 at lines 1716-1736 (page 40). For an Ability with "any number" wording, zero is prohibited only when using that Ability would leave the game state unchanged.

The pinned card-pool record `resources/cards/en/sm7.json`, card `sm7-31`, marks the printing Expanded legal. Its Ability triggers when Articuno is played from hand onto the Bench, offers a switch with the Active Pokémon, and, if the switch occurs, permits moving "any number of Water Energy" from other Pokémon to Articuno. The accepted branch switches Articuno with the Active Pokémon before opening the Energy prompt. That switch changes the board state. The D-02 condition for prohibiting zero is therefore false. Zero Energy transfers are legal after the switch.

The original Aichi rank-3 Snorlax Stall list contains one Articuno-GX CES 31 and two Basic Water Energy (MEE 11). This establishes field relevance; it does not establish that the line occurs in a natural game or changes a matchup.

## Pinned Twinleaf behavior

Pinned engine revision: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

In `ptcg-server/src/sets/08-sun-and-moon/set-celestial-storm/articuno-gx.ts`, accepting the ConfirmPrompt calls `player.switchPokemon(bench)` before creating the MoveEnergyPrompt. If a Basic Water Energy is attached to another Pokémon, the MoveEnergyPrompt is created with `min: 1` and `allowCancel: false`.

Three implementation details matter:

1. `MoveEnergyPrompt.validate` does not enforce the minimum. An empty result passes its per-entry check.
2. `Store.reducePrompt` does not call `prompt.validate`; direct native Store dispatch accepts an empty result.
3. The Angular `PromptMoveEnergyComponent` reads `prompt.options.min`, marks the prompt invalid when `results.length < min`, and disables the OK button. The research-owned strict gate in `simulation/twinleaf/prompt-integrity.cjs` also enforces the minimum.

Thus the upstream prompt metadata blocks the legal zero choice in the normal UI and the strict research adapter, even though the native Store reducer accepts it.

## Research-owned correction

Added `simulation/twinleaf/articuno-zero-movement-prompt-hook.cjs`, version `articuno-ces-legendary-ascent-zero-movement-v1`.

The hook wraps `Store.prototype.dispatch`, separately from the existing entry-lock hook on `ArticunoGX.prototype.reduceEffect`. It changes only `MoveEnergyPrompt.options.min` from 1 to 0 when all of these conditions hold:

- the exact physical Articuno-GX CES card was played from hand onto the Bench;
- exactly one new WANT_TO_USE_ABILITY ConfirmPrompt was created for that owner and turn;
- that ConfirmPrompt was accepted;
- the same Articuno card is now Active;
- exactly one new MoveEnergyPrompt belongs to that owner and turn;
- its message, player perspective, slots, Energy supertype, Water Energy name, minimum, and non-cancelable setting match the pinned Legendary Ascent prompt.

The hook leaves `allowCancel: false`, the Energy filter, and transfer geometry unchanged. It does nothing when the Ability is declined, blocked, produces no Energy prompt, or produces an ambiguous prompt sequence.

Added the default-off `articunoZeroMovementPromptCorrection` request flag to `simulation/twinleaf/headless.cjs`. The flag is included in match provenance and the policy fingerprint. It is independent of `articunoEntryLockCorrection`; cleanup restores later Store wrappers before restoring this wrapper.

## Native tests

Added `tests/articuno-zero-movement-prompt-hook.test.cjs` and a step in the existing manual `aichi-lock-board-tests.yml` workflow. No new workflow was created.

The dedicated step, "Verify Articuno CES D-02 zero-movement prompt fidelity on both seats", passed in GitHub Actions run [42355639110](https://github.com/FlareZ123/experiment-01/actions/runs/42355639110), on code commit `13ff438f7f11993bf01192be34de8c0b3ebb752f`.

The test covers:

- both physical player seats;
- the raw pinned prompt's `min: 1` and native Store acceptance of an empty result;
- rejection of that same empty result by the unmodified strict prompt gate;
- acceptance after the source-scoped correction sets `min: 0`;
- both installation orders with the existing Articuno entry-lock hook;
- an ordinary one-Energy transfer after the correction;
- Path to the Peak suppressing the entry Ability before the zero-movement hook can act.

The manual workflow was still running other unrelated checks when this report was written. Its overall result is not inferred from the successful dedicated step. The later headless flag wiring commit `035421d72b5f0d736865d1286787989c0bd37fdd` was made after the tested commit and still needs a run on that revision.

## Limitations and next work

- This is a staged mechanics test, not a natural source-dealt game, matchup sample, or win-rate estimate.
- The hook does not decide whether a bot should accept the switch or how many Water Energy to move. The existing owner policy's ability-confirm and transfer-selection heuristics require separate strategic review.
- The hook is scoped to the Aichi source printing CES 31. It does not claim compatibility with every reprint.
- The pinned reducer's filter is for the exact Basic `Water Energy` name. This correction does not add support for Special Energy that provides Water.
- Keep the flag default-off until the common policy steward and independent reviewer approve any policy integration.

Recommended next steps: validate the headless request flag on a current CI revision; ask the owner-policy steward to review whether a zero-transfer choice is useful in any reachable public state; retain the distinction between a legal prompt correction and strategic value.
