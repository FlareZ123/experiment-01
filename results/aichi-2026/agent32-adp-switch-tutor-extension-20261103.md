# Agent 32: quantified Switch + tutor extension to fixed ADP GX opener

**3 November 2026.** Complement to the [direct ADP-starter exact screen](agent32-adp-first-gx-exact-physical-window-20261103.md). This adds an independently classified **non-ADP opening Active** branch to the same unchanged Agent5 [ADP/Thorton/Regidrago v2 60](candidates/agent5-adp-thorton-regidrago-60-v2.json), canonical card identity **bab0ff2ea97da8c410e9ca096ec1826a3f5186878de684856c4dd9454b40d19b**. No native games or matchup wins.

## Additional physical event

The initial seven contain at least one **other** Basic Pokémon but **no ADP**. That other Basic starts Active. Before the going-second player's first own turn's attack, the first eight owner-visible cards must contain **Switch**. ADP is either the actual eighth ordinary draw, or remains in the searchable deck and **Tag Call or Quick Ball** is held to retrieve it. The owner can Bench ADP and use Switch to promote it Active. Double Dragon Energy is either held or searchable through held Guzma & Hala, or through Tag Call finding G&H from the deck. A single Tag Call can legally search the TAG TEAM Pokémon **ADP** and the TAG TEAM Supporter **Guzma & Hala** together, provided both remain deck-searchable. If DDE is absent from the first eight, one must remain outside six Prizes. If G&H must be retrieved by Tag Call, at least one G&H must also remain outside Prizes.

This remains an **optimistic physical window**: Quick Ball's discard and G&H's two-card optional discard must be physically available and strategically tolerable. We have not proven actual native legality, an opponent allowing those Items/Supporter, or a GX attack in a real game. Other Active mobility, extra draws and ability searches are excluded.

Input disjoint 60-card category counts: **ADP 2; other Basic 5; Switch 2; Tag Call 4; Quick Ball 3; G&H 3; DDE 4; Other 37**.

## Exact result, conditioned on Basic-valid initial seven

| Newly admitted non-ADP starter branch | Conditional percentage |
| --- | ---: |
| ADP arrives as eighth card, DDE already held | **0.163939810213%** |
| ADP arrives eighth, G&H/Tag finds DDE | **0.180890627720%** |
| ADP fetched from deck by Tag/Quick Ball, DDE already held | **2.940459290858%** |
| ADP fetched from deck, G&H/Tag finds DDE | **4.177158258365%** |
| **New Switch-enabled union** | **7.462447987156%** |
| Existing disjoint actual-ADP-starter union | **28.993653012532%** |
| **Either route** | **36.456100999688%** |

The original and Switch routes are **exactly disjoint**, because one requires ADP in the initial seven and the other excludes it. The combined reduced fraction is **45,642,536,338,009,879 / 125,198,622,268,979,520**. New Switch favorable integer mass is **18,685,764,197,723,998** over the same **250,397,245,379,590,400** equally weighted Basic-valid initial-seven / eighth-draw / six-Prize configurations. The four new raw masses are **410,500,768,852,720**, **452,945,148,961,872**, **7,362,829,065,817,260**, and **10,459,489,214,092,146** respectively.

Within this narrow no-extra-draw/no-other-mobility approach, **63.543899%** of Basic-valid opening deals lack the prerequisite access even before opponent disruption. This is **not** a bound on all legal GX lines, since draw and alternative search/promotion can open further routes. The mathematical event also gives no success guarantee when it holds.

## Derivation and reproducibility

The [second exact BigInt enumerator](../../simulation/evaluation/agent32-adp-switch-first-gx-physical-window.cjs) groups all physical first sevens, requires no ADP and at least one other Basic, then considers all eight-draw categories. For each qualifying hand it demands Switch plus an accessible ADP target, a held DDE or a complete G&H/Tag DDE search chain, and uses Prize inclusion-exclusion to ensure the groups that must be fetched are not fully Prized. Add to the previously calculated ADP-starter mass; their initial-seven conditions make double-counting impossible.

The direct eighth-ADP/held-DDE/Switch subcase has an independent closed-form check: the eligible initial-seven count is C(58,7) - C(53,7) - C(56,7) - C(54,7) + C(51,7) + C(49,7) + C(52,7) - C(47,7), multiplied by **2** possible eighth-card ADPs. That closed form equals the grouped result exactly. A separate physical shuffle check with seed **2026110302**, 250,000 permutations, and **150,526** Basic-valid sevens observed **260 / 257 / 4,357 / 6,211** new branch hits, consistent with the exact results.

[Six source-exact tests](../../tests/agent32-adp-switch-first-gx-physical-window.test.cjs) cover the fixed sixty, four exact branch masses, the independent closed form, removal of Switch, removal of Quick Ball and removal of DDE. Together with the prior six tests, the existing **manual-only** [card-audit workflow](../../.github/workflows/aichi-card-audit.yml) completed **SUCCESS** in [GitHub Actions 41553167913](https://github.com/FlareZ123/experiment-01/actions/runs/41553167913), pinned research head **c37ddf2c9abf824d0606acfb23cc4f9d3bc4a159**. The exact ADP step finished with status SUCCESS. No modified candidate roster, native game, CI-on-push trigger or new gameplay winner claim is involved.

## Decision-changing implication

Including the obvious held-Switch and Tag/Quick Ball access reduces a key criticism of the first 28.99% screen: those routes were previously deliberately excluded. Their exact extra access is **7.46 percentage points** under the stated assumptions. An ADP-first enhanced-GX-centric structural claim needs additional search, mobility, card draw, first-player alternatives and hard-source counterplay to clear the still substantial unaddressed physical-opportunity gap. Next native work belongs in the **one selected, symmetric, two-seat common-policy harness**: register all source physical deals, selected ADP promotion, real one-/two-card payments, enhanced GX, eventual Thorton and opponent answer before ranking the unchanged sixty. An engine terminal or legal fixture does not establish a qualified paper game.

**Shared benchmark status:** 29/32 authenticated original Aichi opponent sixties, ranks 23/25/28 missing, zero qualified competitive games, no selected final sixty.
