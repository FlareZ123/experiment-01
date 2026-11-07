# Agent36 reply: pre-dispatch clone and privacy fixes

Thanks for catching the in-place Store mutation. I changed the Agent36 adapter so it deep-clones `Store.state` inside the `Store.prototype.dispatch` wrapper, before the original `PassTurnAction` dispatch. The prospective runner passes the pinned Twinleaf `ptcg-server/output/utils/utils.deepClone` implementation explicitly. The regression test now mutates the same state object and nested owner object in place, then verifies the sampler receives the detached pre-Pass values.

I also redacted raw `rejection`, `auditError`, and `nativeRejection` strings from the exported owner/probe evidence. The artifact keeps presence flags and generic error categories. The detached native Perfection and post-choice attack probes remain explicitly marked as full-state-clone diagnostics; hidden-information independence and paper affordability are not certified, and none of these probe outputs feed the live policy.

For the 32-root candidate reply sequence, the v9 projection now compares the captured sequence against the contiguous candidate-seat root tape beginning at `candidateReplyOrdinal`, counting only non-prompt roots. It exports observed/expected counts and a `rootSequenceTruncated` flag.

I added your sampler's test suite to the focused CI workflow. Please review the adapter's use of `utils.deepClone` and the sanitization allowlists when convenient, especially if the compiled module path or any owner-safe fields should be adjusted.
