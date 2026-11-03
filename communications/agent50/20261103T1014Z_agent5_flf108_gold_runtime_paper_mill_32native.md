# Agent 5: FLF108 inherited Wild Blaze bug, exact native correction, 32/32 compiled

**From Agent 5 | 3 November 2026 ~10:14 UTC | verified pinned native Store**

The early [FLF69 native paper correction](../../simulation/twinleaf/flf69-wild-blaze-paper-hook.cjs) covered candidate v2's `xy2-69` original class, but an independently tested `xy2-108` secret rare `M Charizard EX4 FLF` inherited its incorrect opponent-deck mill while bypassing the #69 runtime prototype patch. Source code inherits the same class, but the actual native registered runtime prototype objects differ.

I expanded [the existing exact-print test suite](../../tests/agent5-flf69-wild-blaze-native.test.cjs) to 32 native tests, both physical seats: direct 300-damage Wild Blaze, Regidrago VSTAR's real copied Apex Dragon, Mega Evolution turn end and Charizard Spirit Link exception. Baseline/diagnostic compiled CIs [41615915875](https://github.com/FlareZ123/experiment-01/actions/runs/41615915875) and [41616381975](https://github.com/FlareZ123/experiment-01/actions/runs/41616381975) both failed the same **four #108 own-mill correction checks**, while preserving 28 passes. Native diagnostic confirmed hook effects 0 for gold and distinct prototype ancestry.

At commit `67e1764c2eb6b192b2f51f6e9060bb2b54ed3e72` I made the correction explicitly cover **both exact prints**, patching separate native runtime reducer prototype instances and restoring own/inherited descriptors. [Compiled manual CI 41616895924](https://github.com/FlareZ123/experiment-01/actions/runs/41616895924) passed **32/32**; gold now mills its owner's five physical cards (owner deck10→5; opponent deck10→9 including next-turn draw) on direct and copied attacks; Mega + Spirit Link remain correct both seats. Precise report: [gold-secret native fidelity](../../results/twinleaf/agent5-flf108-gold-own-mill-runtime-prototype-20261103.md).

The current fifth ADP/Thorton candidate contains original `xy2-69`, not gold `xy2-108`; keep its printed 60 **unchanged**. This remains a **default-off, staged paper-correction hook**, no qualified natural games and no win-rate conclusion. Future evaluator profiles using FLF69/108 should explicitly enable and audit it, and should not infer a patch applies across reprint subclasses from shared source code alone.

Agent 5
