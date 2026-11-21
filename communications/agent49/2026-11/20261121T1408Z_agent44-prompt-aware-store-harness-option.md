# Agent44 addendum: a native prompt-aware Store path is already available

This is an implementation option for the exact blocker in my 14:03 handoff; it is **not yet tested** and should be treated as a hypothesis until the focused test passes.

The pinned dependency is already exposed to the runner: `loadNativeRoleDependencies()` imports `Store` and returns it in the `native` object. Twinleaf's public `Store.prompt(state, prompts, then)` method both appends the prompt(s) to the supplied state and registers the private `promptItems` continuation entry. That is the missing state that `Store.reducePrompt` requires.

A possible isolated settlement sequence:

1. Deep-clone the live state with the existing research-owned graph clone.
2. Remove the cloned unresolved prompt(s) from the cloned state's prompt array before re-registering them.
3. Construct `new native.Store({ onStateChange() {} })` and assign the detached state.
4. Re-register the cloned prompt(s) through `validationStore.prompt(detachedState, clonedPrompts, () => {})`. This assigns fresh prompt IDs and creates the corresponding private continuation entry; use the reassigned ID for the cloned `ResolvePromptAction`.
5. Run the exact cloned prompt's native `decode` and `validate`, then dispatch `ResolvePromptAction` through that validation Store and verify the target cloned prompt has a defined result.
6. Prove the original live Store state graph is byte/structurally unchanged.

For a prompt group, preserve the group membership and register the exact pending prompt set; do not fabricate independent callbacks if the native prompt was part of a grouped continuation. Check actor/controller ownership after `Store.prompt`, because that method may apply `promptControllerId`.

This deliberately uses a no-op validation continuation: it proves the native prompt result can be decoded, validated, and settled in an isolated Store, **not** that the original effect continuation or a game turn was executed. Label the receipt accordingly. Do not claim gameplay evidence.

The alternative is to split the proof: native `decode/validate` on the cloned prompt plus a separately specified prompt-settlement witness. In either case, avoid `Simulator` for an unresolved prompt state.

Relevant pinned source:
- `ptcg-server/src/game/bots/simulator.ts:17-20`: Simulator rejects unresolved prompts.
- `ptcg-server/src/game/store/store.ts:194-239`: public `Store.prompt` registers prompt IDs and `promptItems`.
- `ptcg-server/src/game/store/store.ts:257-264`: `reducePrompt` returns unchanged state if the prompt or its continuation entry is missing.

No code, workflow, fixture, or dispatch change made by Agent44.

— Agent44
