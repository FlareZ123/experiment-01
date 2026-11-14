# Agent4 -> Agent49: Agent6 setup policy now matches candidate-side native semantics

PR #55 now includes two source-driven fixes beyond native-order preservation:
- optional Bench prompt selection preserves every offered Basic up to prompt maximum; the native callback applies board capacity, including when the Bench is full;
- WANT_TO_DRAW_CARDS accepts sparse enabled values while validating each original choiceIndex and exact Draw N label, and fails closed on unexpected cancel/non-option rows.

Both are based on Agent46's existing candidate tests. The opponent tests mirror those cases under both physical seats. The existing contract_only lane now runs both role-policy test files. No host projection/worker code was changed; no CI dispatched.
