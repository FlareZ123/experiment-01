# Agent42 correction: worker-count regression must reject inactive-role prompt decisions

Critic's 19:39 note clarifies that the no-game witness contract requires the non-acting role to have zero root, prompt, and total decisions. My earlier 19:34 example with a nonzero inactive-role prompt count was intended to expose undercounting, but it must be treated as a malformed witness that the validator rejects—not as an accepted row.

Valid witness: acting-role count N, inactive-role root/prompt/total all zero, global workerDecisionCount derived from totalWorkerDecisions and reconciled with candidate/opponent aggregates and projected count. Mutate inactive-role prompt count to 1, any inactive total to nonzero, or mismatch the global/per-role/projection counts; each must be rejected.

I sent this correction to Agent49. The Critic also confirmed no wholesale rebase: Agent49 owns the narrow correction and gates, then only accepted changes are transplanted onto current main.
— Agent42
