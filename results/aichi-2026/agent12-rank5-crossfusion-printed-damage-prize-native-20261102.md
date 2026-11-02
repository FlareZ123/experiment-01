# Agent 12: independent printed Techno Blast damage and Prize audit of original rank-5 Mew/Genesect

**2 November 2026.** This is a retrospective paper-card-text baseline audit of eight **native-settled original-opponent** Cross Fusion Strike attacks from Agent13's 16-arm source-driver release. All eight observed outcomes match expected printed HP, Psychic Weakness, attack damage, knockout and Prize awards. **Zero competitively qualified games; no single-deck win-rate claim.**

## Controlled source and immutable replay

- Source opponent: original Aichi Open League 2026 final rank **5**, Yamato Nakano's authentic fixed Mew/Genesect 60. Its previously verified original printed-60 SHA-256 is `a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05`.
- Original native engine: pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Source native experiment: Agent13's independent preregistered 16-arm v3.1 release, [CI 41387484608](https://github.com/FlareZ123/experiment-01/actions/runs/41387484608), full [artifact 13115652707](https://github.com/FlareZ123/experiment-01/actions/runs/41387484608/artifacts/13115652707), ZIP SHA-256 `62201010d3930bfa47ae7927fe960b22ff38fba1aa053a53b419bc0a3aaab69d`.
- Exact **32,453,343-byte** source JSON file `agent13-rank5-v31-native-16arm.json` SHA-256 `7b35948d130495f97349ef3f030fcd62a8f33f990c32a8a4973e878b259ec792`. The reader refuses a different archive digest, experiment schema, 16-arm count, source printed-60 identity or vendor pin.
- New [pure validation and archived replay CI 41391671627](https://github.com/FlareZ123/experiment-01/actions/runs/41391671627) at research revision `c2ea7829e3315d52865c3273c0860d1a72f7c65f` downloaded **that same remote archive** using `actions/download-artifact@v4`, checked the source JSON cryptographic digest in the read-only Node runner, and passed all five new pure tests. The eight actual native outcomes passed the printed comparison **8/8**. Overall unrelated CI has a known-red unreviewed policy-key inventory test.
- Executable independent reproduction: `simulation/evaluation/agent12-rank5-printed-techno-blast-calibration.cjs`; negative/positive unit checks: `tests/agent12-rank5-printed-techno-blast-calibration.test.cjs`; existing manually triggered `.github/workflows/aichi-benchmark-stats.yml`, opt-in input `agent12_rank5_printed_native_replay:true`. Frozen repo `resources/cards/en/` exact English printings are consulted by card ID; no substitution of archetype templates or conjectured card HP.

The printed source cards consulted include Mew VMAX FST 114 (`Cross Fusion Strike`, Psychic type), Genesect V FST 185 (`Techno Blast`, **210** damage), Dialga-GX UPR 100, Latias ex SSP 76, Girafarig LOT 94, Galarian Articuno V CRE 58, Gengar & Mimikyu-GX TEU 53 and Tapu Lele-GX GRI 60. Native preattack board observations included Benched Genesect V, Double Colorless Energy attached to the attacking Mew VMAX, and a source-owned `ChooseAttackPrompt` selection of Genesect's Techno Blast. Copied-attack cost is provided by Cross Fusion Strike rather than charging Techno Blast's printed [M][M][C] separately.

## All eight native event results checked against printed cards

| Original rank-5 source vs fixed candidate | Native global turn | Actual target before attack | Printed expected Psychic damage | Printed expected KO | Actual source Prizes remaining |
| --- | ---: | --- | ---: | --- | --- |
| Champion reference, source physical seat 1 | 19 | Dialga-GX, 0 damage / 180 HP | 210 | Yes | 6→4 |
| Champion reference, same physical game | 23 | Latias ex, 0 / 210 HP | 210 | Yes | 4→2 |
| Champion reference, same physical game | 27 | Girafarig, 0 / 90 HP, Psychic ×2 Weakness | **420** | Yes | 2→1 |
| New Moon Lockbreaker, source seat 1 | 21 | Latias ex, 0 / 210 HP | 210 | Yes | 6→4 |
| New Moon Lockbreaker, same physical game | 25 | Galarian Articuno V, 0 / 210 HP | 210 | Yes | 4→2 |
| New Moon Lockbreaker, same physical game | 29 | Gengar & Mimikyu-GX, 0 / 240 HP | 210 | **No** | 2→2 |
| New Moon Lockbreaker, same physical game | 33 | Gengar & Mimikyu-GX, 210 existing damage / 240 HP | 210 | Yes | **2→0** |
| New Moon Lockbreaker, original source physical seat 0 | 69 | Tapu Lele-GX, 0 / 170 HP | 210 | Yes | 6→4 |

The last Gengar & Mimikyu-GX attack is especially important: this is a three-Prize TAG TEAM Knock Out with only two source Prizes remaining. Applying the real win condition gives the **two remaining Prizes**, so `2→0` is a correct game finish; expecting the player to receive three more cards would create a false simulator failure. All eight native pre/post target transitions and observed Prize deltas pass the exact printed-baseline comparison. There were **seven printed-threshold KOs**, **one 210-damage non-KO**, and **13 awarded Prize cards across these distinct native game episodes**.

### What was established, and important limits

The mathematical comparison treats Psychic Weakness and Resistance printed on the target, target's prior damage, printed HP, GX/V/ex/TAG TEAM printed Prize rules, and cap at remaining Prize cards. Native attack receipts must show genuine settled prompt chains and unbroken engine turns, source-owned Genesect V copied-attack selection, Benched Genesect and attached DCE; altered donor, missing DCE, wrong original 60, forged Prize delta and wrong archive SHA are rejected or reported as failures by tests.

**This does not certify arbitrary field damage modification, Active Ability locks, all attack text restrictions, exact real-paper clock adjudication, opponent strategy, or absence of a hidden-information leak.** The 210-damage and Prize alignment cannot by itself certify every effect of the entire match. The source attacks occurred at global turns 19–69, and the player policies remain developmental. The frozen 16-arm study's **two original-source native engine terminals** remain unqualified, and the two candidate engine terminals are likewise unqualified. The same source-physical seed within the same candidate is paired across control/treatment; comparing two different candidate lists under one numeric seed does not generally guarantee identical source physical deals.

**Benchmark status unchanged:** 29/32 original opponent 60s authenticated, ranks **23, 25, 28** absent; **zero competitively qualified full games**; no demonstrated 99.5% aggregate fixed-deck win rate.

## Next falsification targets

An independent prospective sample with new frozen seeds should audit Techno Blast's copied next-turn cannot-attack effect, any passive damage reductions or attack prevention, and actual opponent responses, while continuing to check every complete source/candidate physical deal. A fully qualified paper match would additionally need verified prize/setup sequence, printed attack costs under locks, genuine source/candidate decisions and the official tournament clock.
