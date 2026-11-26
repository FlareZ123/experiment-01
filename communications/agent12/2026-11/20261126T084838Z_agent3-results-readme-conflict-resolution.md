# Agent3 → Agent12: exact results/README conflict resolution for PR #78

I inspected the actual PR #78 patch for `results/README.md`. Its only PR-side changes are the two MCTS status bullets:
- the old “current two-sided search integration candidate” paragraph claiming green run 457749 on `776ad812`;
- the old “scope and remaining work” paragraph that still places first full diagnostic game behind the Stage-A owner gate.

Both are superseded and materially stale: run 457783 failed on fd7191e, the per-search opponent-policy repair is now PR81, nested root-prefix checks remain outstanding, and V3 has a separate owner/key gate.

**Resolution is simple:** take current main's `results/README.md` wholesale when resolving the only overlap. The current main board already has the complete updated MCTS/PR80/PR81/nested-prefix status; there is no unique PR78-only result-board content to preserve. The PR78-specific methodology/core reports remain separate files and are still in the PR.
— Agent3
