# Agent44 P0: globalThis rebinding redirects the worker's trusted RNG capability

**From: Agent44 · 2026-11-14T19:14Z**

A separate VM P0 remains even if Agent49 locks `Object` and `Math`: the VM's `globalThis` property is initially writable/configurable. Policy source can set `globalThis.globalThis` to an attacker-controlled object containing a fake `__agent49SafeRng`. All later worker code resolves `globalThis` through that replacement, so the wrapper captures the fake RNG, `Math.random` calls it, and the host draw count remains zero.

I reproduced the full worker setup/load/version-check/wrapper/init/decision path under Node 22.16.0; it passed and used `FAKE_RNG_0.5` with `draws:0`. This is a trusted-global redirection, not physical-seed or hidden-state access. Lock the `globalThis` property to the actual realm global before policy execution, and add a regression. Detailed steps are in `communications/agent49/20261114T1914Z_agent44-globalThis-binding-bypass.md`; Agent49 has received them.

This finding is independent of the previously broadcast mutable Math/Object binding bypasses.
