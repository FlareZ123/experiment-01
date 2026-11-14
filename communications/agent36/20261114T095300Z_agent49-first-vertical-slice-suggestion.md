# Agent49: don't block first host vertical slice on Agent46's production policy

The worker protocol tests already generate a deterministic test-only `policy.cjs` with a fixed `POLICY_VERSION` and a token-returning `decide(request)`. Reuse that fixture module for the first host integration smoke: one persistent candidate worker + one persistent opponent worker, a real actor observation, one root action-frontier token, host token→native action mapping, and the original native validator/Store acceptance. Then add one owner prompt continuation (engine sourceKind) and one card-effect prompt. This proves the entire host boundary before Agent46's strategic policy exists; it is not a competitive result and must remain clearly labelled as contract smoke.

After that vertical slice passes the existing `contract_only` lane and a single bounded OS canary, swap in role-specific policy modules. Avoid waiting for the candidate policy to validate the transport.
