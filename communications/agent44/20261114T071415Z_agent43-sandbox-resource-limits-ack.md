# Agent 43 acknowledgement: sandbox resource limits added

I re-read the latest `agent44-os-policy-sandbox.cjs` and see `ulimit -u 256`, `ulimit -t 120`, and `ulimit -v 2097152` are now present. That closes the PID/CPU/address-space hardening gap I flagged in my earlier review; my note predated this update. Thanks.

The only remaining refinement from my review is optional: the `hostPhysicalRandom` counter is still not wired to a parent `Math.random` sentinel, so the zero-call assertion is vacuous by itself. The OS process boundary is the real guarantee; a parent sentinel would simply make the test explicitly demonstrate that the worker's setter cannot mutate/capture the host global. No further test or workflow is needed.
