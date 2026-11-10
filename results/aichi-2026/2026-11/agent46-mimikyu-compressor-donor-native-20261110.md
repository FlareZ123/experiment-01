# Agent46: original-source Battle Compressor pays discarded Dialga and unlocks Mimikyu Timeless-GX

**10 November 2026, original-rank1 Shadow Rider versus rank10 Regidrago. Developmental selected-source legal-action result.** After the independent 32-arm donor-in-hand Treasure trial showed no prospective improvement in Copycat counts, a different line present within the *same unchanged original 60-card rank1 deck* became actionable: a physically held **Battle Compressor PHF** can retrieve its Dragon attack payload from the owner's deck rather than needing Dialga-GX in hand.

## Natural original-source mechanism

On frozen historical original seed **589307622**, rank1 owner physical seat0, the native candidate had Benched `Mimikyu GRI` with two basic Psychic Energy at the start of turn8, an actual opponent `Apex Dragon` previously declared, physical `Battle Compressor PHF` in own hand, GX still unused, and neither own hand nor discard containing Dialga-GX. The normal funded/promotion policy never put Dialga into discard, so the original baseline produced **0 Copycat** attacks in six Apex response windows.

I added reversible `simulation/twinleaf/2026-11/agent46-mimikyu-battle-compressor-donor.cjs`. This routes **only** the owner-visible Mimikyu-on-board and Energy-ready state with public Regidrago, unspent GX and owner-held Compressor to the printed Item action. It selects `Dialga-GX UPR` from the owner's **actual deck only after the real native ChooseCardsPrompt** requests card(s) to discard. The Item's printed reducer pays/shuffles. No donor card is created, no owner deck is inspected before searching, and opponent concealed zones remain inaccessible. Includes an independent `includeTreasureDonor:false` mode so the previously tested donor-in-hand Mysterious Treasure preference cannot explain the result.

Native both-seat registered-card Store tests in `tests/2026-11/agent46-mimikyu-battle-compressor-donor.native.test.cjs` passed all **four** staged tests, confirming that the exact owner physical card is moved from own deck to discard through Store response and the Mimikyu/attached Energy remain intact.

## Historical source-paired native observation

[Actions run 42734493565](https://github.com/FlareZ123/experiment-01/actions/runs/42734493565), full archived artifact `agent46-mimikyu-compressor-retrospective` **13726781137**, same original printed rank1/rank10 60s, **identical physical starting deal SHA256** `0cca0e2938b292da7dd0a600e0c7edaf11e0c8f0631cf6ae8d94eb7c882e9987`, 180-root action cap:

- Baseline 6 actual opponent Apex Dragon declarations and 0 candidate Copycat.
- Compressor-only treatment 2 actual opponent Apex Dragon declarations and **one actual Mimikyu Copycat**.
- Source turn **8**, native accepted root action **ordinal89** `PlayCardAction Battle Compressor`. One physical donor deck search/pay resolved and the native Store recorded it. A later **Copycat attack** by Active Mimikyu at source turn8 has genuine nested `ChooseAttackPrompt` root ordinal **95**, selecting **`Dialga-GX UPR / Timeless-GX`** (attack index 2).
- The following source turn **9** begins with the same Mimikyu Active/2 Energy, discarded Dialga-GX physically present and **GX used true**, consistent with a copied-GX extra turn. Native attack traces show the owner had **6 remaining Prizes before and immediately after Copycat's initial root**, then **4 remaining before its next recorded Shadow Rider Calyrex V Shadow Mist attack**. Independent public attack-transition replay is being generated to attribute exactly when those two Prizes were taken, because effects and Knock Outs can settle in later prompt actions.
- Both arms were **action-censored** at 180 roots, so there is no native terminal game result, much less a qualified competitive paper-game win.

This is stronger mechanism evidence than the earlier hand-donor Treasure selected result for a particular original seed, because the *actual native printed Battle Compressor and the actual card originally located in the deck* were both exercised. It remains a **selected historical state**, and the prospective eight fresh-seed/16-pair native source A/B has been separately registered under `results/methodology/registrations/agent46-compressor-donor-prospective-source-ab-20261110.md` to test generalization.

**Decision:** Maintain a conditional research-native Compressor donor option alongside other independently tested legal card routes. The source rank1 sixty itself remains fixed and unchanged. A full-32, strong-policy, paper-qualified success rate remains unestablished; the 99.5% target is not attained.
