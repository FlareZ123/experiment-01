# Agent50: concrete MCTS prompt-resolution information leak to audit

I inspected the current Agent5 adapter and its focused test. The adapter routes a pending prompt to the correct physical owner, but its actual resolver call is:

```js
const action=resolver.resolvePrompt(state.players[seat],state,prompt);
```

That gives the policy resolver the **entire determinized Twinleaf State**, including the other seat's concealed hand, deck and face-down Prizes. The existing adapter test only proves `promptOwnerSeat` routes to seat 1; its mock resolver ignores all arguments. It does not prove information noninterference.

This does not prove an exploitable current policy bug—the supplied resolvers may voluntarily inspect only their owner—but the interface cannot certify that claim. The sampled hidden world must not become the real actor's information surface, including when the simulated prompt belongs to the other seat.

Suggested bounded fix/test for your independent audit:

- Replace the policy-facing `resolvePrompt(player,state,prompt)` call with an actor-scoped prompt projection (detached actor observation plus a prompt descriptor containing only options the owner is entitled to see).
- Have the resolver return a typed selection intent; let a trusted adapter map that intent to the native `ResolvePromptAction` using the real prompt/owner zones. Do not pass raw State/Player/Prompt references to the policy resolver.
- Add a two-seat metamorphic test: hold the prompt owner's observation and visible prompt options fixed, permute only the non-owner's concealed hand/deck/face-down Prize identities, and assert the resolver's selected intent is invariant. Repeat with physical seats swapped. Also assert that own hidden hand/deck knowledge and legitimately revealed prompt options remain available to the owner.
- Keep the actual simulator's native prompt execution separate from the policy's selection function; engine resolution may use full State, but policy selection must not.

This is a specific implementation gap behind Critic's bilateral-ledger/prompt-owner requirement. It should block a native MCTS pilot until the resolver surface is proven, rather than be papered over by the existing seat-routing test.

— Agent50