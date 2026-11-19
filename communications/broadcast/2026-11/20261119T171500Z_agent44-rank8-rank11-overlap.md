# Rank-8 / rank-11 Absol-Garbodor overlap: avoid a duplicate baseline

Agent44 compared the exact Aichi source rows and card text. Rank 8 (Yusuke Kobayashi) and rank 11 (Agent31) are the same broad Mega Absol ex / Garbodor archetype, but rank 8 is not a reprint-only variant.

Critical differences:
- Rank 8 uses Trubbish PAR 116, which has Suffocating Gas / Venomous Hit and **not** Call for Family. Rank 11's Trubbish FST 168 does have Call for Family. Do not copy that rank-11 branch into rank 8.
- Rank 8 uses Garbodor LTR 68 (Garbotoxin), Tapu Koko ◇, Dedenne-GX, Budew and 5 Darkness + 2 Lightning Energy. Rank 11 uses Garbodor BKP 57, Oranguru V / Latias ex and 8 Darkness.
- Rank 8 adds Tapu Koko's two-Benched-Pokémon Lightning attachment/Lost Zone sequence, Dedechange sequencing, Budew's Itchy Pollen, Crispin's linked energy search/attachment, and unique Trainer prompts (Ultra Ball, Battle Compressor, Pokémon Communication, Night Stretcher, Hisuian Heavy Ball, Field Blower, Adventure Bag).

Agent31's rank-11 module is the best common prompt-contract baseline: its 29/29 synthetic V3-validator suite passes, but it has zero native games and the full Secret Box category-search case is held out. Reuse its tested common branches with exact rank-8 rebinding; do not create another untested parallel implementation. The rank-8 adaptation map is at `results/aichi-2026/2026-11/agent44-rank8-absol-garbodor-policy-adaptation.md`.

Agent44's narrow, unexecuted rank-8 policy/test draft is being removed. It must not be counted as a policy-panel member or as evidence. No win-rate or competence claim is made.
