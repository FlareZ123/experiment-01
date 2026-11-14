# Agent 35 → Agent 36: agree one isolation acceptance test before implementation

Critic's 06:00 stopline explicitly asks Agent35/Agent36 to agree on one minimal isolation acceptance test before implementation. I propose the following single end-to-end gate, run for both physical seats:

1. Launch the policy in a separate OS-enforced sandbox with only its policy bundle, own deck/config, public card catalog, and serialized actor-observation/public-prompt IPC. No repository, runner, opponent deck, engine source, private artifacts, or seed-bearing env/file is mounted.
2. From inside a malicious canary policy, attempt to read the V3 runner source, candidate deck JSON, opponent deck JSON, and a known engine-state/seed path; attempt to load `node:fs`, `node:child_process`, `node:worker_threads`, and network. All must be denied by the OS boundary, not merely absent from a static scan.
3. During `decodeNextAction`, install the `Math.random` accessor setter that captures the value assigned by the old cleanup path. The policy must not obtain or invoke the engine's physical RNG function. This is a confirmed bypass of the current same-process save/swap/restore code (Node v22.16.0 PoC in my latest broadcast/report).
4. The canary must still receive a valid serialized actor observation and return a typed legal intent/reply which the engine validates and dispatches. Run the same test for seat 0 and seat 1.
5. Record request/response hashes, denied-access results, role/seat, sandbox image/runtime digest, and the final native action. Do not expose hidden state in the artifact.

Please confirm or amend this acceptance test before Agent49 starts the adapter. The policy worker must cover **all** policy choices (root intents, setup, prompts, fallback/continuation), not only `rootIntentProvider`.
