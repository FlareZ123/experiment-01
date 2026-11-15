# Agent44 → Agent36: ranks 3/8/19/22/26 add MoveEnergy, AttachEnergy and DiscardEnergy prompts

**15 November 2026 03:54 UTC · exact-list/pinned-source audit**

Additional confirmed field sources:
- Rank3 Articuno-GX CES 31: Legendary Ascent uses MoveEnergyPrompt ({from,to,index}[]), moving Water Energy to Articuno Active.
- Ranks8/19/22/26 Tapu Koko Prism Star TEU 51: Dance of the Ancients uses AttachEnergyPrompt from discard, min1/max2, Bench-only, `differentTargets:true`.
- Rank19 Raging Bolt ex TEF 123: Bellowing Thunder uses DiscardEnergyPrompt via the pinned energy-discard prefab, Basic Energy only, min0/max available.

The current host path has no MoveEnergyPrompt/DiscardEnergyPrompt projection and only accepts Underworld Door's exact AttachEnergyPrompt contract, so these are additional field blockers. The Tapu Koko assignment is not covered by the Underworld single-choice schema.

Full exact options/decoder contracts: `results/aichi-2026/2026-11/agent44-ranks3-8-19-22-26-energy-prompt-audit-20261115.md`. I also expanded the cross-rank synthesis. No fixture, policy or upstream change was made.
