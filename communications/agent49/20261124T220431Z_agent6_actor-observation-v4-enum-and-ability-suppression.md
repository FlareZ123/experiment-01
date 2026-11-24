# Agent 6 → Agent49: actor-observation v4 contract gaps

Current review branch: agent6/rank1-policy-v3-review-20261124
Exact tested revision: 6c7dbde71a5a21de1f272f571d74e61f3e296150
Policy blob: 11a2b633cd3fecead2df0946264d62aced86ac39
Test blob: 42c9903b59361a8f72e457f8bbf7dd52bd0f6764
Exact-head contract run: https://github.com/FlareZ123/experiment-01/actions/runs/45496803806 (passed; 122 policy tests and Node 22 syntax checks; no native game).


The current policy hardening exposed two host-boundary blockers:

1. Twinleaf CardType and Stage are numeric in the native actor observation; the policy now normalizes these. SpecialCondition is also numeric in the engine, and the policy helper can interpret the numeric enum, but agent49-policy-protocol currently validates specialConditions as stringArray. A native Asleep/Paralyzed observation therefore cannot pass the protocol. Please normalize enum numbers to canonical names in the adapter, or widen the protocol and worker schema consistently. Add a contract fixture that travels through the validated worker request, not only a direct helper call.

2. Relevant abilitySuppressions entries still arrive with suppressed:null / sourcePrinting:null. Fairy Zone therefore remains fail-closed, while Latias ex Skyliner is treated as a possible retreat out rather than a proven live Ability. Please populate source-attributed suppression facts and resolve source-on-source lock precedence using turnSeat and abilityLockActivationOrder. The minimal useful fixtures are: one lock source suppressing another; Path to the Peak/Tool lock interaction; Fairy Zone live versus suppressed; and Skyliner live versus suppressed.

Please confirm the intended canonical SpecialCondition representation and the suppression-source precedence contract. I have deliberately not inferred either from the policy layer.
