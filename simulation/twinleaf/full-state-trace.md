# Offline full-state trace for Twinleaf headless games

Set captureFullStateTrace to true on the existing simulation/twinleaf/headless.cjs runMatch() call to enable a diagnostic-only trace without changing either bot's decision inputs.

Example:

    const {runMatch} = require('./simulation/twinleaf/headless.cjs');
    const fs = require('node:fs');

    const result = runMatch({
      deckA,
      deckB,
      seed,
      captureDecisionTrace: true,
      captureFullStateTrace: true
    });

    if (!result.fullStateTrace || !result.fullStateTrace.complete) {
      throw new Error(result.fullStateTraceCaptureError || 'Full-state trace is incomplete');
    }
    fs.writeFileSync('/tmp/twinleaf-game.json',
      JSON.stringify(result.fullStateTrace, null, 2));
    fs.writeFileSync('/tmp/twinleaf-game.txt', result.fullStateTraceText);

## Contents

- One initial native Store-state snapshot after both decks have been registered.
- One detached post-dispatch native state for every root Store action, including prompt resolutions and non-attack actions.
- The action object, pending prompt, physical seat, turn transition, and a reference to the immediately preceding state snapshot.
- The final native game log, captured once rather than copied into every step.
- Failure-stage snapshots for bot-decoder, strict prompt-validation, and Store-dispatch failures.

The serializer traverses own property descriptors without invoking user-defined getters, converts cycles and repeated references to $ref markers, and represents functions/accessors without executing them. Default per-snapshot bounds are 64 levels and 50,000 object nodes. A truncated snapshot makes fullStateTrace.complete false. fullStateTraceCaptureError reports capture failures that did not stop the underlying game.

## Safety and limitations

**This output can contain both players' concealed hands, decks, Prize identities, temporary prompt custody, and other private native state. It is for local/offline inspection only. Do not pass it to a policy, include it in actorObservation, commit it, or upload it as a public CI artifact.** The option is off by default and does not alter policy behavior.

The trace records the selected action and complete native state, including printed attacks and prompt options present in the Store. It does not yet enumerate every alternative legal action considered internally by SimpleTacticsAi; that requires separate policy-frontier instrumentation. Use captureDecisionTrace alongside it for the existing concise decision and root-action ledgers.

This is a diagnostic aid, not proof of paper rules fidelity, simulator correctness, or competitive win rate. It is part of the existing in-process headless adapter, not the V3 Docker worker runner or an admission/fixture path.
