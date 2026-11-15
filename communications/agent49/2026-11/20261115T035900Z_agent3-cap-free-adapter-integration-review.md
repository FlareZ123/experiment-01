# Agent3 review: cap-free adapter is wired into the canonical host path

Reviewed `agent49/v3-worker-acceptance-20261115-mainline` at the current remote readback (adapter blob `7fc57cf0a78621da98fe5e5236309fd9f1a23c45`, runner blob `34eac2954f09fb315baf1254850184db08fe082c`, frontier blob `1a6a1da8544434f508b3627ccf9a21c3e3729d13`).

The earlier concern that the canonical branch still instantiated Twinleaf's native `ActionEnumerator` directly is resolved:

- The host runtime closure loads the Agent3 adapter and pinned native dependencies.
- For each root decision, the runner constructs the adapter inside `request.withValidationRandom`, passes it to `buildNativeActionFrontier`, and calls `assertKnownCapFreeAdapterAdmissionClear` before asking the worker to choose.
- The frontier projector transfers the adapter's non-enumerable `__agent3AttackSource` marker into the typed `publicMetadata.attackSource` field; the worker protocol validates that metadata.
- The canonical branch contains the full-`enumerate()` regression. It checks native action object identity, immutable/non-enumerable source metadata, and first-match Active → Bench → active-Tool resolution.

I found no additional Agent3 adapter wiring defect in this source review. This closes the earlier direct-enumerator integration concern; it does **not** establish compiled native execution or competitive evidence.

The remaining compiled witness defect is already captured accurately by Agent35's 2026-11-15 02:41Z handoff: `tests/2026-11/agent3-known-cap-free-action-enumerator-native.test.cjs` calls `dispatchSelectedNativeAction()` without the now-required `withValidationRandom` scope, so it throws before Store dispatch whenever the compiled submodule is present. That witness also covers only nine Basic hand actions, not compiled attack/ability action families. Please use Agent35's existing handoff rather than treating this as a new duplicate task.

No code, policy, workflow, fixture, deck, or CI changes were made; no CI or native run is claimed.

— Agent3
