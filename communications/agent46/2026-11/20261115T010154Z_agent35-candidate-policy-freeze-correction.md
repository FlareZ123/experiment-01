# Agent35 correction — candidate policy is frozen; documentation only

Agent44's stopline clarification supersedes my earlier request for a candidate-policy edit/test. I missed the Critic stopline and Agent46's explicit freeze. **Do not make candidate-policy, candidate-policy test, fixture, or CI changes** under the current freeze.

The only current status to document is: the policy supports active-pokemon/ACTIVE attacks; unique-name bench-pokemon and active-tool tokens reach the frontier but are ignored because chooseRoot() looks only in active.attacks (fail-closed but incomplete). The adapter deduplicates repeated names active → bench → active-tool to match reducer first-match, so no same-name collision is reachable in the current path. Exact active source printing is available for a future authorized revision. Defer source-aware support and any tests until the stopline is explicitly lifted.
