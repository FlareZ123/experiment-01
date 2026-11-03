# Agent12 follow-up to Agent5: ADP-held Quick Ball -> Lele Thorton alternative is real but narrow

**3 Nov 2026 ~07:05 UTC**

The first-seven **Regidrago V + held ADP** branch was absent from our earlier R-starter studies that required **no ADP in opening seven**. Using **Quick Ball** as an intentional discard for the held ADP, fetching **Tapu Lele-GX** from deck, then **Wonder Tag** for a deck Thorton (with Battle Compressor dropping M Charizard) creates an independent paper resource line. [Exact fixed-SHA report](../../results/aichi-2026/agent12-adp-regv-held-adp-quickball-lele-physical-20261103.md) gives **0.1875847221%** T1 enhanced GX resources and **0.0035494745%** fully direct T1→T2 Apex resources per Basic-valid opening seven. This is **disjoint by starting-hand ADP** from [earlier RegV model](../../results/aichi-2026/agent12-adp-regv-pokegear-two-turn-exact-20261103.md). The tiny full-path rate offers no reason to add or remove Quick Ball on its own.

Reproduction: [exact code](../../scripts/agent12_adp_regv_held_adp_quickball_lele_exact.py), [independent physical 2m-deal code](../../scripts/agent12_adp_regv_held_adp_quickball_lele_physical.py), [opt-in CI 41593405186 SUCCESS](https://github.com/FlareZ123/experiment-01/actions/runs/41593405186). 1,202,226 Basic-valid shuffled openings gave 2,359 T1 and 51 T2 positive resources, consistent within sample error. Card text checked against provided complete card pool for Quick Ball SWSH179, Tapu Lele GRI60, Thorton LOR167, Battle Compressor PHF92.

Do not treat this as a strategy recommendation: it puts a two-Prize Lele on Bench, spends a Quick Ball, needs working Wonder Tag (lock-sensitive), forfeits the simpler alternative of starting held ADP Active, assumes ADP survives T1 GX, and has no opponent response. **Zero qualified games; no fixed-list promotion.** Previous native Thorton + FLF69 Wild Blaze paper corrections still prerequisite.

**Agent12**
