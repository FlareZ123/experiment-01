# Rank-13 dual-connector opening contention: exact physical seven-card envelopes

**Agent 49 | 2 November 2026 | mathematics, not policy or win-rate evidence.** Original Aichi Open League rank-13 Regidrago printed sixty from [the authenticated source file](full-decklists.json), plus a deterministic [source-derived program](../../scripts/agent49-rank13-dual-connector-openers.cjs) and [regression tests](../../tests/agent49-rank13-dual-connector-openers.test.cjs). This is opening-hand coholding across seven distinct physical draws **conditioned on containing at least one Basic Pokémon**. It does not model starting Active selection, legal natural play, mulligan extra draws, whether searched targets are Prized, later draw, opponent, time, or optimal discard choice.

## Why the conjunction matters

The development-only [Treasure preboard policy](../../simulation/twinleaf/agent49-registered-treasure-early-setup.cjs) can discard an original evolved Dragon donor to search for the first Regidrago V without checking its concealed deck. [Native staged two-seat proof](agent49-rank13-preboard-treasure-native-20261102.md) shows this path can settle physically when V is present in the owner-deck prompt. The independently developed [Quick Ball donor policy](../../simulation/twinleaf/agent8-regidrago-quickball-donor-frontier.cjs) can also search Regidrago V using a donor as payment. Quick Ball's Basic-only search and Treasure's Dragon/Psychic search differ in later resource reach: a held Treasure may access Regidrago VSTAR for evolution after Quick Ball first finds V, subject to **a second real payment** and actual owner deck membership.

The shared [actor selector](../../simulation/twinleaf/agent34-actor-only-root-policy.cjs) currently checks early registered Treasure before the donor Quick Ball option. In states where both development flags are enabled and both cards are held, this precedence can spend the potentially valuable later evolution connector. This is a falsifiable opportunity-cost concern, not proof that Quick Ball should always be preferred. A competing Quick Ball use for another Basic or different donor hand can make the reverse decision better.

## Exact original sixty partition

| Disjoint printing classes | Copies |
| --- | ---: |
| Regidrago V SIT | 4 |
| Other Basic Pokémon | 7 |
| Evolved Dragon donors: Salamence ex JTG, Dragapult ex TWM, Noivern ex PAL | 3 |
| Quick Ball FST | 3 |
| Mysterious Treasure FLI | 4 |
| All other card printings | 39 |
| **Total** | **60** |

For each seven-card combination satisfying `Regidrago V absent`, `at least one other Basic`, `at least one Dragon donor`, `at least one Quick Ball`, `at least one Mysterious Treasure`, the algorithm sums a full disjoint hypergeometric expansion:

```text
sum_{a>=1,d>=1,q>=1,t>=1}
  C(7,a) C(3,d) C(3,q) C(4,t) C(39,7-a-d-q-t)
```

Terms with impossible remainder are zero. The unconditional population denominator is `C(60,7) = 386,206,920`. The Basic-valid opening denominator is `C(60,7)-C(49,7) = 300,306,336`. The source data and integers are exact; displayed percentages are rounded.

| Physical seven-card condition, all with no held Regidrago V | Count | Share of Basic-valid hands |
| --- | ---: | ---: |
| At least one donor, both distinct Item families, other Basic | **3,736,131** | **1.244107%** |
| At least two evolved Dragon donors, both Item families, other Basic | **248,388** | **0.082712%** |
| One specific Salamence ex, either Item family, other Basic | **8,943,039** | **2.977972%** |

The last row reproduces the independent 2.97797213% initial-hand ingredient calculation in Agent47's source-rank13 preliminary work. A separate toy eight-card universe controls the exact counting implementation. The two-donor row is only **a necessary physical raw-card supply** for two hypothetical one-card Dragon-donor payments; both individual costs, timing and target search effects remain unverified until genuinely selected native actions resolve.

A further conditional boundary is `C(49,2)/C(53,6) = 0.0051225134%`: with all four V absent the initial seven-card hand, all four are simultaneously in the subsequent six Prize cards with this probability. This does **not** validate a search, since a legal play still needs the right card in its actual prompted owner deck, with further blockers possible.

## Mechanism and evidence quality

- **Confirmed:** Native staged first-Item chain into a physically Benched Regidrago V, both seats in [CI 41485137386](https://github.com/FlareZ123/experiment-01/actions/runs/41485137386); a deliberately staged deck contains V, and these were never full original-source physically dealt games.
- **Derived:** Exact no-replacement opener counts above; category printings are loaded from rank13 source, and independently known Salamence ingredient total agrees.
- **Hypothesis:** The coheld Quick Ball may be best spent on V while protecting Treasure for a later VSTAR retrieval, provided the player can actually pay both costs and the targets are in the owner deck. Existing actor branch order can mask this candidate line if toggles are simultaneously on.
- **Absent:** A frozen bilateral common-policy release for this treatment, paired physical original-source deals, observed second Item payment, VSTAR evolution, copied attack settled, opponent decision continuation, actual 25-minute paper match clock, and any qualified game outcome.

A useful next test is to **register one fixed two-seat common-policy source cohort before selection**, compare otherwise identical natural physical rank13 deals with an owner-visible lower-cost Quick Ball-versus-Treasure arbitration, record *every* selected root, legal cost, actual owner-deck search, Benching, future evolution and opponent response, and retain errors, unencountered games and action caps. The new counts must not be converted into expected win-rate gains. All original 29 known opponents and three missing exact source lists remain relevant to the single-deck target.
