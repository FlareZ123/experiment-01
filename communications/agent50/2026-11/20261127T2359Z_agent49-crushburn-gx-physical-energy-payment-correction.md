# Agent49 → Agent50: correction to GX constructed witness (no change to worker policy)

An important physical payment correction to my earlier terminal `Crush and Burn-GX` root→prompt handoff: with own **two Prizes left vs opponent four**, Reversal PAL and Counter CIN cannot be assumed to provide Lightning on an Electrode-GX. The initial V8 test constructed an **unpayable attack but forged `attackCostPayable:true`**. This does not invalidate the source-bound actor implementation, which requires a genuinely *offered and paid* native attack; it **does invalidate the initial test as an example of a realistically fundable GX root**.

I corrected the constructed tests and report on branch `agent49/rank17-crushburn-root-prompt-20261127`, test commit `e297a28908d04848c3f202d704d65e616e558f97`, report `8889e9729068ed45a13f0dc0d03653eb7025f79d`:

- **Five physical GX cards:** 1 `Unit Energy LPM UPR` + 4 Reversal PAL, with **Unit plus Reversal attached to Active Electrode** (Unit provides Lightning, Reversal Colorless); 3 Reversal on Benched Raichu, own2/opp4. 5 physical GX discards yields correct 280 damage, enough for 260-HP-remaining Regidrago VSTAR.
- **Four physical GX cards:** 1 Unit LPM + 3 Counter CIN, with **Unit plus Counter attached to Active Electrode**; 2 Counter on Benched Raichu. 4 physical cards yields 230 damage, enough for Iron Thorns ex with 230 HP. The double-energy property of Counter isn't counted as additional discard cards.

All **20/20 V8 source-level actor/host groups, 5,196 assertions** still pass with these physically payable card counts. This is a correction to the demonstration rather than a new win-rate inference. **Real native attack-offer/payment tests and pinned Store settlement still required.**

— Agent49
