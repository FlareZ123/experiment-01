# Live rank11 three-Quick-Ball opponent response

**Agent 38, 19 October 2026 UTC.** Evidence: compiled, authentic source-dealt, one retrospectively selected seed. **Zero competitively qualified games.**

## Verified source and code

Published Aichi 2026 rank **11**, Wataru Yano Absol/Garbodor 60, source engine seat **A (0)** actually first, versus unchanged **New Moon Lockbreaker v1 English proxy** seat **B (1)** actually second. Fixed seed **1244180408**. Pinned Twinleaf **a9905a76a6c4103ba4b6cb9a49e86bad795c5c05**. Original physical deck hashes **ca1a7ce02983c438146f30bf01f303cf8210836f9e442e0d21a2513850ffcb18** and **99969539010abfa11c4e671a5744ed4d97f23cf2f7f275399ac35f5bc1013c0f**.

[Manual CI 39177078506](https://github.com/FlareZ123/experiment-01/actions/runs/39177078506) **passed**, head **7b8311b53cfd48378184c2332f2f51a621247619**. Artifact **12155200411**, ZIP SHA256 **aa7cbd07068ae86e7af38967c7443c234b6ec392911d19044ea578ff6a3f6655**, inner JSON SHA256 **f3fdea8986ad85caef12f66ae0492fd14a5dfef4359ebc4f73b39e91f33b4d97**. [Source policy](../../simulation/twinleaf/rank11-turn49-handburn-counterfactual.cjs), [two-arm runner](../../simulation/twinleaf/rank11-turn49-handburn-source-probe.cjs), [tests](../../tests/rank11-turn49-handburn-counterfactual.test.cjs) and [manual workflow](../../.github/workflows/newmoon-rank11-held-blower.yml) preserve reproduction details.

## Authentic live Item sequence

At source **turn 49**, actual own-hand evidence confirmed **10 Trainers**: Quick Ball FST x3; Carmine TWM x2; Secret Box TWM, Guzma BUS, Boost Shake EVS, VS Seeker PHF and Dark Patch ASR x1 each; plus Darkness Energy MEE x1. Source deck had **14** cards.

| Actual source turn-49 root | Item and paid discard | Trainers remaining |
| --- | --- | ---: |
| **288** | Quick Ball, discard Boost Shake | **8** |
| **293** | Quick Ball, discard VS Seeker | **6** |
| **298** | Quick Ball, discard one Carmine | **4** |

All three Items were truly played, their owner-discard prompts accepted, and all three Basic searches selected **zero** successfully. The counterfactual audit records **3/3 completed**, zero blocked, and remaining own hand Secret Box, Guzma, Carmine, Dark Patch, Darkness Energy. The source then attached Darkness Energy (**root303**) and attacked using Claw of Darkness (**root304**).

Printed Poltergeist at four Trainers would have **200 base damage**, beneath the active Mega Absol ex's **280 printed HP**, assuming no other modifiers. In the altered game the candidate **never actually used Poltergeist again**, so this is a printed-base calculation.

## Genuine engine consequence

Full root-action prefix **through global turn48** was identical for baseline and changed policy. After the changed game, an untouched source replay recovered the **exact entire original root ledger, decision trace, effect trace and terminal outcome**. Baseline root-ledger SHA256 **8e3ffcb56fdfb068647c436315e1d5b42d51fc2d58a099560ee0bd450ebad32a**; changed-branch SHA256 **ca6dc23e3bedd3defe47628da9f316ab83bf9e14149364a3187d437ec041ee64**.

| | Original | Three-Quick-Ball alternative |
| --- | --- | --- |
| Candidate turn50 | Forest Seal Stone, Perfection, real copied **Poltergeist** for **500** printed base | Forest Seal Stone, then **Pass** |
| Next source turns | No further turn | Claw of Darkness on turns **51, 53, 55** |
| Candidate turns52/54 | Game ended | Path to Peak + Pass; Rescue Carrier + Pass |
| Engine terminal | **Candidate wins turn50**, source/candidate Prizes **6/0** | **Source wins turn55**, source/candidate Prizes **0/1** |
| Competitive qualification | **0 games** | **0 games** |

Source obtained three Prizes after its turn51 Claw, then its final three on turn55. This is an actual **winner reversal under an explicitly amended opponent policy**.

**Limitations:** The test seed was selected retrospectively; the altered Quick Balls also shuffle the source deck, consume valuable resources and affect subsequent gameplay. Crucially, the candidate's generic policy **passed on turns 50, 52 and 54**, and its legal alternative attacks, retreat and gust opportunities have not been independently validated. The result establishes game-policy sensitivity and a legal hand-burn tactic. It makes **no competitive win-rate claim** and is **not a proven human-play win**.

Next, audit the candidate's actual turn50 own hand, public board and available Store actions. Execute a genuine candidate-stronger-reply counterfactual, preserving baseline prefix and every resulting opponent action. Broader claims require stronger agents, fresh seeds, both starts, paper-rule/printing/clock audits and all 32 exact source 60s. Current status **29/32 opponent lists, zero competitive-qualified games, no demonstrated 99.5% deck**.
