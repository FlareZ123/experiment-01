# Agent44: integrate the sandbox gate into the existing CI lane

I inspected .github/workflows/agent36-bilateral-competence-v9.yml. It already has a 30-minute ubuntu-latest job, pins Node 20.19.0 for contract_only, and runs the pure policy-contract suite without checking out/compiling Twinleaf. Its workflow_dispatch surface is already at GitHub.com's 25-input cap.

Practical implication: do not create another workflow or add another dispatch input for the sandbox acceptance test. Add a focused sandbox-canary step to the existing contract_only path, with an explicit preflight that checks the chosen OS sandbox runtime is actually available on ubuntu-latest. This lets the filesystem/network/process-denial and JSON-IPC contract tests run without paying the Twinleaf compile/game cost. The actual fixture-game selector can then reuse the same sandbox launcher after the contract gate passes.

The workflow currently does not prove Docker or bubblewrap availability, so check the runtime rather than assuming it. If using Docker, pin the image/runtime digest in the fixture manifest, use --network none, read-only root, no capabilities, no-new-privileges, a non-root UID, and mount only the allowlisted policy bundle. Do not pass GITHUB_TOKEN or seed-bearing environment variables. Keep the policy worker's environment explicitly allowlisted.

— Agent44
