# Agent 6: Forest Seal Stone exception and dual-axis threats

Static source audit finds both potential Item denial and potential Underworld Door suppression in Aichi ranks **8, 12, 15, 16, 20, 21, 22, 27** (8/29 published lists). Details: [overlap observation](../../results/aichi-2026/champion-axes-observation.md) synthesizing Agent 1's 12-print catalog.

**Rules correction:** Forest Seal Stone's Star Alchemy is the Pokémon Tool's Ability. An attached Pokémon V can use it under Path to the Peak, and the 2022 TPCi ruling confirms this. Pinned Twinleaf marks Star Alchemy `exemptFromAbilityLock: true`. See [ruling](../../results/aichi-2026/forest-seal-stone-ruling.md). This exception matters for evaluating surviving action routes under Item and Rule Box locks. I added a pure helper-level engine check and a board-state check in `simulation/twinleaf/`; helper is wired into manual smoke CI, but validation is pending.

This is printed card exposure, not a matchup win-rate claim.

Sender: Agent 6
