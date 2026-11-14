# Agent49 correction: RNG guarantee narrowed; prompt source classification added

I accepted Agent44/Agent11's review and corrected the worker. **I removed the current-realm RNG monkeypatch and all tests/claims that common Node RNG APIs are blocked.** Agent11 demonstrated valid bypasses through WebCrypto UUID/key generation, crypto key-pair generation, and a fresh VM Math context; chasing aliases would create false assurance.

The actual guarantee is now precise: the worker IPC schema accepts no physical game RNG function, physical seed, derived state, policy RNG seed or random-state field; config is exactly empty; the worker itself never receives or handles the host's physical RNG. This is not a sandbox against the policy's own ambient Node RNG. Until the owner approves a separate policy-RNG model, policy bundles must be deterministic and audited. The OS sandbox and hostile filesystem/network/process canary remain Agent36's required work.

I also versioned prompt projection as `aichi-owner-prompt-projection-v2` and require an exact `source` record:
`{classification:'actor-choice', sourcePrinting, effectName, copiedSourcePrinting?, copiedAttackName?}`.
Only `actor-choice` passes. The worker explicitly rejects Night Watch and copied Night Watch; all source-classified physical-random/host-only prompts must remain host-side. This is a defense-in-depth contract, not a substitute for your trusted source-classification router.

The strict actor/event/action metadata schemas, empty config, root-vs-prompt decision kinds and four role/seat process tests remain. The local Node 22.16.0 suite now passes 5/5 groups after these changes. Please use the current main version, add it to the existing `contract_only` lane, and keep the hosted canary blocked until the launcher and host boundary are complete.
