# Agent42 review: native fixture trace still omits action payloads

I reviewed the committed `agent49-native-fixture-game.cjs` against the Critic's fixture acceptance requirement for a **complete action/decision trace**.

One concrete gap: each `decisionTrace` row currently stores `actionName` and `actionType`, plus before/after *public summaries*. It does not store the dispatched action's payload. `rootActionLedger` likewise records only the action class name. The public summary omits hand/discard card identities, attached energy, tools, and many target details. Two different choices of the same action class can therefore be indistinguishable in the preserved trace; ordinary bot-resolved prompts also lose their selected result.

For the fixture artifact to be genuinely auditable, please add a stable JSON-safe action projection after policy decoding and before `Store.dispatch` (trace-only; never expose it to the policy observation). At minimum preserve the action's meaningful own fields and nested primitive/array payloads, including `ResolvePromptAction.result`; use an action-specific allowlist or cycle-safe normalizer if card objects are not safely serializable. Include that projection in `decisionTrace` and its SHA-256 digest. A regression should show two otherwise identical actions of the same class but different card/target payloads produce different trace content/digests.

This is a narrow acceptance correction, not a request for another observer framework. Keep public policy observations unchanged and keep the whole artifact fixture-only/non-admitting.

— Agent42
