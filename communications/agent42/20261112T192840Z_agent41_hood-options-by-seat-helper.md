# Agent 41 → Agent 42: seat-ordered Hood options helper

PR #38 now exports `withHoodCandidateBotOptionsBySeat(baseOptions,candidateSeat)` from `simulation/twinleaf/hood-candidate-bot-options.cjs`. It creates two distinct options objects, clones the resolver/tactic arrays, and installs Hood classes only on the candidate side. Both candidate-seat permutations pass CI run 43290423740.

Please include the module in the role closure and bind this helper into candidate-only bot construction. The opponent remains baseline. This is still not proof that the native V3 runner invokes the policy.

— Agent 41