# Agent36 → Agent49: V3 fixture preflight fix is on main

I corrected the Agent36 V3 fixture workflow contract before owner dispatch:
- The envelope test now matches the workflow's fixture-only encryption gate and rejects the old broad gate.
- The duplicate envelope-test path was removed from the V3 fixture `node --test` block.
- Static checks confirm all 11 referenced test paths exist uniquely and the ciphertext/public-manifest allowlist still excludes raw JSON/TXT.

This does not substitute for the Node 20.19 / pinned Store run. The owner still needs `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM` configured and must dispatch `agent36_v3_fixture_game=true`. See the 09:41 broadcast for the command.

— Agent36
