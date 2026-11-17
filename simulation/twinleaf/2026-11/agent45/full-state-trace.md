# Offline full-state trace for Twinleaf headless games

Set captureFullStateTrace to true on the existing simulation/twinleaf/headless.cjs runMatch() call to enable a diagnostic-only trace without changing either bot's decision inputs.

The returned result contains fullStateTrace (complete machine-readable native snapshots) and fullStateTraceText (a compact human-readable move-by-move zone summary). The text lists each player's deck, hand, discard, Lost Zone, Prize identities, Active/Bench board, Stadium, Supporter, prompts, selected actions, and turn/phase changes; card labels include simulator IDs where present so duplicate copies can be followed across zones. The complete raw snapshots remain in fullStateTrace.initialState and fullStateTrace.steps[].afterState; the text intentionally avoids repeating those large JSON graphs. Keep both in process memory for local analysis. Do not print them into shared logs or write plaintext JSON/text to disk. If persistence is needed, use the existing owner-key encrypted diagnostic envelope and decrypt only on a trusted offline machine.

## Contents

- One initial native Store-state snapshot after both decks have been registered.
- One detached post-dispatch native state for every root Store action, including prompt resolutions and non-attack actions.
- A concise public-board summary of Active/Bench Pokémon, damage, attached Energy/Tools, Stadium, and printed attack names/costs.
- The action object/type, acting player ID and seat, pending prompt, turn and phase transitions, and a reference to the immediately preceding state snapshot.
- Per-seat tactic order, prompt-resolver order, score keys, and arbiter modes, captured once for reproducibility.
- Initial native logs and per-action log deltas in the readable text; each delta records before/after counts and detects log-array resets. The final cumulative native log is printed once at the end and retained in the machine trace. Failure-stage labels and error details are included for aborted actions.
- Failure-stage snapshots for bot-decoder, strict prompt-validation, and Store-dispatch failures.

The serializer traverses own property descriptors without invoking user-defined getters, converts cycles and repeated references to $ref markers, and represents functions/accessors without executing them. Default per-snapshot bounds are 64 levels and 50,000 object nodes, with a 512-action trace cap. Callers can override these through fullStateTraceLimits.maxDepth, fullStateTraceLimits.maxNodes, and fullStateTraceLimits.maxSteps. Exceeding a bound stops trace capture (not the game) and makes fullStateTrace.complete false; the capture error is surfaced in the text/result. fullStateTraceCaptureError reports capture failures that did not stop the underlying game.

## Safety and limitations

**This output can contain both players' concealed hands, decks, Prize identities, temporary prompt custody, and other private native state. It is sensitive diagnostic data. Keep it local/offline and encrypted at rest; never pass it to a policy, include it in actorObservation, commit it, or upload it as a public CI artifact.** The option is off by default and does not alter policy behavior.

The trace records the selected action and complete native state, including printed attacks and prompt options present in the Store. The public-board summary lists printed attack costs and attached Energy but does not calculate payable attacks, lock effects, or legal actions. It does not yet enumerate every alternative legal action considered internally by SimpleTacticsAi; that requires separate policy-frontier instrumentation. If the optional public-board summary fails, the raw native state is still captured and publicBoardError records the summary failure. If the compact human zone summary fails, humanSummaryError records that separately. Recorder initialization and per-step capture are fail-open: a diagnostic error is returned as fullStateTraceCaptureError (or attached to a thrown match error) and does not intentionally abort the game; initialization failure means no trace is available. Use captureDecisionTrace alongside it for the existing concise decision and root-action ledgers.

This is a diagnostic aid, not proof of paper rules fidelity, simulator correctness, or competitive win rate. It is part of the existing in-process headless adapter, not the V3 Docker worker runner or an admission/fixture path.
