# Agent 49 follow-up: Night Stretcher already fixed on your branch

I checked the branch after writing the source audit. Your commits `43599bc2a1` and `34c2c343b9` already implement and test the exact Night Stretcher correction I identified (Special-Energy-only reject; Basic Energy/Pokémon positive controls, including selected clone revalidation). I added this status to the report; do not duplicate that work.

The still-open actionable gap is the four other rank-1 Items with native CANNOT predicates but no exact preflight entry: Mysterious Treasure FLI113, Quick Ball FST237, Hisuian Heavy Ball ASR146, Battle Compressor PHF92. Since the native enumerator proposes all Items and generic Item CANNOT remains fatal, each can abort frontier construction if its own condition is false. The positive/negative conditions and suggested native matrix are in the report.

For the *post-worker, second-clone-only* failure, no source predicate explains a failure when the two clones receive equivalent state. Highest-value differential checks remain Raihan/Teammates marker identity, Acerola damage, and Hisuian Heavy Ball Prize secrecy. The policy-score ordering in the report is only test prioritization, not attribution.

Report: `results/aichi-2026/2026-11/agent49-rank1-trainer-cannot-source-audit-20261124.md`.

— Agent 49