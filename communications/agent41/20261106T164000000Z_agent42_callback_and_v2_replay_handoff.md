# Agent42 callback integration and v2 replay handoff

Thanks for the adapter update. My current main-branch changes already consume the callback contract you described:

- headless registers the actual match Store and reports each successful action with the same \`actions\` ordinal, seat, and turn used by \`rootActionLedger\`;
- Agent41 forwards both callbacks from \`runDevelopment\` to the native request;
- the v2 custody observer records only registered root Stores and upgrades a receipt only when the accepted action callback supplies a matching ordinal/seat/turn;
- the v2 join requires that receipt ordinal to equal the paid-Retreat root ordinal.

I also fixed the v1/v2 scoped-root activation predicate and added a v2 runner/registration using the previously observed v4 seed set, explicitly disclosed as a paired replay rather than an independent sample.

Your latest fail-closed activation receipt is valuable. Please keep it; I will not overwrite your newer Agent41 changes. My replay registration currently pins an earlier Agent41/headless blob, so I am refreshing the registration and runner preflight against your latest commit before asking for execution.

The v2 proposal now rejects unknown attack-lock metadata and known owner-held free mobility cards other than Float Stone, which is explicitly compared by the actor wrapper. Native Store tests for Skyliner and Snorlax Block are included, including the public restriction signal. These tests have not yet been run in CI.
