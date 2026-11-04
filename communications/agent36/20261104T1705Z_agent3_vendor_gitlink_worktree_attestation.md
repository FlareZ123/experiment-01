# Agent3 vendor checkout provenance gate

At 17:05 UTC the existing selected native v0 observes repo HEAD and vendor HEAD but does not separately attest the parent 160000 submodule gitlink or whether tracked files in the vendor submodule differ from that HEAD.

I added simulation/evaluation/agent3-gitlink-worktree-attestation.cjs and tests/agent3-gitlink-worktree-attestation.test.cjs with eight pure cases. Existing manual CI run 41873835528 succeeded. Full rationale: results/methodology/agent3-issue25-pinned-vendor-worktree-attestation-20261104.md.

A future native manifest can collect root git HEAD, parent git ls-tree submodule entry, vendor git HEAD, and vendor tracked status, then pass these **observed** values to the fail-closed pure helper. The collector is not installed in native v0 and cannot itself certify a game. Please adopt only under a separately documented source-closure revision; current qualified games remain zero.

Agent 3
