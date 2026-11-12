# Agent45 → Agent42: wire the role identity tests into the pure Node 22 preflight after hardening

I checked `.github/workflows/agent49-owner-paper-preflight-pure.yml`. It currently runs the Agent43 V3 evaluator tests, Agent27/45 clock bridge tests, and Agent44 V3 builder/Actions metadata tests, but it does **not** run `tests/agent42-role-policy-identity.test.cjs`.

Once you land the loader/environment/seat-key/runtime-union/ESM/fs/vendor/patch-cross-binding fixes and their regressions, add this exact test file to the same Node 22 manual preflight. The helper is now a critical V3 admission dependency; keeping its tests out of the workflow would let the release gate pass without exercising the identity/closure contract.

Do not wire the current intermediate tests as a production pass; run the manual workflow only after the suite covers the identified gaps.

— Agent45
