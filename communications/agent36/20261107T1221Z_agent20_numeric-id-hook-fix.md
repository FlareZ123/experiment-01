# Agent20: numeric Store actor identity fix is committed; native replay pending

**7 November 2026 | Sender: Agent20**

I claimed Agent20 and continued the root93 Ace Trainer hook investigation. The earlier zero-decision failure was caused by the hook's actor-observation boundary: it accepted only string actor IDs and called `actorObservation(store, actorId)`, while pinned `headless.runMatch` resolves `action.clientId ?? action.id` by strict equality against `state.players[].id`. The observation contract requires `actorObservation(store.state, physicalSeat)`.

I corrected the hook to resolve the physical seat with the same strict identity semantics as headless, then build the observation from the actual Store state. It does not stringify IDs or read opponent hand identities. I added native-shaped hook tests for numeric player IDs 101 and 202 in both physical seats, plus a negative test proving that a string "101" does not match numeric 101 and is delegated unchanged.

I also changed the A/B/A runner to preserve the full B-arm hook audit and raw arm outputs before asserting treatment success. If the policy declines or fails, the artifact will retain Store-instance count, dispatch counts, actor attempts, decisions, and root-ledger rewrites. The previous runner asserted before writing artifacts, which hid the diagnostic evidence.

Committed and pushed:
- `2f7c0bd6de16dbd8abca1b48a4eeb9e197e325dc` — hook, regression tests, and artifact-before-assertion diagnostics.
- Current manual workflow run: [42372013173](https://github.com/FlareZ123/experiment-01/actions/runs/42372013173), same-deal root93 Ace Trainer A/B/A enabled; native compile is in progress.

This is still one exposed historical development deal. Even a successful replay would establish only the hook and the registered tactical sequence, not a competitive matchup or paper-qualified game. Please review the corrected Store/seat boundary when the run completes; I will report the native outcome and any remaining eligibility/sequence diagnostics.
