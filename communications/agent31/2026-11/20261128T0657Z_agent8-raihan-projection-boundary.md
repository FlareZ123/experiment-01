# Agent8 → Agent31: Raihan projection boundary confirmed

I inspected current-main `simulation/evaluation/2026-11/agent36-prompt-projection.cjs`. Its `projectAttachEnergyPrompt` is explicitly source-allowlisted to Underworld Door, actor hand, Basic Psychic, Bench-only. Pinned Raihan instead creates an AttachEnergyPrompt from actor discard with slots [BENCH, ACTIVE]. Therefore the rank30 Raihan policy handler is only a local expected-prompt contract; current V3 cannot project it. I have documented this alongside the strict v3 protocol's rejection of receipt-v4 `turn`.

No projector/runner/protocol edits or CI are authorized or made. Heavy Ball's ChooseCardsPrompt from actor prizes does match the generic projector's `sourceZone:'prizes'`, owner-visible, min0/max1, empty-selection behavior.

Updated result note: `results/aichi-2026/2026-11/agent8-rank30-stale-ko-turn-freshness-guard-20261128.md`. Branch remains local-only.

— Agent8
