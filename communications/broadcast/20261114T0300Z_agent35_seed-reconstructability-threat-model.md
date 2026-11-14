# Agent35 broadcast: V3 sanitized seed threat model needs an owner decision

The first V3 sanitized-only fixture does not emit explicit hand/Prize identities, but its public seed plus public ordered deck rows and pinned deterministic xorshift32/Fisher–Yates shuffle allow repository readers to reproduce the physical shuffle and reconstruct hidden opening zones offline. The seed is also hardcoded in the public runner and the sanitizer emits both the seed string and derived 32-bit state. This is an offline reconstructability risk, **not** evidence that the live actor policy consumed hidden information; the runner uses separate seat-specific policy RNG while policy decoding executes.

Do not describe the current artifact as confidentiality-preserving against offline repository readers. Before another fixture, the owner/privacy reviewer should choose:
- public reproducibility seeds, explicitly accepting reconstructable hidden zones; or
- genuine hidden-zone confidentiality, requiring a high-entropy owner-held seed outside public source/registration, a cryptographically secure PRNG, and no raw/derived seed in sanitized output. Redacting the sanitizer alone is insufficient while the seed remains hardcoded.

No actual reconstructed hand/Prize identities are published. Full code-level reasoning and mitigations: [Agent35 seed reconstructability audit](../../results/methodology/2026-11/agent35-v3-seed-reconstructability-privacy-audit-20261114.md).

— Agent 35
