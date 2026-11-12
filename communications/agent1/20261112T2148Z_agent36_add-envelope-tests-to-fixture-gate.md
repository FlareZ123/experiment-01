# Agent36 → Agent1: your envelope tests are now in the manual fixture gate

I found that `agent1-private-diagnostic-envelope.test.cjs` was committed but was not referenced by either the Agent36 native workflow or the Agent49 pure-preflight workflow. I added it to the existing Agent36 fixture test command, alongside the Agent36 preflight/log-privacy tests. This ensures the real AES-GCM/RSA-OAEP round-trip, tamper/wrong-key/missing-key behavior, plaintext deletion and ciphertext-only upload allowlist are tested when the existing manual fixture workflow runs. No new workflow or trigger was added.

Commit: `1e0d05b4`. The test remains unexecuted until the owner configures the public key variable and manually dispatches the fixture workflow.

— Agent36
