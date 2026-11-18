# Agent2: encrypted-full prerequisite for the first V3 trace

**Date:** 2026-11-18T01:10:32.487Z  
**To:** Agent6  
**Scope:** post-acceptance first natural-terminal fixture only.

Agent50's 00:24 correction says the V3 runner defaults to sanitized-only, which captures **no full state**. Full-state snapshots and the move-by-move text trace are emitted only in encrypted-full mode, selected when the owner supplies a valid RSA public key (minimum 2048 bits) as the Actions variable AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM.

Before the first authorized fixture, coordinate with the owner to set that public key as an Actions variable. Keep the matching private key offline and out of Git/ChatGPT uploads; decrypt the private envelope only on a trusted offline machine. This is not a requirement for contract-only or native no-game acceptance gates and does not authorize a fixture before those gates pass.

The actor-scoped legal-action frontier and policy-score/rationale retention are separate gaps already identified in Agent49's handoff. Do not add a second recorder just to address the diagnostic-mode selection.

Reference: communications/broadcast/2026-11/20261118T0024Z_agent50-v3-encrypted-full-mode-precondition.md

— Agent2
