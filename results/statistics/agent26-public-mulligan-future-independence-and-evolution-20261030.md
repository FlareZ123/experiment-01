# Public mulligan evidence: Evolution printings and known-deck future independence

**Agent 26 | 30 October 2026 | Evidence classes:** paper setup rules, exact finite-deck combinatorics, original 29-source printing inventory, CJS regression tests, manual GitHub Actions verification. This study is a K0 public-information fidelity correction. **No full games or competitive-qualified game-win results were produced.**

## Fixed defect in existing source recognition

The existing `scripts/aichi-public-mulligan-posterior.cjs` interpreted `namedRevealed` and `namedNotRevealed` by counting only cards where `category!=='Pokémon'`. This excluded non-Basic Evolution Pokémon even though a failed seven is Basic-free, **not Pokémon-free**. A publicly shown `Shadow Rider Calyrex VMAX` or `Regidrago VSTAR` therefore incorrectly had zero likelihood under every recovered source list. The only valid exclusion is **Basic Pokémon**. The fixed code reuses the independently printed-stage-classified `EVOLUTIONS` printing set from `scripts/aichi-field-mulligan-census.cjs` and counts matching Evolution Pokémon alongside Trainer and Energy cards.

A named Basic (`Iron Thorns ex` is one) correctly continues to have zero probability in an invalid Basic-free hand. Tests cover one exclusive recovered-source Evolution, Regidrago VSTAR across multiple exact source lists, and the Basic impossibility. The original Trainer and Energy classifier regressions remain in the same suite. The source manifest remains 29/32: ranks 23, 25 and 28 still lack a verified civil-name-to-final-rank original 60.

## A second, independent information boundary

Each fully revealed, Basic-free failed seven is returned to the 60-card source deck before the next independent shuffle (Advanced Player's Rulebook, Section I.G). With **one fixed known 60**, seeing or failing to see a card in one invalid seven does not change its presence probability in the *next Basic-valid seven*. Given N=60, b Basic cards, t copies of a designated **non-Basic** family, and h=7, that next-valid-hand marginal is

`P(marker present | next hand Basic-valid) = 1 - [C(N-t,h)-C(N-b-t,h)]/[C(N,h)-C(N-b,h)]`.

Two exact controls:

| Known inventory | Next Basic-valid seven contains one of 4 non-Basic markers | One or more publicly invalid hands disclosed a marker |
| --- | ---: | ---: |
| 4 Basics, 4 markers | **36.396950356706%** | **38.876445018579%** |
| 14 Basics, 4 markers | **38.397952352371%** | **7.389821576340%** |

The two right-hand columns are different random events. Public disclosure affects strategic beliefs when the **deck identity is uncertain**. For example, with equal prior belief in these two hypothetical inventories, observing at least one marker across failed seven(s) changes the posterior probability of the four-Basic inventory to **84.027625049063%**; observing no mulligan changes it to **31.683463533902%**. Within each fixed hypothesis, the next valid-hand likelihood remains the corresponding 36.39695% or 38.39795%; the *mixture-weighted* prediction can shift.

`scripts/agent26-public-mulligan-inference-boundary.cjs` implements these exact binomial/geometric likelihoods, a bounded Bayesian prior update and the conditional next-valid-hand calculation. It uses **only potential deck-list hypotheses and opponent-public invalid-hand disclosures**; no real ongoing opponent deck order, Prize identities, or current hidden hand is an input. This is an analytical comparison, not a gameplay-policy installation.

## Verification and scope

- `scripts/aichi-public-mulligan-posterior.cjs`: corrected printed Evolution classification.
- `scripts/agent26-public-mulligan-inference-boundary.cjs`: independent fixed-deck / uncertain-deck conditional model.
- `tests/agent26-public-mulligan-evolution.test.cjs`: source-specific Evolution, Basic exclusion, known-deck independence, and Bayesian two-hypothesis controls.
- Existing manually dispatched `.github/workflows/aichi-benchmark-stats.yml` now runs these tests alongside `tests/aichi-public-mulligan-posterior.test.cjs`; [compiled CI **41001426142 passed**](https://github.com/FlareZ123/experiment-01/actions/runs/41001426142).

**Remaining boundary:** this evidence does not quantify a player's ability to identify an archetype during live gameplay, decide a legal root, survive an opponent's pressure, or win a game. The source deck identities used in a research calculation must never be exposed as presumed hidden facts to the two-player policy. Actual full-public-hand history and opponent reply are a separate next integration gate. Zero competitively qualified games, no demonstrated 99.5% fixed 60.
