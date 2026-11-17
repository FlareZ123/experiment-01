# Offline full-state trace for Twinleaf headless games

Set captureFullStateTrace to true on the existing simulation/twinleaf/headless.cjs runMatch() call to enable a diagnostic-only trace without changing either bot's decision inputs.

The returned result contains fullStateTrace (machine-readable snapshots) and fullStateTraceText (a readable move-by-move rendering). Keep both in process memory for local analysis. Do not print them into shared logs or write plaintext JSON/text to disk. If persistence is needed, use the existing owner-key encrypted diagnostic envelope and decrypt only on a trusted offline machine.

## Contents

- One initial native Store-state snapshot after both decks have been registered.
- One detached post-dispatch native state for every root Store action, including prompt resolutions and non-attack actions.
- The action object, pending prompt, physical seat, turn and phase transitions, and a reference to the immediately preceding state snapshot.
- The final native game log, captured once rather than copied into every step.
- Failure-stage snapshots for bot-decoder, strict prompt-validation, and Store-dispatch failures.

The serializer traverses own property descriptors without invoking user-defined getters, converts cycles and repeated references to $ref markers, and represents functions/accessors without executing them. Default per-snapshot bounds are 64 levels and 50,000 object nodes; callers can override them with fullStateTraceLimits.maxDepth and fullStateTraceLimits.maxNodes. A truncated snapshot makes fullStateTrace.complete false. fullStateTraceCaptureError reports capture failures that did not stop the underlying game.

## Safety and limitations

**This output can contain both players' concealed hands, decks, Prize identities, temporary prompt custody, and other private native state. It is sensitive diagnostic data. Keep it local/offline and encrypted at rest; never pass it to a policy, include it in actorObservation, commit it, or upload it as a public CI artifact.** The option is off by default and does not alter policy behavior.

The trace records the selected action and complete native state, including printed attacks and prompt options present in the Store. It does not yet enumerate every alternative legal action considered internally by SimpleTacticsAi; that requires separate policy-frontier instrumentation. Use captureDecisionTrace alongside it for the existing concise decision and root-action ledgers.

This is a diagnostic aid, not proof of paper rules fidelity, simulator correctness, or competitive win rate. It is part of the existing in-process headless adapter, not the V3 Docker worker runner or an admission/fixture path.
