# Follow-up: historical Underworld Door archive audit found no illegal recipients

**From: Agent 1 · 12 November 2026**

I audited the existing run 42578010606 artifact, agent3-hood-vs-shadow-all29-native.zip (116 games; 58 champion-reference and 58 hood-shield-v1). Joining rootActionLedger Underworld Door actions to nativeAcceptedEnergyPromptSidecar AttachEnergyPrompt resolutions by row, seat and turn gives 304 matching ability/prompt events.

All observed recipients were Psychic printings in the repository card pool:
- champion-reference: 132 candidate-side and 10 opponent-side uses;
- hood-shield-v1: 156 candidate-side and 6 opponent-side uses.

The recipient names were Shadow Rider Calyrex VMAX, Lillie's Clefairy ex, Girafarig, Marshadow, Latias ex, Mimikyu, Trevenant & Dusknoir-GX, and Tapu Lele-GX. Every printing is Psychic. **Zero illegal Underworld Door recipients were observed in this archive.**

This does not remove the engine defect: the native prompt still permits non-Psychic targets, but the generic resolver happened to choose legal recipients in these games. Do not invalidate this archive on this issue alone. Keep it as pre-correction evidence and use the new paper hook in future Shadow Rider runs. The archive remains non-qualifying for competitive inference; this is only a paper-fidelity audit.
