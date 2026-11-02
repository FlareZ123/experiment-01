# Agent 6: native Tool Jammer fails to suppress Float Stone in two exact-source lock contexts

**2 November 2026 | Source-card text and staged pinned Store contrast. No qualified tournament games.**

## Observation that changes simulation validity

In the exact original rank30 Lillie's Clefairy sixty, a single **Float Stone BKT137** can make an uncharged Active `Latias ex SSP76` have no Retreat Cost even if public Path to the Peak or Iron Thorns ex Initialization suppresses Latias's **Skyliner** Ability. The already-attached Float Stone Tool is independent of that Pokemon Ability.

But **Tool Jammer BST136** says that while its carrier is Active, the opponent's Active Pokemon's attached Tools (except Tool Jammer itself) have no effect. Under paper text, an enemy Active Tool Jammer should disable our Active Latias's Float Stone. If Skyliner is simultaneously disabled, Latias's printed **two-Colorless Retreat Cost** returns, and an uncharged Latias cannot use a normal RetreatAction. `Jamming Tower TWM153` is a second Tool-suppression mechanism.

## Exact original opponent card presence

[Reproducible exact printed source census](../../scripts/agent6-public-skyliner-lock-field-census.cjs) now independently tracks Tool Jammer as an axis separate from Skyliner blockers:

- **All three exact original Iron Thorns sixties** in ranks **6, 24, 29** contain exactly **one Tool Jammer BST136** each.
- The two other exact Tool Jammer source ranks **3, 7** are Snorlax Stall.
- None of the seven original Path to the Peak source ranks **5, 9, 12, 15, 20, 21, 27** contains Tool Jammer.
- The original rank30 source contains **one Float Stone BKT137**, three Guzma BUS and three Field Blower GRI. These cards make alternative tactical paths plausible, conditional on hand, opponent Bench, Item and Supporter lock, and sequencing; no path or live-game frequency is established by deck inclusion.

## Completed native test, including deliberate failing CI

The [staged Store runner](../../simulation/twinleaf/agent6-skyliner-public-suppression-native.cjs) extended the previous 18 successful both-seat public Skyliner cases by adding six Float Stone scenarios, each tested from source physical seat 0 and seat 1. The unchanged pinned engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` was compiled in [manual CI run 41435336297](https://github.com/FlareZ123/experiment-01/actions/runs/41435336297). Pure public Float Stone and Tool Jammer selector tests all **passed**. The **native stage intentionally failed** after capturing 30 complete results: **8 failing native paper-fidelity checks across four offending physical rows**, and all other checked conditions passed.

The independently downloaded [full artifact 13135548917](https://github.com/FlareZ123/experiment-01/actions/runs/41435336297/artifacts/13135548917) has ZIP SHA-256 `1d4f0722e273c32e1aaef7d60f6d33607bb486b8eeecf93bfc0eafc0dfdfee4a` and 28,992-byte JSON SHA-256 `a7ec02ee70632ed9b0729f71a8d15259e42416661bd84325304c081fb9e84591`.

| Mode, repeated in **both** physical seats | Printed Skyliner native-blocked? | Native retreat cost | Actual native RetreatAction | Paper expectation |
| --- | --- | ---: | --- | --- |
| Path + own Float Stone, no opposing Tool Jammer | Yes | 0 | Accepted | Cost 0, accepted |
| Iron Thorns + own Float Stone, no opposing Tool Jammer | Yes | 0 | Accepted | Cost 0, accepted |
| Tool-equipped Garbotoxin + own Float Stone, no Jamming Tower | Yes | 0 | Accepted | Cost 0, accepted |
| Garbotoxin + own Float Stone + Jamming Tower | Yes | 2 | Rejected: NOT_ENOUGH_ENERGY | Cost 2, rejected |
| **Path + own Float Stone + opposing Active Tool Jammer** | **Yes** | **0** | **Accepted** | **Cost 2, rejected** |
| **Active Iron Thorns + own Float Stone + same Thorns equipped Tool Jammer** | **Yes** | **0** | **Accepted** | **Cost 2, rejected** |

Each native row preserved the directly computed `IS_ABILITY_BLOCKED`, actual `CheckRetreatCostEffect.cost`, native `RetreatAction` success/error, original nominal planner intent, source-only public guard and alternate Float Stone policy response. The staged original policy still proposes retreat in all modes because its printed Skyliner exists. The [new default-off Float Stone-aware public chooser](../../simulation/twinleaf/agent6-skyliner-or-floatstone-mobility.cjs) **correctly vetoes** both Tool Jammer cases in pure tests; native Store wrongly permits them.

**Fidelity finding:** The pinned Store as exercised does **not apply opposing Active Tool Jammer's suppression to Float Stone's Retreat-Cost effect** in these specific public source states. This is a bounded observed engine discrepancy, independent of any full competitive outcome. The difference could represent an unimplemented Tool Jammer effect or an issue in the staged engine path. Further isolate the exact native Tool Jammer implementation and reproduce with an authentic played Tool before treating it as a universal failure.

## Responsible next steps

A research-owned hook, with no upstream submodule modifications, may be needed to correct this exact Tool Jammer/Float Stone retreat interaction in headless evaluations. It must be **opt-in, versioned, tested in both seats, and scope its intervention to the proven effect**. The actor's own public Tool Jammer veto should remain conservative even while the underlying Store is wrong. After a patch, reproduce accepted/rejected native actions and then stage real published source hands, relevant opponent response, and official event clock.

All 30 cases are mechanically staged, including manually prepared board positions and attached Tools. The **29/32** authentic opposing sixties and **zero competitively qualified games** status are unchanged.
