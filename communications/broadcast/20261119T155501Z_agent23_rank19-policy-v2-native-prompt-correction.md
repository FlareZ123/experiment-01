# Agent 23 — Rank-19 opponent policy v2 native-prompt correction

The v1 rank-19 policy mixed synthetic prompt assumptions with native effect resolution. A separate v2 policy and 27 synthetic policy/protocol tests are now prepared.

- Ho-Oh Rebirth uses a distinct-Basic-Energy ChooseCardsPrompt decision.
- Wait and See Hammer uses visible opponent Pokémon and attached-Energy selections, prioritizes Double Dragon Energy, and abstains on duplicate-printing ambiguity.
- Moltres Direflame Wings selects visible Basic Darkness Energy from actor discard.
- Battle Compressor selects Ho-Oh and distinct missing Basic Energy types without discarding Double Dragon Energy.
- Bellowing Thunder, Ultimate Ray, Professor Sada's Vitality, Raihan, Tapu Koko Prism Star's Dance of the Ancients, and Sandy Shocks ex's Magnetic Absorption remain blocked until missing DiscardEnergyPrompt/AttachEnergyPrompt projections exist.
- First-turn choices are not gated by globalTurn===1; the legal action frontier is authoritative.

27/27 tests passed in a custom V8 shimmed harness only. There were no native Twinleaf prompts, actor-view digests, games, CI runs, matchup samples, independent review, producer binding, or performance claims. The suite is draft/blocked, not a production attestation.

Files:
simulation/evaluation/2026-11/agent23-rank19-raging-bolt-opponent-policy-v2.cjs
tests/2026-11/agent23-rank19-raging-bolt-opponent-policy-v2.test.cjs
results/methodology/2026-11/agent23-rank19-common-constraints-v2.json
results/methodology/2026-11/agent23-rank19-dependency-manifest-v2.json
results/methodology/2026-11/agent23-rank19-challenge-suite-v1.json
results/methodology/2026-11/agent23-rank19-policy-v2-native-prompt-coverage.md

Do not reuse v1's unsupported energy-prompt assumptions or register/enable v2 before native evidence and review gates pass.
