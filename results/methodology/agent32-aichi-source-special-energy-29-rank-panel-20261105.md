# Source Special Energy exposure across 29 Aichi originals

**Agent 32, 5 November 2026. Exact physical opening model; zero native or qualified games.**

## Frozen input and contrast

The unchanged seven-Basic ADP/Thorton/Regidrago v2 and fourteen-Basic rank1 Shadow Rider reference provide different mulligan compensation opportunities to the original opponents. The authenticated source is `results/aichi-2026/full-decklists.json` (original blob `ae773f6201d7aa69d31914dbfee66f3fba692200`). Missing original ranks **23, 25, 28** remain unknown. Independent print-sensitive Basic counts come from [Agent32's existing Basic-resolver](../../simulation/evaluation/agent32-adp-field-mulligan-offers.cjs).

The new [original29 reproducible panel](../../simulation/evaluation/agent32-source-special-energy-field-panel.cjs) uses [the exact bilateral formula](../../simulation/evaluation/agent32-source-special-energy-exposure.cjs) from [our seven-source derivation](agent32-aichi-source-special-energy-bilateral-bonus-20261105.md). It classifies Basic/Special Energy by the actual original card name, retains all 29 ranks, verifies 60 cards each, 118 original Special Energy copies, 24 Special-bearing originals and the exact seven Special-only ranks.

| Original-source subset, equally weighted | At least one Special Energy vs 7-Basic | vs 14-Basic | Difference |
| --- | ---: | ---: | ---: |
| All 29 originals, including 5 without Special | **36.99889%** | **35.47076%** | **+1.52813 percentage points** |
| 24 Special-containing originals | **44.70699%** | **42.86050%** | **+1.84649 pp** |
| 7 Special-only originals | **61.90060%** | **60.18215%** | **+1.71844 pp** |

Largest differences are rank **2 Vileplume Control** and rank **15 Lopunny/Vileplume** (both 14 Basics / five Specials): **48.70720% versus 46.47450%, +2.23269 pp**. Smallest among Special-containing sources is rank **26 Meloetta Donk** (12 Basics / one Special): **11.95696% versus 11.20428%, +0.75268 pp**.

All probabilities condition on a legal Basic-containing original seven and assume the source elects every optional bonus draw offered from the contender's mulligans. Simultaneous invalid sevens restart both players and give no compensation. The table excludes ordinary first-turn draw; the [seven-source report](agent32-aichi-source-special-energy-bilateral-bonus-20261105.md) independently covers that variant and 100,000 physical-deal Monte Carlo trials per contender. The computation is an exact exchangeable-card model and upper/lower bounded against the negligible 47+ bonus-draw tail.

## Verification and limitations

The [four new Node regression tests](../../tests/agent32-source-special-energy-field-panel.test.cjs) passed locally on a separately constructed synthetic 29-row source fixture, checking rank6, 29/24 mean values and corrupted input rejection. The production full original-roster main entry was not executed through GitHub Actions in this incarnation. Equivalent formula arithmetic on the actual authenticated roster plus prior independently audited Basic counts produced the table.

A card in hand is not proof of an available legal Special Energy attachment or a strategically sensible source action. The new Issue #25 two-seat policy still needs owner-visible, payable attachments and a consequential opponent continuation. Candidate-induced source opening hands are treatment outcomes; candidate comparisons must retain *all* preregistered randomized trials, even when source physical openings differ under identical seeds. Paper printing validity, match-clock adjudication, full 32 opponents and competent opponents remain separate admission gates.

**Outcome:** no best fixed 60 selected; 29/32 source inventories, zero competitive-qualified paper games, no 99.5% evidence.
