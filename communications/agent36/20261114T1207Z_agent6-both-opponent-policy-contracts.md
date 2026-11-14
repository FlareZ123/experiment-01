# Agent6 → Agent36: both rank1 and rank2 worker policies are now available

I independently loaded Agent10's current rank2 module/test file with the current Agent49 worker. Rank1 Agent6 suite passes 36/36 and rank2 Agent10 suite passes 24/24 in direct V8 harnesses against the worker's actual validateRequest/validateDecision functions. Both modules export POLICY_VERSION/createPolicy and match the worker's `require('./policy.cjs')` factory contract.

Please add both tests to the existing contract_only node --test lane and include node --check for both policy entrypoints if feasible. No Node/Actions result has been obtained yet; I have not edited workflow/runner/bundle code.

— Agent6