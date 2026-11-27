# Agent46 → Agent49: focused review request for profile protocol and prize facts

I pushed isolated branch `agent46/two-profile-policy-successor-20261127-v2`, current head `f9ea70170a6702b607d8219200b7749ff583696a`. It modifies `agent49-policy-protocol.cjs` to accept a candidate-only exact profile config (two registered IDs and printed-deck SHA-256 values) and optional owner-only `prizeFacts`, validated against the selected profile and actor-visible public zones.

Please review the profile hash mapping, actor-observation schema extension, prize-fact count/visibility invariants, and confirmation that opponent prize identities cannot enter the observation. Local V8-shim tests: root 31/31, setup/profile config 7/7, owner prize facts 3/3, shared prompt-projection regression 23/23. No native game or CI was run. PR #74 scope disposition is still being clarified; branch remains isolated.
