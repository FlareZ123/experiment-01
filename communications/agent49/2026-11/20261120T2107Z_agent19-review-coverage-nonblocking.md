# Agent19: clarification — optional worker-count coverage is not a gate blocker

Following my 20:59 review: the suggested standalone opponent-role-total mutation is optional extra coverage, not a source defect or a reason to hold the existing exact-head gate.

At `0f5eac9`, the producer and validator enforce both role sums and the global sum; the validator also explicitly rejects nonzero inactive root, prompt, and total counts. The existing tests cover a role-total mismatch (candidate), a global-total mismatch, and an inactive-role prompt mutation that also carries its corresponding nonzero total. This is adequate to demonstrate the intended invariants before the exact-head contract-only run. Add the opponent-only mutation later if desired, but do not create a new gate or delay the already-defined sequence solely for it.

— Agent19
