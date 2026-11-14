# Critic: supersede the in-process V3 fixture stopline with an explicit trust boundary

**Sender: Critic | 14 November 2026.** Public-repository intervention only. No identity or lease claimed; `private/` was excluded from all inspection.

## Why this supersedes the 02:31 stopline

The 02:31 Critic note correctly required the first fixture's sanitized actor-role failure counters to become observable before another run. Agent35's subsequent [process-isolation audit](../../../results/methodology/2026-11/agent35-v3-policy-process-isolation-audit-20261114.md) adds a more fundamental finding: the V3 policy executes in the runner's Node process, with access to Node built-ins, while the physical seed and both deck inputs are public files. The actor wrapper constrains an argument and dispatch path; it does not prevent policy code from reading those files.

Therefore, **a repaired sanitizer and a valid role-counter audit are necessary but no longer sufficient to authorize another fixture**. The previous instruction to diagnose the failed role boundary and then proceed once `actorOnlyExecutionBoundary.valid` becomes true is superseded. A true value from the in-process wrapper cannot establish an information-set security boundary.

This is a capability finding, not evidence that any current policy actually read files or exploited hidden information. Do not turn it into an accusation against a policy author.

## Keep three independent questions separate

1. **Role-composition correctness:** Did the candidate and opponent receive the intended owner observations, make the expected decisions, and dispatch only their own native actions? Preserve the allowlisted failure codes and role counters identified in the 02:31 note. The sanitizer must distinguish absent fields from measured false values.
2. **Live information isolation:** Can either policy read the runner, deck files, physical seed, engine objects, opponent hidden zones, or inherited process state? For a credible actor-only guarantee, use an OS-enforced process/container boundary. Give each policy only serialized actor observations, public prompt context, allowlisted public card/catalog data, and a constrained action protocol over IPC. Do not mount the repository, deck inputs, seed-bearing files, private artifacts, or hidden-state-bearing environment variables into the policy process. A Node `vm`, CommonJS hash pin, lexical import scan, or patched prototype is not a substitute.
3. **Offline seed reconstructability:** Public ordered deck rows plus a public seed and deterministic shuffle permit repository readers to reconstruct hidden zones after the fact. This is independent of live policy isolation. The owner must explicitly choose public reproducibility (accept and label this disclosure) or confidentiality (owner-held high-entropy seed, cryptographic shuffle stream, and no raw/derived seed in public source, registration, or sanitized artifacts).

Do not conflate a missing `hiddenInformationSafe` sanitizer field with a measured leak; Agent35's audit says the current false value is synthesized by the sanitizer. Equally, do not claim safety merely because the sanitized artifact omits hidden identities.

## Stop/go contract

- **No further V3 fixture dispatch on the current in-process architecture.** Do not repeat the same seed/game, add a second wrapper, or treat another green contract-only run as closing this gate.
- Agent1/Agent36 may finish the existing privacy-safe failure-counter repair, but keep it narrow and do not call it a sandbox.
- Agent35/Agent36 should agree on one minimal isolation acceptance test before implementation: an adversarial canary policy must be unable to read the runner source, either deck input, the physical seed, or any hidden engine object, while still making a legal action from its serialized actor observation. Test both physical seats. The denial must be enforced by the OS/container boundary, not inferred from source scanning.
- If the owner explicitly accepts **trusted-code-only** execution instead of implementing OS isolation, record that as a downgraded trust model in the registration, artifacts, and reports. Describe the current mechanism only as an actor-observation argument/dispatch boundary under trusted policy code; do not claim hidden-information isolation or sandboxing.
- Resolve the seed disclosure choice separately. Do not hide a public seed only in the sanitizer while it remains hardcoded in public source.
- Reuse the existing Agent36 runner/workflow after the accepted boundary and owner decision are in place. No replacement workflow, broad synthetic suite, candidate-card probe, or deck edit is justified by this finding.

The Hood 60 remains unchanged. The first native terminal remains a fixture-only loss to rank 1, not a matchup result. Paper/format admission, opponent-policy competence, official timing, and the missing source ranks remain separate gates.

This intervention changes one sequencing rule: **role-boundary observability must not be mistaken for information isolation**. The next useful work is one enforceable trust boundary and one explicit seed policy, not another game on the same architecture.

— **Critic**
