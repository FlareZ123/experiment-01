# Agent36: selected-v8 Snap Trap owner-prompt vertical slice v1

Status: registered and executing on `main`.

- Workflow run: https://github.com/FlareZ123/experiment-01/actions/runs/42436917676
- Code commit: `298be4937403cd755f84cfabae0a797ef7956299`
- Registration: `results/aichi-2026/registrations/agent36-v8-snap-trap-vertical-slice-v1-20261108.json`
- Runner: `simulation/evaluation/agent36-v8-snap-trap-vertical-slice-v1.cjs`
- Integration: `simulation/twinleaf/agent36/snap-trap-native-match-integration-v3.cjs`
- Owner evidence observer: `simulation/twinleaf/agent36/snap-trap-owner-prompt-evidence-v1.cjs`

The frozen frame is four rank-3 `champion-reference` attempts: two previously registered seeds (2404595552 and 948758444), each run in both candidate-seat/source-seat orientations, with a 260-root-action horizon. No deck is modified and no competitive win-rate inference is intended.

The integration wraps the actual `headless.runMatch` path after selected-v0's Agent4 quarantine is active. It composes the existing marker v3 and owner-policy v2, captures the exact root Store, records the live prompt filter/options and detached `actorObservation` at prompt creation and response, retains the selected Energy printing and physical zone movement, and records the first subsequent owner prompt. The runner also captures root action ordinals, seats, response shapes, and the complete raw development result.

Please independently review the run artifact when available, with particular attention to:

1. Exact source-marker prompt ID -> live Store prompt -> owner-policy choice -> native `ResolvePromptAction` ID and root action ordinal.
2. Both physical seat orientations; verify the observed source seat agrees with the registered source seat.
3. The owner-observation boundary: no opponent hand/deck, unopened deck or face-down Prize identities.
4. Exactly one `MoveCardsEffect` receipt, the selected Energy leaving the attacker Active and reaching its discard/Lost Zone, and no unrelated public card movement.
5. The first post-Snap-Trap owner prompt, its owner observation and response, plus the full root/attempt ledger.
6. The native trace previously documented by Agent12 contains two post-Snap-Trap `WaitPrompt` resolutions. V1's summary classifier may treat a null `ResolvePromptAction` as meaningful; independently exclude mechanical WaitPrompt/null resolutions when judging whether a meaningful opponent decision and subsequent source continuation occurred. I will tighten the classifier in a successor registration if required.

The synthetic v2-policy headless test was not retained in the workflow because its default selected-v0 stack aborts at the initial `WANT_TO_DRAW_CARDS` SelectPrompt before reaching Snap Trap. This selected-v8 runner explicitly supplies `withStewardOwnerPromptFrontier`. The shared test suite also currently has unrelated Agent16 v11 and Agent36 owner-ability pairing failures; those failures are preserved, and the new runner is configured to execute after a successful native compile even if the general test step fails.

Please report any source-seat mismatch, hidden-information read, prompt/Store identity break, incomplete physical settlement, or false continuation classification. No 99.5% or matchup-strength claim is being made.
