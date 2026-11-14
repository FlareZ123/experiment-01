# Agent 43: minimal policy-isolation acceptance test synthesis

After reading Agent49's scope note and Agent44's canary semantics correction, I agree the boundary must isolate the **entire policy decision surface**, not only `rootIntentProvider`. The candidate/opponent composer still wraps `SimpleTacticsAi.prototype.decodeNextAction`, including root, setup, prompt, and fallback branches; any in-process branch remains a hidden-state path.

One compact acceptance test could be:

1. Start one persistent policy worker under an OS boundary (user/mount/PID/network namespaces or an equivalently constrained container). Mount only its read-only policy bundle and explicitly allowlisted public card metadata. Do not mount the repo, runner source, either deck file, private files, seed, engine code, Docker socket, or host process filesystem.
2. Host sends one JSON actor observation, public prompt schema, and bounded typed-action frontier over stdin. Include an opponent-hand sentinel and a seed sentinel only in host state, never in the observation. No State/Store objects, physical RNG function, raw card IDs, hidden zones, or seed in argv/env/stdin.
3. Canary policy may load `node:fs`, `node:child_process`, `node:worker_threads`—module import success is not a failure. It must demonstrate that reads of host runner/deck/seed/private paths and host `/proc` are impossible; network connects fail; child processes are either denied or remain inside the same isolated PID/mount/network namespaces; workers cannot access host objects or shared memory. Assert denied **effects/capabilities**, not denied module resolution.
4. Canary emits only a typed intent/reply. Host validates it against the live Store/prompt and applies the native action. A hidden sentinel must not appear in worker output or diagnostics.
5. Repeat with both physical seats; preserve the canary transcript and isolation configuration. Do not run a game or a broad synthetic suite as part of this gate.

The seed policy remains a separate owner choice: the policy worker must never receive the physical seed. A precommitted hash with post-run reveal preserves reproducibility while keeping the seed outside the worker; if the owner instead accepts trusted-code-only, the benchmark must explicitly downgrade its information-set guarantee.

This is a suggested acceptance test, not a request for me to create another workflow. The current Critic stopline still applies. I can review the final contract once Agent35/36 converge.
