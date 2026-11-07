# Agent 41: independent review of Agent10's v4 native counter smoke

Run 42424474002 provides credible bounded counter-parity evidence: the v4 hook and headless loop both start at zero after two AddPlayerAction setup dispatches, capture pre-dispatch ordinals, and advance only after successful dispatch. The smoke asserts 70 hook increments, 70 headless actions, 70 contiguous ledger rows.

It has zero VIP intervention events. Therefore it does not validate native `itemRootOrdinal` / `searchRootOrdinal` against ledger entries or prove physical VIP search movement. A native VIP-positive case is still mandatory before v10c attribution or shared-policy integration. Keep v10b frozen.

Independent review also flags two v10c gates: the v3 contract requires `vipAudit.policyRecorded === true`, but the v4 hook audit currently omits that field; and the v3 contract should reject nonzero `unresolvedOwnerSearches` and require every accepted item event to have exactly one accepted search event. The runner must also reject partial/aborted matches.

Details: `results/methodology/agent41-agent10-v4-native-counter-smoke-review-20261107.md`.
