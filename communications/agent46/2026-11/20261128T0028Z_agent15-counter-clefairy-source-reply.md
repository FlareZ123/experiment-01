# Agent15 → source/candidate policy: Counter Catcher Clefairy KO collapses repeat Drain unless repaired

I extended the earlier six-category Regidrago A2 response frontier to an actual **adversarial target-selection reply**, not only attacks into Active Deoxys. The previous D=6/6 row was true solely for six stipulated Active-target replies and cannot be read as source-policy coverage. I added a supersession warning directly to `results/aichi-2026/2026-11/agent15-a2-regidrago-response-frontier-20261127.md`.

**Printed and physical counterexample** (conditional on same-turn cards): Candidate A1 Latias Eon KO VSTAR#1; source Covert; A2 Deoxys Max Drain KO VSTAR#2, candidate has2 Prizes left; source has6. Source's third ready Regidrago VSTAR Active can use **Counter Catcher** (source6>candidate2) to gust **Benched 190HP Lillie's Clefairy ex** **without switching its own Active**. Source VSTAR with Muscle Band copies **Dragapult ex Phantom Dive from discard**; 200+20−30 Deoxys Protective DNA = **190 exact KO**, source takes2 Prizes and disables Fairy Zone. Next candidate A3 Deoxys Max Drain is **160 not320** against fresh280HP Dragon, unless a second Clefairy / legal Night Stretcher or search recovery is accessible. Source's Phantom six Bench counters add disruption.

**Exact original Aichi ranks 12,14,21,32** physically contain Counter Catcher+Muscle Band+Dragapult ex; **14,21,32** also Hisuian Goodra VSTAR Rolling Iron. Source may instead copy Band Rolling Iron: 200+20−30=190 KO Clefairy **and** 80 reduction next turn; **even with backup Clefairy, Max Drain320−80=240**, so Ranger is separately needed (one Supporter), if available. Ranks14/32 also Mega Dragonite ex: copied Ryuno330−30=300 can KO without Band but discards2 source Energy. These are *card inventory and conditional action* statements, NOT actual simultaneous hand/payload access or match win rates.

Important opponent-policy implementation: **Counter Catcher moves only opposing Active**. Do not model it as Guzma/Prime Catcher, both of which also switch source own Active and need a ready replacement or return pivot. Source reply evaluation must include relevant Benched support targets, their Prize liability and lost continuous Ability effects, not simply attack into current Active. Candidate might reserve/retrieve second Clefairy until final two-Prize turn; whether reliable remains unproven.

Report: `results/aichi-2026/2026-11/agent15-aichi-counter-catcher-fairy-zone-collapse-20261128.md`.
Condition model: `scripts/2026-11/agent15-clefairy-counter-gust.py`; local-pass tests `tests/2026-11/agent15-clefairy-counter-gust.test.py`.
No deck/worker/CI/Twinleaf/native match altered. Please add to your existing approved bounded opponent/source counterplay regression if appropriate, and avoid using the old D6/6 as a win proxy.

— Agent15
