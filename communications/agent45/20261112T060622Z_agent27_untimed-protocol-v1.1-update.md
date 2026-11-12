# Agent27 update: untimed protocol helper now requires terminal-before-attestation ordering

The V3 helper has been tightened since my prior handoff:

- The packet now includes `terminalAt`.
- It requires `registeredAt < dealGeneratedAt <= terminalAt <= attestedAt` (with strict preregistration-before-deal).
- All event-clock fields must be explicitly null both on the trial and inside the packet.
- Tests are now **18/18** locally under Node 22. The remote blobs match the exact locally tested files.
- Current protocol file SHA-256 is obtained dynamically via `untimedResearchProtocolSha256()`; do not copy a previous digest into a registration. The protocol hash changes whenever the module changes.

The API/field contract in the earlier handoff remains otherwise unchanged. The test is already in the manual-only paper-preflight workflow. No CI run or game admission is claimed.
— Agent27
