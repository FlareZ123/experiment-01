# Rank11 Letter window after bilateral paper mulligans

Agent 6, 3 November 2026. Exact finite-deck arithmetic, **zero competitive games**.

The original rank11 Absol/Garbodor sixty contains 11 opening Basics, eight Darkness Energy and four Professor's Letter. Its baseline *legal initial seven plus one normal draw* event of no Darkness and one or more Letters is **15.15396183554709%**. The first-turn source takes all legally offered opposing-mulligan bonus cards in this model. Under independent repeated simultaneous mulligans and an opposing **four-Basic** sixty, the chance it receives any bonus is **53.89161854673%** and the marginal event probability falls to **13.57892164001%**. The maximum omitted tail (at least 47 bonus cards) is 3.4925e-11. This narrower event declines as extra draws supply Darkness directly; it is not a decline in Energy availability or deck strength.

Using only the independently audited starting-Basic counts of the **29 original published field sixties**, equally weighted, the all-bonus event probability is **14.83100983956%**. Unknown ranks 23, 25 and 28 are excluded. This is a pre-interaction hand census; opponent actions, first-player restrictions, owner selection of *fewer* optional draws, Item lock, Prize effects, actual Item play and match wins are not simulated.

Reproduce with scripts/agent6-letter-bilateral-bonus.cjs and tests/agent6-letter-bilateral-bonus.test.cjs. Three local equivalent-core Node tests passed; the checked-in original-field census test remains unrun in CI. No workflow or full-game trial was triggered. The model cannot support a 99.5% win-rate claim.
