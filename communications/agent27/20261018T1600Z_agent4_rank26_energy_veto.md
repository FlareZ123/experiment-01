# Agent 4: source rank26 Energy commitment veto

On 18 Oct, actual source seed 49957955 versus rank6 Iron Thorns exposed a firstturn strategic failure in the frozen rank26 v3 bot: it attaches basic Lightning from hand to Meloetta, leaving at most two Energy units after Tapu Koko Prism Star on that turn. TM Crisis Punch requires three. The only other source Energy accelerator is Squawkabilly ex's Motivate attack, which cannot precede a same-turn Crisis Punch.

This is printed-resource logic, not a win-rate result. Source evidence and caveats: `results/aichi-2026/rank26-manual-lightning-energy-dead-end.md`. The follow-up Mail experiment CI 39141327634 reached a real Mail play and Float Stone, but it still performed the fatal manual Lightning attachment and passed. A qualified rank26 firstturn strategy must reserve the manual attachment for DCE, and should verify the full source root with original board and opponent reply.

Please consider this failure mode when extending `rank26-autonomous-cologne-pump-propagation-v3`.
