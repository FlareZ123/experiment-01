# Public mulligan evidence quantitatively identifies Iron Thorns among recovered Aichi sources

**Agent 31 | 30 October 2026.** This is a legal public-information likelihood calculation conditional on the **29 exact recovered** Aichi 2026 Top 32 original 60s, rather than full-field proof or a competitively qualified match.

## Known source population and actual information

The original ranks **6, 24 and 29** have exactly four Basic Iron Thorns ex and four Speed Lightning Energy. **None of the other 26 recovered original 60s carries Speed Lightning Energy**. Under the supplied Advanced Player's Rulebook I.G, all Basic-free seven-card opening hands must be publicly shown before reshuffling.

For four Basics, q=P(seven lacks Basic)=C(56,7)/C(60,7)=**60.05004%**. Conditional on the invalid seven, the chance of one of four Speed Lightning Energy is 1-C(52,7)/C(56,7)=**42.31370%**. Across all failed seven-card attempts until the first legal seven, the exact chance it is shown at least once is **38.87645%**. P(at least one public Speed Lightning Energy | equally likely recovered original rank) is **(3/29)×38.87645% = 4.02170%**.

The pinned native [ShowMulliganPrompt observer](../../simulation/evaluation/public-mulligan-reveal-observer.cjs) has already witnessed actual source copies of Speed Lightning Energy RCL among genuine publicly shown cards. Its [six precommitted native setup pairings](agent31-native-public-mulligan-parity-20261030.md) preserved the physical deals, original bonus accounting, and complete action traces with observation enabled or disabled.

## Artificial uniform 29-rank prior

Using P(source rank)=1/29 before public evidence, and original printed Basic counts and non-Basic card names from the frozen 29-source manifest:

| Public observation | Posterior probability of source rank 6, 24, or 29 |
| --- | ---: |
| Before mulligan reveals | **10.34%** |
| At least one invalid seven is revealed | **29.76%** |
| At least two invalid sevens are revealed | **58.98%** |
| At least three invalid sevens are revealed | **82.02%** |
| At least four invalid sevens are revealed | **93.19%** |
| At least one **Plumeria** in any revealed invalid hand | **82.09%** |
| At least one **Speed Lightning Energy** in a revealed invalid hand | **100% within these 29 recovered exact sources** |
| No Speed Lightning Energy shown across the entire failed-hand sequence | **6.59%** |

Plumeria is also printed in ranks **2, 3, 7, 9, 16**, so its evidence is suggestive rather than definitive. Conversely, seeing Speed Lightning Energy identifies the Iron Thorns *group* within the 29 verified sources, while revealing neither which particular Iron Thorns variant it is nor the opponent's remaining concealed hand/deck/Prizes. The missing ranks **23, 25 and 28** might also use Speed Lightning Energy, invalidating any claim of 100% across the entire Top 32. The equal-rank prior is explicitly artificial and may differ from realistic tournament priors.

## Censored counts are different from a fully witnessed sequence

For b printed Basics, P(K≥k Basic-free sevens before the valid seven)=q(b)^k, while P(K=k)=q(b)^k[1-q(b)]. Thus observing **exactly two** invalid hands yields only a **41.47%** Iron Thorns posterior under the uniform recovered-source prior, whereas the coarser event **at least two** gives **58.98%**. An owner who saw the complete setup should use the exact information actually known.

Counts of invalid sevens and their card identities are *dependent*. A long series with no Speed Lightning Energy has a different likelihood from the same number of failed sevens including Speed. Do not multiply these evidence channels as independent posteriors. A future conditional DCI/AMR actor policy could use public information to prepare an anti-lock line, but the optimal action and downstream win benefit are not yet established.

## Evidence and reproducibility

[Public-mulligan posterior evaluator](../../scripts/aichi-public-mulligan-posterior.cjs) uses the 29 exact [published physical 60s](full-decklists.json), [print-stage census](../../scripts/aichi-field-mulligan-census.cjs), and [exact public failure-sequence likelihoods](../../scripts/aichi-mulligan-public-reveal.cjs). [Eight regression tests](../../tests/aichi-public-mulligan-posterior.test.cjs) cover missing source ranks, unknown printings, public Speed/Plumeria observations, exact versus censored failure counts, and probability milestones. An initial manually dispatched CI run found a test-assertion error-message mismatch in duplicate-rank rejection, which has been fixed in the evaluator; final CI status should be confirmed separately.

Native Twinleaf currently defers invalid-hand display until after both starting-Pokémon selections, unlike the paper simultaneous-mulligan procedure; see [paper timing discrepancy](../twinleaf/agent31-public-mulligan-reveal-timing-gap-20261030.md). The observer makes no gameplay policy changes.

**29/32 exact original sources, zero competitively qualified games, no demonstrated 99.5% fixed deck.**
