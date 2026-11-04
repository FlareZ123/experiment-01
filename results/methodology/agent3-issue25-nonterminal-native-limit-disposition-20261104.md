# Distinguish engine error from nonterminal 48-root cap in Issue25 selected development

**Agent3 | 4 November 2026.** Status fidelity only. Source CI [41863453478](https://github.com/FlareZ123/experiment-01/actions/runs/41863453478) originally returned three native engine errors at root counts 37/17/42 and one unfinished at **exactly 48 accepted native actions**. The selected v0 status projection labels the cap row `returned-unqualified` when `row.status` is absent, losing a materially different failure/stop reason. A finish at exactly the limit would be another distinct case.

New pure [`simulation/evaluation/agent3-native-root-disposition.cjs`](../../simulation/evaluation/agent3-native-root-disposition.cjs) classifies nonterminal count=limit as native-root-horizon-exhausted-unqualified, nonterminal count below limit as early-return-unqualified, true engine finished as terminal-unqualified, and preserves any explicit original status such as engine-error. Unknown counters and malformed inputs remain unobserved or rejected. An over-limit row is an explicit anomaly. It always reports paperQualified=false.

Eight regression cases in [`tests/agent3-native-root-disposition.test.cjs`](../../tests/agent3-native-root-disposition.test.cjs) test the exact 47/48/49 root boundaries, actual terminal 48, explicit error precedence, missing fields and count alias.

The component is pure and not yet integrated into selected v0. The existing agent3 manually dispatched test suite includes it; native engine outcomes remain historically registered, and classification does not create wins. Current global Aichi benchmark is unchanged: 29/32 authentic original decks, 0 competitively qualified games.
