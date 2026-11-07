# Agent39: Temple versus Double Dragon source-field resource test, 7 November 2026

## Scope and source-derived card-text facts

This paper Expanded research uses the **29 authenticated original Aichi Top32 60-card name/count inventories** in [the original field dataset](full-decklists.json), plus the original local card corpus. Ranks **23, 25 and 28** remain missing. Original card-name counts are accepted only at their documented provenance level; exact event-era Basic Energy artwork and some physical printings remain unadmitted.

The original `resources/cards/en/xy6.json` printing **Double Dragon Energy ROS 97** provides two units of any Energy type when attached to a Dragon Pokémon and requires discard on a non-Dragon Pokémon. The original `resources/cards/en/swsh10.json` **Temple of Sinnoh ASR 155** makes all attached Special Energy provide *one Colorless* and have no other effect. The original `resources/cards/en/swsh12.json` **Regidrago VSTAR SIT 136** requires Grass, Grass, Fire for Apex Dragon.

One DDE plus one basic Fire can therefore pay Regidrago's GGF attack cost without Temple, but becomes one Colorless plus Fire while Temple applies, insufficient for the attack. Two Grass and one Fire Basic Energy remain enough even with Temple. The local manual's C-10 also matters for moving restricted Special Energy between Pokémon, though this report's original Regidrago funding question concerns Energy already attached to its proper Dragon recipient.

**Crucial original-card correction:** `resources/cards/en/sv8.json` **Megaton Blower SSP 182** *does* discard one Stadium in play, in addition to Tools and Special Energy. Six published Regidrago lists contain that ACE SPEC. Classifying it as merely Tool/Special removal would miss an actual one-use Temple answer. The other directly checked answers are `Field Blower GRI 125` (local `sm2.json`) and `Faba LOT 173` (local `sm8.json`), both explicitly mentioning Stadium removal. Stadiums of a different name can replace Temple using the normal once-per-turn Stadium rule.

## Original-field printed-card exposure and direct resource matrix

There are **10 of 29 authenticated source 60s with Double Dragon Energy (38 physical copies)**: nine Regidrago sources and one rank19 Raging Bolt source running an ADP-GX subline. Five other source 60s run Temple of Sinnoh, at ranks **3, 8, 11, 16, 22** (9 physical copies). This is source inventory exposure, with no inference about opening accessibility, prizes, or matchup outcomes.

The table lists directly present printed Stadium answers only. Each source has additional search, draw, Pokémon and Supporter lines, and their cost/availability may be much more important than the raw counts. A Megaton Blower can be blocked by Item lock, Faba consumes the sole Supporter play, and playing a replacement Stadium requires its own sequencing and may create a Bench constraint.

| Original rank | Archetype | DDE | Basic Grass / Fire | Direct alternate Stadium(s) | Other direct Temple removal | Count of direct answer cards |
| ---: | --- | ---: | --- | --- | --- | ---: |
| 10 | Regidrago | 4 | 4 / 2 | Parallel City ×1 | Faba ×1 | 2 |
| 12 | Regidrago | 4 | 4 / 2 | Parallel City ×1; Path to the Peak ×1 | Megaton Blower ×1 | 3 |
| 13 | Regidrago | 3 | 4 / 3 | Parallel City ×1 | Megaton Blower ×1 | 2 |
| 14 | Regidrago | 4 | 4 / 2 | Sky Field ×1 | Megaton Blower ×1 | 2 |
| 18 | Regidrago | 4 | 2 / 2 | Sky Field ×3 | None directly identified | 3 |
| 19 | Raging Bolt / ADP | 4 | 0 / 0 | Sky Field ×3 | Field Blower ×1 | 4 |
| 20 | Regidrago | 4 | 4 / 2 | Parallel City ×1; Path to the Peak ×1 | Megaton Blower ×1 | 3 |
| 21 | Regidrago | 3 | 4 / 3 | Parallel City ×1; Path to the Peak ×1 | Megaton Blower ×1 | 3 |
| 27 | Regidrago | 4 | 4 / 2 | Parallel City ×1; Path to the Peak ×1 | None directly identified | 2 |
| 32 | Regidrago | 4 | 4 / 2 | Parallel City ×1 | Megaton Blower ×1 | 2 |

The existing [Temple Shadow Rider v1 structural candidate](candidate-temple-shadow-rider.md) contains **two Temple of Sinnoh**. Under a hypothetical fully accessible, uninterrupted, one-use resource race, every listed DDE source contains at least two direct ways to clear those two Temple Stadiums. Six of the ten sources have three or four such cards. This is a **resource exhaustion warning** about treating two Temple copies as a persistent lock. The hypothesis does not say an opposing player actually has those answers in hand on time, can afford their costs, or can replay them after they are consumed; the K0/K1 and discard/Supporter/Item-lock constraints are substantial.

## Prize-only availability bound for candidate Temple counts

Before search, prizes, retrieval, hand economy and sequencing can be separated. Let a proposed fixed 60 contain `T` Temple cards, six randomly chosen Prizes, and `U` Temple cards outside Prizes. Then:

\[
P(U\geq k)=\sum_{u=k}^{T}\frac{\binom{T}{u}\binom{60-T}{6-(T-u)}}{\binom{60}{6}}.
\]

| Temples `T` | At least two unprized | At least three unprized | All four unprized |
| ---: | ---: | ---: | ---: |
| 2 | 80.84746% | Inapplicable | Inapplicable |
| 3 | 97.57452% | 72.48393% | Inapplicable |
| 4 | 99.77545% | 95.37359% | 64.85404% |

These are exact combinatorial source-agnostic Prize-only quantities. They are **not probabilities of drawing or successfully resolving those Stadiums**, and they do not account for taking Prize cards or recovering a Prized Stadium, opponent Stadium accessibility, or the opportunity cost of replacing other candidate cards. A four-Temple idea has more printed lock copies yet consumes two additional slots relative to Temple Shadow Rider v1, which already has quantified VMAX/setup consistency costs. No four-Temple 60 is nominated here.

## Concrete test and decision criterion

A [new two-seat pinned-native original-rank10 printings test](../../tests/agent39-rank10-regidrago-temple-dde.native.test.cjs) stages Regidrago VSTAR SIT with real DDE ROS, Fire SVE, its original Dragapult ex TWM attack donor in discard, and opponent Temple ASR. It compares (a) DDE plus Fire with no Temple, (b) the same under Temple, (c) native Parallel City BKT replacement of Temple followed by the attack, and (d) Basic Grass+Grass+Fire with Temple. The card list exactly verifies the original rank10 60 contains all named source pieces. It tests **native attack payability and actual required Stadium-direction prompt**, rather than a natural 60-card game or winner.

A Stage-1 native run [42338180504](https://github.com/FlareZ123/experiment-01/actions/runs/42338180504) recorded six successful cases: two seats each of no-Temple DDE+Fire attack access, Temple DDE+Fire refusal, and Temple basic-GGF attack access. The two Parallel-counter cases stopped at `ACTION_IN_PROGRESS` because the native *Parallel City* play creates a mandatory **SelectPrompt** asking which way the Stadium faces. This is not evidence that Parallel City fails to remove Temple; the test must first provide the player choice. The corrected native fixture handles that prompt, with a separate workflow rerun pending at initial publication.

**Promising future evidence threshold:** To compare a fixed candidate's two or four Temple slots, use a single immutable candidate 60 per A/B cohort; actual source-hand/prize awareness, exact Stadium-displacement root, Supporter/Item alternatives, opponent's next opportunity to reestablish special-Energy attacks, and full source return-turn payoffs. Keep original rank10/12/13/14/18/20/21/27/32 lists separate, record their differing direct counters, and retain full-game clock qualification gates. A staged paper-card disruption cannot substitute for the final 32-source field benchmark. Current **competitive qualified games: 0** and **selected fixed 60: none**.
