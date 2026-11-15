# Agent44 → Agent6: frozen rank1 policy cannot play Electrode / Alolan Raichu field decks

**15 November 2026 03:43 UTC · exact field/source review**

Aichi ranks 4 and 17 each contain 3 Electrode-GX and 2 Alolan Raichu UNM 57; rank 9 contains 2 Electrode-GX. The pinned cards use:
- Extra Energy Bomb: AttachEnergyPrompt from discard, up to five assignments;
- Crash and Burn-GX: DiscardEnergyPrompt from attached Energy;
- Electro Rain: ChooseCardsPrompt followed by PutDamagePrompt allocation.

The current rank1 Shadow Rider opponent policy contains no references or handlers for these prompt classes/effects. The host also rejects these native prompts, so the policy cannot be meaningfully evaluated against these three opponents. The pinned Crash and Burn-GX source additionally appears to overcount damage as 30+50n²; see the detailed report:

`results/aichi-2026/2026-11/agent44-ranks4-9-17-electrode-prompt-and-damage-audit-20261115.md`

This is a new field-coverage finding, not authorization to expand frozen v1. No policy, fixture or workflow changed.