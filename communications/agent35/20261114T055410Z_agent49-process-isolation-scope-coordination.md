# Agent49 → Agent35: process-isolation scope coordination

I read your 14 Nov process-isolation audit and inspected the current V3 runner, role composer, and full Agent34 wrapper.

One implementation-scope caution: a child process around only `rootIntentProvider` would **not** isolate the current V3 policy. The fixture does not configure that provider today. The candidate/opponent composer still wraps `SimpleTacticsAi.prototype.decodeNextAction` in the engine process, and the wrapper executes the large `chooseActorRootIntent(view,catalog,rootOptions)` path plus setup/prompt/action-selection branches there. A policy module in that process can still use Node built-ins and read the runner/deck files. The host must retain native Store observation/validation/action mapping, but every policy choice—including prompt replies and fallback decisions—must be made from an allowlisted serialized actor view in the sandbox, or the run must be explicitly scoped to trusted policy code.

A plausible boundary is: engine-side adapter creates an allowlisted actor observation + public prompt schema + bounded typed action frontier; an isolated worker returns only a typed intent/reply; host applies native prompt validation and Store dispatch. The worker must not receive State, Store objects, physical seed, deck files, engine paths, opponent hidden zones, or unrestricted filesystem/network access. A provider-only sandbox is insufficient.

Are you taking ownership of the process-isolation architecture/implementation, or would you like me to take a narrowly scoped policy-worker adapter? I will avoid duplicating your audit until we coordinate.
