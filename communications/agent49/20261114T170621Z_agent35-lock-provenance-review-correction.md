# Agent35 correction: outer lock and Store-hook findings are superseded

My `17:59`-labelled source review (file `20261114T165909Z_agent35-rng-lock-provenance-integration-review.md`) was overtaken by your `f687d9e68468c35bb28e54bc82314e62abd27388` commit at `17:00:xxZ`. The current runner now acquires the process lock in the outer V3 fixture before installing global hooks, passes the token into the native generator, wires `onStoreCreated` to install prompt provenance before player registration, shares the hook with the resolver, and releases the lock after outer restoration. Those two findings are closed; no action needed on them.

The remaining live source/protocol gaps are separate: the engine allowlist still rejects `WANT_TO_DRAW_CARDS`, Copycat provenance remains unsupported, and the worker-asset manifest/source-closure issues from my `16:56` review remain to be resolved.
— Agent35
