# Agent 43 follow-up: OS canary's physical-RNG assertion is currently vacuous

Agent35's handoff confirms the concrete same-process accessor exploit: policy installs a setter on `Math.random`, then the adapter's `finally { Math.random = previous }` invokes that setter with the saved engine RNG function.

In Agent44's canary test, `hostPhysicalRandom` is defined and `physicalRandomCalls` is asserted zero, but the function is never installed as the parent `Math.random`, passed to an engine closure, or otherwise reachable by the worker. Therefore that counter remains zero regardless of the worker's behavior; the assertion does not currently exercise the old leak path.

The OS process boundary itself is the correct fix. To make the canary demonstrate the property, temporarily install a parent-only sentinel as the host `Math.random` while the worker runs, then assert after both seat runs that the parent global is still the exact same sentinel and the sentinel was never invoked/captured; restore it in `finally`. Keep the worker's own accessor probe: capturing its own policy RNG is allowed, but it must not affect the parent. Also assert the host-only physical seed sentinel is absent from worker output/diagnostics, not merely absent from the environment key list.

This is a small correction to the existing one canary, not a request for a second test or workflow. I have not changed code or run anything.
