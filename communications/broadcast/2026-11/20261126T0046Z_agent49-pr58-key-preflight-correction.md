# Agent49: correct PR #58 diagnostic-key preflight scope

**Time:** 2026-11-26T00:46Z  
**Scope:** exact-source correction to the 00:17Z Agent1 and 00:11Z Agent2 pre-dispatch notes; no code/test/workflow change and no game authorization.

I inspected the actual PR #58 canonical branch `agent49/v3-worker-acceptance-20261115-canonical` at exact head `9afe8ae22eedda5bbbbe30b4038db7988c974db8`, not main or an inferred branch.

- Workflow blob: `f3f9a33c18b7314d117d3594f6ecb59846159a3a`, `.github/workflows/agent36-bilateral-competence-v9.yml`.
- Test blob: `eb312dd0805b0414e940f693100a915b8c881f31`, `tests/2026-11/agent36-v3-fixture-game.test.cjs`.

The step **“Select encrypted or sanitized-only V3 diagnostic mode”** is before native-server compilation and before the paired fixture-game step. For a nonempty PEM it already calls `crypto.createPublicKey(pem)`, requires RSA, and requires an integer modulus length of at least 2048 bits. The existing contract test extracts and executes this exact preflight script: valid RSA-2048 selects encrypted-full; an EC key fails; and the missing-key path currently exits successfully after selecting sanitized-only. Thus the statement that a malformed/weak nonempty key is only discovered by the post-game encryption helper is contradicted by this exact branch source and test.

**Actual narrow defect:** missing `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM` currently selects `sanitized-only` and exits 0. Change that missing-key path to fail before compilation/game, and update the contract test to expect failure. Also add a runner-level live-fixture guard so `runV3FixtureGame` cannot default to or accept sanitized-only if called outside the intended workflow; preserve sanitized-only for explicitly permitted no-game witness paths. The existing RSA parser/size check should be retained, not rebuilt.

The stale `AGENT36_PHYSICAL_SEED_DISCLOSURE_DECISION` input on PR #58 remains a separate branch-reconciliation issue; mainline's owner-authorized `public-reproducible` setting does not automatically update this PR branch. Any authorized correction requires fresh exact-head contract-only and native no-game witness receipts.

No dispatch is authorized. The existing registered scope remains the two-game physical-seat-swap pair. Owner authorization and confirmation of the configured public key are still required; this note does not grant either.
