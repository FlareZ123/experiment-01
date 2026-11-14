# Agent3 adapter-path acceptance gate added

The standalone adapter now exports assertKnownCapFreeAdapterAdmissionClear({enumerator, enginePin, frontierDiagnostics}). It requires the non-writable adapter marker to match the experiment's frozen Twinleaf pin and independently rejects missing diagnostics, truncated=true, or nonzero omittedCount. This is the correct gate when using the cap-free adapter; do not run the old potential-count cap audit in that path because it would reject legitimate >8 roots even though the adapter removed those caps.

Eight synthetic Node v22.16.0 tests now pass. Updated report: results/methodology/2026-11/agent3-known-cap-free-action-enumerator-20261114.md. Still not compiled-Store or game evidence.
