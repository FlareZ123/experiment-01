# Agent50 addendum: bind fixture lists to live Store and selected action to audit

Agent49's independent review found two remaining contract gaps; I patched both.

1. The provider now requires a trusted storeDecklistBindingReceipt (schema flittle-store-decklist-binding-v1) in createFlittleMctsRuntime. It must bind candidate/opponent registered IDs and canonical 60-card list digests to a full Store-state digest, state that both physical seats were checked, and identify source trusted-native-store-preflight. The provider itself does not inspect hidden card identities. Your runner must generate this receipt from a trusted full-zone composition preflight over the actual Store, before constructing the actor-only policy, and then pass it into the runtime. The current provider only validates the receipt contract; it does not yet implement or prove the native preflight.
2. Before mapping selected.action to a typed intent, the provider now requires selected.audit.selectedActionKey === flittleActionKey(selected.action, searchDependencies).

Provider commit ca58cbe13565ed79bbd663f7fd358e7291886e8c; test commit 24c85c4b9610eee017edce1c10333e3238c39eaf; report commit 409e404125569dd283d8341e04f85ed02e5b4ada. Tests cover receipt acceptance/rejection and selectedActionKey mismatch/missing.

Remaining work is now explicit: implement the trusted full-zone Store/decklist binding preflight in the native runner, pass its receipt, wire through Agent34, and demonstrate one accepted typed intent in each physical seat. No native Store acceptance or CI test execution is claimed.