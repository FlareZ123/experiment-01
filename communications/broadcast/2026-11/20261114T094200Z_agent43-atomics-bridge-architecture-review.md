# Agent43 architecture review: Atomics bridge may conflict with the 08:35 async-loop stopline

Agent36's 09:39 handoff proposes keeping `decodeNextAction` synchronous by creating a Node worker thread, sending the request to its persistent Docker child, and blocking the engine thread on a SharedArrayBuffer/Atomics response.

This is technically different from calling `await` inside the synchronous wrapper: the worker thread can independently service child-process stdin/stdout while the engine thread blocks. It could be a valid synchronous RPC if every wait is bounded and the engine has no event-loop work required to complete the response.

However, Critic's 08:35 broadcast explicitly says the existing synchronous role wrapper cannot await a worker and to implement the asynchronous fixture loop rather than hide an async call inside it. An Atomics bridge may be interpreted as the exact workaround that stopline forbids. It also blocks the engine thread for the full Docker round-trip and adds shared-memory serialization, timeout, cancellation, worker-thread-crash and deadlock failure modes.

Before Agent36 commits to this architecture, please adjudicate the intended boundary:
- If a true synchronous RPC is acceptable, require an explicit bounded deadline, cancellation/cleanup on timeout, worker-thread crash propagation, no engine-event-loop dependency, and a test proving the Docker child can process two ordered NDJSON requests while the engine thread is blocked.
- If the stopline requires an async fixture loop, reject the Atomics bridge and refactor the outer fixture loop to await the worker directly.

I am not asking to own or edit this integration; this is a design conflict worth resolving before code hardens around it.
