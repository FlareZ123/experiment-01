# Absol/Garbodor hard-matchup screen: four actual Aichi lists

**Agent 7, 17 October 2026.** Source: [29 published exact 60s](full-decklists.json), the attached paper-rules/card database and [champion builder's first-person account](champion-builder-strategic-prior.md). The builder regarded Mega Absol/Garbodor as nearly unwinnable for the selected champion list. That judgment is a qualitative prior. **There are still zero independently qualified competitive games.**

## Mechanical problem

Mega Absol ex MEG 86 is a 280-HP Darkness Basic. Its Claw of Darkness costs Darkness/Darkness/Colorless, deals 200 and discards a selected opposing hand card after revealing that hand. Shadow Rider Calyrex VMAX CRE 75 has 320 HP, Darkness ×2 Weakness and awards three Prizes on Knock Out. Thus an unmodified completed Claw into that VMAX deals **400** and takes **three Prizes**.

Shadow Rider's Max Geist deals `10 + 30 × Psychic Energy attached to all your Pokémon`. Against a fresh Mega Absol ex it needs **nine Psychic Energy in play** for 280 damage, with no modifiers. The champion 60 registers **11 Psychic Energy** and **one Field Blower**. Garbodor LTR 68 or BKP 57 suppresses Underworld Door while it has a Tool attached. Opponent re-Tool potential and Item-lock timing can shrink the single Blower's effectiveness. A first attack, retreat, gust or other Pokémon attack could change this damage calculation.

## Four distinct registered opponents

| Rank | Mega Absol | Trubbish / Garbodor | Float Stone | Other distinct pressure |
| --- | ---: | ---: | ---: | --- |
| 8 | 2 | 2 / 2 | 4 | 1 Budew, 4 Dark Patch |
| 11 | 3 | 2 / 2 | 3 | 2 Oranguru V, 2 Shopping Center, 2 Forest Seal Stone |
| 16 | 2 | 2 / 3 | 4 | 2 Budew, 3 Ultra Ball |
| 22 | 2 | 2 / 2 | 4 | 1 Budew, 2 Vikavolt V with Paralyzing Bolt Item lock |

All four contain two Temple of Sinnoh and three or four Dark Patch. Garbotoxin requires evolution and a surviving Garbodor with an attached Tool. Budew/Vikavolt Item lock requires actual attacks. Tool restoration, search, Energy acceleration and opponent response require explicit game-state analysis.

## Direct natural-draw opportunity

[The exact BigInt source audit](../../scripts/aichi-absol-garbotoxin-window.cjs) conditions on a valid seven-card opener containing at least one Basic. It then asks whether **Trubbish appears by the first own turn's normal draw**, and at least one **Garbodor and Float Stone appear by the second own turn's normal draw**. The two draws and initial hand are random without replacement; six unseen Prizes are marginalized by permutation exchangeability. This excludes every search, redraw, recovery, mulligan bonus, alternate evolution, lock and player choice. Its probability is a narrow resource-access event, with no implication of a completed lock.

| Source rank | Basic count | Exact conditional opportunity |
| --- | ---: | ---: |
| 8 | 10 | 3.43320814% |
| 11 | 11 | 2.60551432% |
| 16 | 11 | 4.67472210% |
| 22 | 12 | 3.18012142% |

The exact denominator is `[C(60,7)-C(60-B,7)] × 53 × 52`, where B is the Basic count. Numerator enumerates five disjoint card categories in the opening seven, then the ordered first and second draw, subject to Trubbish's earlier availability. The four reduced fractions are in the reproducible script's JSON output. Search and acceleration in these exact 60s can greatly increase actual resource access. A real Tool-enabled lock may also fail after direct access because of Bench, evolution or opponent-interaction constraints. **Neither execution probability nor win frequency is estimated.**

## Reproducibility and action gate

[Tests](../../tests/aichi-absol-garbotoxin-window.test.cjs) assert every exact rank's printed threat counts, the four fractions and zero access when a core ingredient is absent. The existing [manual opening-audit workflow](../../.github/workflows/aichi-opening-audit.yml) ran successfully at [CI 39041622760](https://github.com/FlareZ123/experiment-01/actions/runs/39041622760). Separately, a seeded 200,000-deal rank-16 physical-shuffle diagnostic yielded 7,228 qualifying among 155,458 valid hands, consistent with exact 4.67472%. Both tests and formulas concern direct-resource opportunity.

**Next hard-matchup gate:** for ranks **8, 11, 16, 22**, capture full authentic 60-card source deals in both actual starting orders with version-pinned policies. At the first meaningful threat, record Mega Absol energy/payment and attack, Shadow Rider Energy and available KO lines, Garbodor Tool state, Field Blower/gust access, and Budew/Vikavolt lock order. Run a legal opponent response and preserve the first failed requirement. Rank 22's double-lock route and rank 11's Shopping Center Tool handling require separate treatment. See the [Critic's current veto direction](../../communications/broadcast/20261017T1413Z_critic_policy-drift-hardmatchup-veto.md).

**Evidence status:** printed-card arithmetic and specified combinatorics verified; no source-dealt matchup, independent policy qualification, or 99.5% result is established.
