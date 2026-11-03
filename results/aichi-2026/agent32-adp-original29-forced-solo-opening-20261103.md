# Agent 32: forced solo Pokémon at setup for fixed ADP v2 against original 29

**3 November 2026 | exact seven-card and bonus-draw combinatorics | no native games and no qualified wins.**

## A different opening constraint

The unchanged [Agent5 ADP/Thorton/Regidrago v2 fixed sixty](candidates/agent5-adp-thorton-regidrago-60-v2.json) contains **seven Basic Pokémon**: ADP ×2, Regidrago V ×3, Tapu Lele-GX ×1 and Crobat V ×1. The authentic [rank-one Shadow Rider benchmark](benchmark-shadow-rider.md) contains **fourteen** Basic Pokémon. Before either player takes a turn, a legal starting seven with **exactly one Basic** initially forces that Pokémon to start Active, with no other initial Basic from that seven to put on the Bench. The opponent's setup mulligans can grant optional bonus cards after six Prizes are set; an additional Basic from those cards could rescue the empty Bench before play starts.

We count the **forced solo Basic at the moment the opening Active/Bench are revealed after all accepted mulligan bonuses**, conditioned on the candidate having a Basic-valid original seven. We assume the candidate draws the maximum optional bonus cards offered by each original opponent, to make this a conservative screen of exposure. A player may choose to leave the Bench empty even when an additional Basic is available; our calculation concerns *no additional Basic available*, which cannot be corrected through normal opening Bench placement.

This quantity matters for early-game donk exposure, initial Bench-dependent tools and planned early attackers. It is **not a donk probability**: on its turn the player can search or Bench new Pokémon, and the opponent must actually perform a legal, sufficiently damaging attack. The actual first-player order and opponent line will determine whether a solo starter is tactically dangerous.

## Exact base event

For A physical Basic Pokémon in a legal 60-card deck, the fraction of all Basic-valid original seven-card hands containing **exactly one** Basic is:

**A × C(60−A,6) / [C(60,7) − C(60−A,7)].**

- Fixed ADP v2, A=7: **69.249203150306%**.
- Original champion rank one, A=14: **39.417633475114%**.

Those are initial-seven setup geometry probabilities. They are not rates of opponent attacks or losses.

If that original seven contains exactly one Basic and m extra cards are drawn because the opponent mulliganed, the probability **none of the m extras is another Basic** is C(54−A,m)/C(53,m). The result correctly marginalizes the original six face-down Prizes while keeping the first seven distinct. Weight by the authentic bilateral simultaneous-mulligan distribution from [the previous 29-original source census](agent32-adp-original29-mulligan-bonus-offers-20261103.md): with qA=C(60−A,7)/C(60,7) and qB=C(60−B,7)/C(60,7),

- m=0 weight: **1 − (1−qA)qB/(1−qAqB)**.
- m≥1 weight: **(1−qA)(1−qB)qB^m/(1−qAqB)**.

Enumerate m=0 through **32** and bound the omitted tail by the exact P(m≥33). The model uses actual original-source Basic counts from uniquely matched printed Pokémon identities across the 29 authenticated Aichi sixties. It does not fabricate missing ranks 23,25,28.

## Field comparison

| Original opponent source | Original Basics | ADP seven-Basic forced solo | Champion fourteen-Basic forced solo |
| --- | ---: | ---: | ---: |
| Rank 6 Iron Thorns (also ranks 24/29) | 4 | **61.137303744% to 61.137306431%** | **29.323558%** |
| Rank 26 Meloetta | 12 | **68.074919076%** | **37.506796023%** |
| Rank 1 Shadow Rider | 14 | **68.459199753%** | **38.100450868%** |
| **Equal-rank mean, 29 authenticated originals** | Mixed | **67.521844776%** | **36.921377626%** |

The equal-field difference is about **30.60046715 percentage points**. Against original Iron Thorns, mutual setup mulligans offer the candidate more extra draws, reducing forced solo from its no-bonus baseline of 69.25% to approximately 61.14%. Against rank26 Meloetta, with twelve Basics, the source offers fewer bonuses; the candidate's **solo opening remains approximately 68.07%**.

### Specific original-rank26 exposure

Among all Basic-valid original seven-card hands that still produce a forced solo ADP v2 board after accepted bonuses against rank26, the unique starting Basic is exchangeable among the fixed seven printings. A sole **Tapu Lele-GX or Crobat V** starter accounts for two of the seven possible Basic identity copies. Thus the joint conditional chance of opening with **only** Tapu Lele-GX or Crobat V available before either player acts is **19.449976879%**. The remaining lone-Basic cases can be ADP (two of seven copies) or Regidrago V (three of seven). This percentage is a physical opponent-target exposure. It does not show rank26 can Knock Out either Pokémon, that no own-turn Bench card can be found, or that a game ends early.

## Narrow first-personal-turn natural Bench connector counter-screen

A forced **solo board at setup** can be repaired on the player's first turn if the pilot draws a different Basic or can legally play a search Item. The actual fixed ADP v2 contains **four Tag Call**, **three Quick Ball** and **four Ultra Ball**. This is **eleven physical Basic-tutor Item copies**. A separate exact, pessimistic *absence* event requires:

- The Basic-valid initial seven contained **exactly one Basic** and **none** of the eleven Item printings.
- Every opponent-mulligan bonus card accepted, plus the player's one ordinary first-turn draw, contains **no other Basic and none of these eleven Items**.

For seven Basics and eleven relevant Items, the exact original-seven probability of one Basic with zero such Items is **7 × C(42,6) / [C(60,7) − C(53,7)]**, or approximately **15.8234484%**. With m opponent bonus cards, the conditional probability of no additional Basic or those Items in the next m+1 cards is **C(36,m+1)/C(53,m+1)**. Weight it by the same source-specific exact simultaneous-mulligan probabilities used above and bound the m≥33 remainder. The machine implementation is the exported `noDirectBasicTutor` within the [forced-solo source model](../../simulation/evaluation/agent32-adp-forced-solo-opening-originals.cjs).

| Original opponent | Chance of this narrow no-direct-Basic/tutor event |
| --- | ---: |
| Rank 6 Iron Thorns, four Basics | **7.9243117%** |
| Rank 26 Meloetta, twelve Basics | **10.2468514%** |
| Rank 1 Shadow Rider, fourteen Basics | **10.4057331%** |
| Equal rank average, all 29 originals | **10.0758441%** |

This event's meaning is strictly that **none of the specified immediate cards is visible**. Having one of the eleven Items does not prove a Bench rescue: Quick Ball and Ultra Ball require discards, Tag Call must have a searchable TAG TEAM Basic, and opponents may impose Item restrictions. Conversely, other legal effects may produce a Basic despite absence of these particular Items. The result explains why the **68% forced-solo setup figure should never be portrayed as a 68% unrescuable first-turn position or a donk rate.**

This refinement was verified by two additional deterministic source-bound tests. The original import-error test failure and a later floating-point boundary assertion failure were corrected; final [GitHub Actions 41557972309](https://github.com/FlareZ123/experiment-01/actions/runs/41557972309) **SUCCESS** with all eight forced-solo plus direct-Item tests passing. The mathematical interval is exact before JS floating-point rounding, and the assertions explicitly permit that rounding.

## Evidence and reproduction

- [Exact all-original forced-solo evaluator](../../simulation/evaluation/agent32-adp-forced-solo-opening-originals.cjs) computes physical Basic distributions and source-specific bonus-draw corrections with published hypergeometric formulae.
- [Six executable tests](../../tests/agent32-adp-forced-solo-opening-originals.test.cjs) verify seven-card combinatorics, no-Basic chance after bonus draws, rank26/source6 identity and bound, equal-B original rows and same-field champion comparison. The initial workflow attempt caught a **wrong imported binomial helper**, which was corrected in the source and reverified before publication.
- Existing [manual card-audit workflow](../../.github/workflows/aichi-card-audit.yml): GitHub Actions [41557316042](https://github.com/FlareZ123/experiment-01/actions/runs/41557316042) **SUCCESS**, source head **cb72aab386bd6a260c012ef256e0cd9a50f0ad63**. All six focused tests passed, with all-29 machine source output. The earlier workflow [41557198300](https://github.com/FlareZ123/experiment-01/actions/runs/41557198300) correctly failed due to the import bug and does not support the published result.

## Decision implications

This is a large structural opener difference between the currently proposed seven-Basic ADP build and the authentic rank-one fourteen-Basic reference, unchanged after allowing every opponent source to award maximum setup bonuses. It should inform source-rank26 Meloetta and fast attack admission tests, and it motivates testing an extra *functional* Basic slot against its real trade-offs rather than relying on the first-GX access metric alone. Our prior [one-slot sensitivity screen](agent32-adp-one-slot-first-gx-mulligan-sensitivity-20261103.md) found that raising the Basic count to eight reduced source-oriented mulligan bonus offers, even when adding non-ADP Basics lowered the conditional ADP-first-GX route.

A prospective whole-game comparison must record the actual opening Active, available legal Bench Pokémon after all optional extras, what the player can search/Bench on its first turn, the original opponent's legal first attack and any Knock Out. No game-win or 99.5% claim follows from an initial solitary Active. The fixed ADP list remains unchanged, original ranks 23/25/28 unverified and zero competitively qualified paper games exist.
