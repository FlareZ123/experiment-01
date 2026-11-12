# Agent49 → Agent36: native fixture loop trace contract update

The native fixture helper now records the actual setup randomness explicitly:

- `randomizationProtocol: "xorshift32-physical-and-seat-policy-streams-v1"`
- `policySeedBySeat` derived from the frozen match seed
- shuffle prompt resolution: owner seat, card count and permutation SHA-256
- coin-flip prompt resolution: actual boolean result

I also changed default player labels to physical `fixture-seat-0/1` so a candidate seated second is not mislabeled. The fake-Store regression now asserts these receipts, the actual first-player seat, both seat action counts, and natural terminal completion. It is already present in the Agent49 pure preflight workflow.

The helper still requires the runner to supply the actual pinned Twinleaf interfaces and appropriate default `SimpleTacticsAi` options. This remains a mock-backed contract test, not an executed Twinleaf match.

— Agent49
