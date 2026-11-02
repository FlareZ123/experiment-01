# Apex Alchemy Shake4/Quick2 v1: exact 60-card one-slot tradeoff with a measurable early Muk frontier

**Agent 2 | 2 November 2026 | fixed 60 proposed for falsification, zero native games, zero competitively qualified paper games.**

## Decision hypothesis

[Agent43's Apex Alchemy v0](agent43-apex-alchemy-structural-candidate-20261102.md) integrates Regidrago VSTAR / Alolan Muk / Boost Shake, but its exact first-eight opening calculation has a disproportionately strong sensitivity to holding Boost Shake. Rather than assuming a risk-free spare slot, this alternative makes an **explicit, physically realizable one-card trade**:

- **+1 Boost Shake EVS 142**, changing 3 to 4 copies.
- **-1 Quick Ball FST 237**, changing 3 to 2 copies.

Every other printing and count stays unchanged. The machine-readable [full frozen 60](agent2-apex-alchemy-shake4-quick2-v1.json) has canonical SHA-256 **`5cd6b0fc7781e1a5a3b29f5a23654750295af89bdc63621f235fbd0c56701fd0`**, computed as SHA-256 of UTF-8 sorted `cardId:count\\n` lines. The independent unchanged source 60 remains **`21846db95f88d5d5abc6ee3876b3522732092e27ca5e7485948f354d8468a769`**. This is a **sixth research candidate**, not the elected single best list, and it has no game-win evidence. The limited English database legality of each printed card follows the v0 checked inventory, subject to further Japanese paper format/errata validation.

## Complete unchanged-except-two printed 60

### Pokémon (20)

| Quantity | Printed card | ID |
| ---: | --- | --- |
| 4 | Regidrago V (SIT 135) | `swsh12-135` |
| 3 | Regidrago VSTAR (SIT 136) | `swsh12-136` |
| 2 | Alolan Grimer (SUM 57) | `sm1-57` |
| 2 | Alolan Muk (SUM 58) | `sm1-58` |
| 1 | Dragapult ex (TWM 130) | `sv6-130` |
| 1 | Dialga-GX (UPR 100) | `sm5-100` |
| 1 | Hisuian Goodra VSTAR (LOR 136) | `swsh11-136` |
| 1 | Noivern ex (PAL 153) | `sv2-153` |
| 1 | Kyurem (SFA 47) | `sv6pt5-47` |
| 1 | Koraidon ex (TEF 120) | `sv5-120` |
| 1 | Tapu Lele-GX (GRI 60) | `sm2-60` |
| 1 | Latias ex (SSP 76) | `sv8-76` |
| 1 | Budew (ASC 16) | `me2pt5-16` |

### Trainer (30)

| Quantity | Printed card | ID |
| ---: | --- | --- |
| 2 | Professor's Research (JTG 155) | `sv9-155` |
| 2 | Guzma (BUS 115) | `sm3-115` |
| 1 | Carmine (TWM 145) | `sv6-145` |
| 1 | Iono (PAL 185) | `sv2-185` |
| 1 | Crispin (SCR 133) | `sv7-133` |
| 1 | Raihan (EVS 152) | `swsh7-152` |
| 1 | Faba (LOT 173) | `sm8-173` |
| 4 | Mysterious Treasure (FLI 113) | `sm6-113` |
| 2 | Quick Ball (FST 237) | `swsh8-237` |
| 4 | Boost Shake (EVS 142) | `swsh7-142` |
| 3 | VS Seeker (PHF 109) | `xy4-109` |
| 1 | Battle Compressor Team Flare Gear (PHF 92) | `xy4-92` |
| 1 | Hisuian Heavy Ball (ASR 146) | `swsh10-146` |
| 1 | Field Blower (GRI 125) | `sm2-125` |
| 1 | Prime Catcher (TEF 157) | `sv5-157` |
| 1 | Float Stone (BKT 137) | `xy8-137` |
| 1 | Stealthy Hood (UNB 186) | `sm10-186` |
| 2 | Giant Hearth (UNM 197) | `sm11-197` |

### Energy (10)

| Quantity | Printed card | ID |
| ---: | --- | --- |
| 4 | Double Dragon Energy (ROS 97) | `xy6-97` |
| 3 | Basic Grass Energy (SVE 1) | `sve-1` |
| 3 | Basic Fire Energy (SVE 2) | `sve-2` |

**Totals: 20 Pokémon, 30 Trainer, 10 Energy = 60 cards.** Only one ACE SPEC (Prime Catcher); all Basic Energy and other name-copy constraints preserved. Both lists retain 12 Basic Pokémon, four Mysterious Treasure, two Alolan Grimer, two Muk and ten total physical Energy. The full manifest preserves each exact English printing.

## Independent probability comparison

The [exact first-eight and six-Prize model](../statistics/agent2-apex-alchemy-first-eight-slot-frontier-20261102.md) enumerates 7 opening cards, one ordinary first-turn draw, six Prize cards and availability of a searchable Alolan Muk. An extra Item search for Grimer is counted only as an idealized opportunity; it assumes a legal one-card discard, live Items, suitable Bench, proper sequence and a Muk surviving in deck. The **first seven must contain a Basic**, which has probability 80.93533073% under either fixed 60.

| Measured necessary opportunity, conditional on valid initial seven | Original Apex Alchemy v0 | This exact Shake4/Quick2 v1 | Change |
| --- | ---: | ---: | ---: |
| Grimer + Shake directly in first eight, searchable Muk survives | 9.26277443% | 11.71727191% | **+2.45449747 pp** |
| Same with a **non-Grimer Basic starter in initial seven** | 6.29698142% | 8.00247627% | **+1.70549485 pp** |
| Idealized Grimer search from Treasure/Quick Ball also permitted | 23.08980144% | 27.48178669% | **+4.39198525 pp** |
| Search-assisted and independent non-Grimer opening starter | 20.12400842% | 23.76699105% | **+3.64298263 pp** |

These figures are exact combinatorial **hand/Prize opportunity** probabilities within the stated window, independently enumerated in Python and reproduced in Node by the versioned source model. They are **not** the chance of successfully playing Boost Shake, establishing Muk, taking a Prize or winning a matchup. The two Prize risks of both Muk copies (0.84745763%) and all three Regidrago VSTAR copies (0.05844535%) remain unchanged.

For comparison, a hypothetical fourth Shake obtained by cutting an unmodeled non-Basic/nonsearch card would reach 29.21711% search-assisted or 25.50232% with an alternate starter. The explicitly paid Quick Ball cut therefore sacrifices **1.73532457 pp** and **1.73532457 pp**, respectively, of idealized access compared with that free-slot upper screen. That is the measurable cost of reducing search by one copy in this limited model.

## Newly quantified collateral loss: Budew Quick Ball axis

The independent [exact Budew counter-axis](agent2-apex-alchemy-budew-search-opportunity-cost-20261102.md) demonstrates that the same physically registered swap that improves idealized alternate-starter Muk access by **+3.64298263 percentage points** reduces idealized first-eight Budew direct-or-Quick-search access from **41.50397560%** to **34.01388181%**, **-7.49009379 percentage points**. These are separate resource-opportunity measures, with incompatible game-state utility and with all search discard and attack mobility costs excluded. This is a significant *counterargument to promoting the challenger*, especially because Budew's *Itchy Pollen* can impose an early opponent Item lock. Mysterious Treasure cannot search the candidate's Grass Budew. Both exact fixed60s remain viable hypotheses pending natural matchup tests.

## Strategic costs, obvious disqualifiers and counterexample plan

The extra Shake cannot operate under an opposing Item lock that disables all Item plays. Playing Boost Shake **ends the owner's turn**, precluding a same-turn Budew Item-lock attack or Regidrago Prize-taking attack. Fewer Quick Balls narrows access to **Basic Pokémon other than Grimer**, including early Regidrago V, Budew, Latias ex and Tapu Lele-GX; Mysterious Treasure's Psychic/Dragon restrictions cannot substitute for arbitrary Basic search. The improved Muk-opening numerator therefore buys a concrete late/alternative-line consistency cost. It also does not solve Energy colors or multiple-turn Regidrago evolution; Prime Catcher, Tool answers, Field Blower and Energy counts remain constant.

Challenge this v1 against the original Aichi Iron Thorns ranks 6/24/29, Garbodor/Absol ranks 8/11/16/22, Vileplume ranks 2/15 and Regidrago ranks 10/12/13/14/18/20/21/27/32. The first falsifier is whether a **paid natural hand → Grimer Bench → actual Boost Shake → Alolan Muk** sequence survives realistic opposing pressure when both decklists are placed into the same source-qualified two-player policy. Under heavy Item lock, the fourth Shake slot may be fully dead. Under a fast aggressive matchup, ending turn for Muk may lose a prize exchange. Require full legal actor-selected root, complete Prompt/payment/effect custody, own Ability suppression and competent opponent continuation, not a staged board or exposed card count.

A future registration should freeze this candidate SHA alongside the original v0, original Aichi source 60s, both player seats and first-player order, source physical deals rather than same-seed assumptions, all native errors/caps, and the official 25-minute paper match clock. No advantage can be inferred from an unqualified engine terminal. The original opponents remain **29/32 authenticated**, ranks 23/25/28 missing, and **zero competitively qualified games** exist.

**Current recommendation:** retain v0 as reference, admit Shake4/Quick2 only as a fully specified sensitivity challenger, and prioritize a small adversarial matchup test before extending it to the whole field. The 99.5% target remains unproven.

## Independently executed regression status

[Manually dispatched field-gate run 41535766261](https://github.com/FlareZ123/experiment-01/actions/runs/41535766261) completed **successfully** at frozen head `907ab2942ab629c807f2b8119e80954c5d6d1276`. Its final Node suite includes the unchanged Agent43 exact 60 legality and first-eight tests, corrected alternate Basic-starter branch, and the [Agent2 independent fixed-60 SHA / count / specific delta / six variant probabilities](../../tests/agent2-apex-alchemy-first-eight-slot-frontier.test.cjs). This is a CI-verified **static card identity and exact numerical calculation**, with **zero native games and zero qualified competitive games**. The immediately preceding unsuccessful workflow attempts documented first the double-counted/missing branch and then an Agent2 incorrect literal SHA; both defects were corrected before this successful run.
