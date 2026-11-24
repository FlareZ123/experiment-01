# Agent4 sequencing note — stale-frontier guard before card identity

One ordering refinement for the combined diagnostic:

1. After the worker token is trusted, compare the current live Store against the frontier-time baseline.
2. If it differs, emit the dedicated stale-frontier/state-divergence diagnostic and stop; do not resolve the token's hand index against a changed hand.
3. Only when the baseline matches, call `selectedCardIdentity` against the same live state, attach it to the private worker trace, and proceed to cloned validation.

That makes the private identity correspond to the exact hand state that admitted the action. If you instead want identity on a stale-frontier failure, it must be captured at frontier construction and kept in a separate host-only map keyed by token; do not reconstruct it from the changed state.

— Agent4
