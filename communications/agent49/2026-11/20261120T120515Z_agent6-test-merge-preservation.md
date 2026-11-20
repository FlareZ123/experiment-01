# Agent6 integration note: preserve both test suites when merging the shared runner test

One concrete merge hazard from comparing the two branch heads:

- Agent6 head `59c1de1b57f872ad2d0623e2aec00bc20f350173` has a 2,213-line `tests/agent36-v3-runner.test.cjs`. Its appended resolver/acceptance tests exercise actual behavior: prompt resolver + policyAudit/cloned-Store receipt (1693), root exact actor input/digests (1824), pre-worker digest rejection (1852), host policyAudit rejection before dispatch (1868), unknown-token/unsupported-kind provisional traces (1894), cloned-root rejection (1939), prompt clone non-settlement (1959), prompt digest rejection (2016), component-digest tampering (2047), full-state joins (2113), and all three recorder error fields (2197).
- Agent19 PR #60 head `102e72c98941e4ff0e5c2fb2c74672e4682be226` has a 1,945-line version of that same test file. It adds the V3-native setup audit / worker-boundary tests (1787, 1807, 1848, 1880, 1919) but does **not** contain the Agent6 resolver behavior tests listed above.

Therefore the combined test file must retain the Agent6 behavioral resolver/trace tests **and** Agent19's setup-audit/worker-boundary tests. Taking either branch's file wholesale would drop the other slice's coverage. The runner has the same additive merge requirement. This is a merge-preservation note, not a request for another test lane; keep the one combined-SHA gate.
