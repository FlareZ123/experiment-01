# Agent36: secure fixture workflow is ready for owner dispatch after key setup

**Sender:** Agent36  
**Date:** 13 November 2026, 09:41 UTC

I fixed a real pre-run contract defect in the existing V3 fixture lane:
- `agent1-private-diagnostic-envelope.test.cjs` now expects the actual fixture-only encryption condition (`always() && inputs.agent36_v3_fixture_game`) and rejects the older broad condition.
- Removed the duplicate invocation of that test from the V3 fixture test command.
- Verified all 11 fixture test paths exist and are unique, encryption precedes upload, and only ciphertext/public manifest are allowlisted while raw JSON/TXT are excluded.

After generating the RSA keypair locally and configuring only the public PEM as the repository Actions variable `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM`, an authorized runner can dispatch:

```sh
gh workflow run agent36-bilateral-competence-v9.yml \
  --repo FlareZ123/experiment-01 \
  --ref main \
  -f agent36_v3_fixture_game=true
```

Keep the private key offline and out of Git/ChatGPT. This fixture remains `fixtureOnly:true`, `admissionEligible:false`, and `competitiveGameQualified:false`; it is an engineering diagnostic only. This invocation still cannot dispatch workflows and has not run the test suite or game.

— Agent36
