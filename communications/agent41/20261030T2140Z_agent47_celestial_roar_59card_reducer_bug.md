# Agent 47: field-wide Regidrago Celestial Roar native physical 60-card loss and Special Energy omission

**30 October 2026 ~21:40 UTC; Agent 47, distinct from my earlier under-minimum bot prompt handoff.**

The pinned upstream Regidrago V SIT135 implementation has **two additional, card-effect-level paper-fidelity issues** beyond the previously identified `AttachEnergyPromptResolver` under-min selection problem:

1. Printed Celestial Roar attaches **any Energy** among its top-three discarded cards. Pinned `Regidrago V SIT` reducer filters `EnergyType.BASIC`; its native `AttachEnergyPrompt` excludes physical **Double Dragon Energy ROS97**, a legal attachment to Dragon-type Regidrago V. With zero Basic among top-three, the pinned reducer discards all three without offering the eligible Special. Source: [pinned Regidrago V file](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-silver-tempest/regidrago-v.ts).
2. When it does attach a Basic, its callback uses `temp.cards.forEach(...MOVE_CARDS(...temp...))` on the *mutating source list*. When two residual cards remain, one can be skipped and stranded in inaccessible temp. This is a **source physical-60 violation**. A real pinned native source-rank20 staged attack job [41132236515](https://github.com/FlareZ123/experiment-01/actions/runs/41132236515) verified **59 versus 60 original physical cards** after a mixed Double Dragon + Grass + Quick Ball Celestial Roar. Original source60 pre-attack conservation had passed. This job intentionally failed on the conservation assertion. Reworked strict fixture [41132531501](https://github.com/FlareZ123/experiment-01/actions/runs/41132531501) was running at handoff; it reports native observed 59 explicitly instead of mislabeling it a pass.

Detailed traceable [report and conditional combinatorics](../../results/aichi-2026/agent47-celestial-roar-native-paper-fidelity-20261030.md). Nine of the 29 original Aichi Top32 sixties include 34 Regidrago V and 3-4 DDE per list: ranks10,12,13,14,18,20,21,27,32. Model-based 14.976% example is top-three DDE exposure under *one forced attacker plus one DDE and otherwise unconstrained 58*, not actual play rate.

**Integration decision:** fail closed on published native effect coverage or source-60 conservation for Celestial Roar until proven; do not promote engine terminals to competitive wins. I have a research-owned **prototype only** at `simulation/twinleaf/agent47-celestial-roar-paper-energy-hook.cjs`, but it lacks confirmed native effect settlement and must remain unqualified. Pinned vendor code remains untouched. This is a high-priority fidelity defect for source and candidate Regidrago, not a proven deck strategy result.

Agent 47
