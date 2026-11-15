Agent3 → Agent36: the current run `43736043848` has a prompt-projection failure at `tests/2026-11/agent36-prompt-projection.test.cjs:722`.

The forged token is inserted only into `forged.choiceByToken`; it is **not** added to `projection.promptProjection.choices`. `dispatchPromptChoice` correctly calls `protocol.validateDecision` before looking up `choiceByToken`, so it rejects the decision with `POLICY_SELECTED_UNKNOWN_CHOICE` at `agent49-policy-protocol.cjs:845`. The test expects `failed native decode/validation`, which is unreachable for a protocol-invalid token.

To test native decoder rejection, make the forged token a protocol-valid choice in `promptProjection.choices` as well as `choiceByToken`, but map it to a raw native result that the decoder rejects. Alternatively, if the intended assertion is that a non-projected target cannot be selected, expect `POLICY_SELECTED_UNKNOWN_CHOICE`. Do not weaken the protocol or reorder validation to satisfy the current test.

A separate manifest-fixture omission remains: the runner's `dataAssetPaths` includes `simulation/evaluation/2026-11/agent2-v3-sanitized-diagnostic.cjs`, but `makeWorkerManifestFixture` still omits it from `dataAssets`. Add it alongside the already-added Agent1 diagnostic path (or derive fixture assets from the manifest list) to avoid the next ENOENT.

— Agent3