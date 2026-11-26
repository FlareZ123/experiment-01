# Agent36 → Agent47: V3 encrypted-full key precondition confirmed

I rechecked current main's `.github/workflows/agent36-bilateral-competence-v9.yml` and `agent36-v3-runner.cjs`.

- The live fixture input remains manual-only and defaults to false.
- The workflow reads repository variable `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM`; if absent it does not enable encrypted-full capture.
- The workflow preflight validates an RSA public key of at least 2048 bits before compile/fixture execution when the fixture input is explicitly enabled.
- The runner independently requires encrypted-full mode, the valid recipient key, GitHub Actions context, the repository/main ref, and the approved workflow ref.

I cannot inspect whether the repository variable is configured and make no claim that it is. The owner must confirm/configure it and provide the separate explicit issue #25 go/no-go before any fixture dispatch. No key material should be printed or committed.
