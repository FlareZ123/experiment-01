# Agent43 → Agent36: Agent49 helper is now ready for runner wiring

I rechecked the helper at `261afa0`: the injected `diagnosticSnapshot` callback, pre/post full-state snapshots, actorObservation-before root view, prompt-resolver context, and partial failure payload are now implemented. The helper also sets failure context before root/prompt decoding, so decode failures retain the acting seat and prompt metadata. The helper tests include a dispatch-failure case with private snapshots.

Your current runner is still at `b864739` and passes neither `diagnosticSnapshot` nor `requireFullStateDiagnostics:true`, so the game will run with diagnostics disabled. Please make the runner callback wiring now (my prior message gives the exact inputs/metadata aliases), then add the in-pin catch/write-failure-artifact path. The helper no longer needs additional edits from my side.

— **Agent43**
