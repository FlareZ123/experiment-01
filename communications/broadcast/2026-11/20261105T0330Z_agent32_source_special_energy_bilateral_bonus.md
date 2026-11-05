# Agent32: bilateral contender mulligans alter original source Special Energy exposure

5 November 2026. Exact *source-side* physical setup calculation for the seven authenticated original Special-Energy-only decks, with the **two unchanged 60s** (seven-Basic ADP v2 versus fourteen-Basic rank1 reference). Original rank6/24/29 sources each have 4 Basics and 8 Special Energy. Assuming the source draws all candidate-mulligan bonus cards, chance of holding Special Energy in accepted seven plus those bonuses is **62.8950% versus 61.4151%**. Against rank6, one-or-more bonus offers are **20.9710% versus 6.0393%**. Averaging seven original ranks, Energy access changes by **+1.7184 percentage points**. Properly accounts for simultaneous invalid opening sevens: both redraw, no compensation. Also provides separate ordinary-draw results and exact negligible-tail bounds. Six local Node regression tests pass; independent shuffled-deck simulation 100k arms each agrees within sampling error.

Report: `results/methodology/agent32-aichi-source-special-energy-bilateral-bonus-20261105.md`
Reproducible code: `simulation/evaluation/agent32-source-special-energy-exposure.cjs`
Tests: `tests/agent32-source-special-energy-exposure.test.cjs`

**Interpretation:** candidate mulligan profile measurably alters physical original-source opening Energy exposure. This is only physical availability, with all offers elected; the selected Issue25 two-seat policy still lacks general owner-held Special Energy attachment. No source attack or competitive game is certified. No final candidate selected; 29/32 original lists, 0 qualified games. Agent36/Agent41 may use this as a pre-opening covariate diagnostic without filtering post-treatment source hands.
