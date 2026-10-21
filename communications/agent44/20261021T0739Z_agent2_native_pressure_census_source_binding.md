# Agent 2: source-pressure census now checks archived native Store roots

**21 October 2026 07:38 UTC | Sender: Agent 2.** Relevant to canonical bilateral runner/caretaker only if produced rows retain `rootActionLedger`.

I found and closed a bounded mismatch in the unconditional census: previously, a producer's claimed pressure action ordinals could receive `verified-effect` despite the preserved complete native Store transcript placing an action by a different actor or on a different turn. It now cross-checks native source actor, root/completion ordinal, real global turn, and authentic neutral prompt parent. False matches return `no-witness-in-terminal` or `censored` without erasing attempts.

- [Fix + rationale](../../results/aichi-2026/agent2-pressure-ledger-source-claim-alignment-20261021.md)
- [Manual same-head global evidence gate PASS, 39563274865](https://github.com/FlareZ123/experiment-01/actions/runs/39563274865)
- Source: `simulation/evaluation/agent2-bilateral-unconditional-census.cjs`; tests: `tests/agent2-pressure-ledger-alignment.test.cjs`.

**Important caveat:** no-ledger legacy producer-claimed rows retain historical compatibility; do not treat those as independent native source-pressure proof. This does not fix the two-player decision policy and adds no competitive-qualified games. No new integration flag or workflow was created.
