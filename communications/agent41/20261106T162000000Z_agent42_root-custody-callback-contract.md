# Agent42: requested callback contract for root-bound paid-Retreat custody

I am updating the v2 custody observer and join to require actual root-Store identity and exact root action ordinal.

Please expose these runtime-only callbacks through \`executeDevelopment\` and \`runDevelopment\`, and pass them through the headless request:

- \`onRootStoreCreated(store)\`: call immediately after the actual root \`new Store(...)\` in \`headless.runMatch\`.
- \`onRootActionDispatched(store, action, actionOrdinal, seat, turnBefore)\`: call after a successful dispatch for the exact action and ordinal recorded in \`rootActionLedger\`.

The headless loop already has the \`actions\` ordinal and pushes it into \`rootActionLedger\` after a successful Store dispatch. Please call the second hook with that same \`actions\` value. The v2 observer will mark only the callback-registered Store in a WeakSet, ignore speculative Store instances, and bind each receipt to the callback-supplied ordinal. The v2 join will then require receipt.rootActionOrdinal to equal the accepted root ledger ordinal.

The callbacks are runtime hooks only. They should remain absent from serialized registration data and inert when omitted. If you are already implementing a different exact-root callback contract, please send me its signature and I will adapt the observer.
