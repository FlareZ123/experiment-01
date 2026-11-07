# Paper Expanded dual-mulligan cost of the three original Aichi four-Basic Iron Thorns lists

**Agent12 | 7 November 2026 | mathematical opening-setup result grounded in uploaded manual, local complete card database, and authenticated original Aichi 60s.** This is a fully specified setup calculation, **not a simulated completed match**, opponent-policy analysis, demonstrated win rate, or final card-swap recommendation.

## Exact source hands

The repository's [authenticated 29 original Aichi 60-card name/count inventories](../aichi-2026/full-decklists.json) identify **ranks 6, 24 and 29** as Iron Thorns ex decks with **exactly four Pokémon**: `4× Iron Thorns ex TWM 77`. The supplied card database identifies that printing as a **Basic**. Every other card is Trainer or Energy, so there are exactly four legal opening Basic Pokémon. The fixed [rank1 Shadow Rider Calyrex reference](../aichi-2026/benchmark-shadow-rider.md) has **14 Basic Pokémon** and four Stage1 Shadow Rider Calyrex VMAX. The local card archive confirms these printed stages: 3 Shadow Rider Calyrex V CRE74; 2 Lillie's Clefairy ex JTG56; 2 Tapu Lele-GX GRI60; one each Trevenant & Dusknoir-GX SMP SM217, Latias ex SSP76, Dialga-GX UPR100, Mimikyu GRI58, Girafarig LOT94, Marshadow UNB81, and Radiant Eternatus CRZ105. There are 14 Basic copies in this rank1 reference; Shadow Rider Calyrex VMAX CRE75 is not Basic.

This four-versus-fourteen comparison is a source-identity example of **setup-card exposure**. No assumption is made that either starting player can choose whether to give the other extra draws; the actual rules make bonus draws optional after opponent mulligans.

## Use the actual paired setup rule

The uploaded *Advanced Player's Rulebook* section I.G, steps 4–7, starts with seven cards drawn from each shuffled 60. A player must have a Basic in the opening seven to set an Active. If both opening hands have no Basic, **both reveal, shuffle, and restart together**. A one-sided failed seven-card hand prompts the failed player to reveal, shuffle, and retry while the successful player may finish placing their opening Active, Bench and six Prize cards. The successful player is then entitled to choose an extra-card draw count **up to the failed player's total one-sided mulligans** before the game starts. Shared both-player resets do not count as gifted draws.

For a shuffled 60 with `b` Basic Pokémon, the exact probability a seven-card opening has no Basic is:

`q(b) = C(60-b,7) / C(60,7)`.

- With four Basics, `q(4)=0.6005003742553344`, so a random opening seven **fails 60.0500%** of the time.
- With fourteen Basics, `q(14)=0.1385906808712801`, so it **fails 13.8591%**.
- A single four-Basic player, ignoring the paired protocol, would make `q/(1-q)=1.5031312561` failed seven-card hands on average before first success. **This standalone expectation cannot be counted as an opponent bonus-draw rate**, because shared simultaneous failures are reset together.

## Derive actual one-sided bonus-draw eligibility

Write `q_I=q(4)`, `q_O=q(14)`, `p_I=1-q_I`, `p_O=1-q_O`. Each independent simultaneous round repeats exactly when both players fail, with probability `q_I q_O`. Thus the first round with at least one successful opening has conditional probabilities:

- `P(I fails, O succeeds) = q_I p_O/(1-q_I q_O)`;
- `P(I succeeds, O fails) = p_I q_O/(1-q_I q_O)`;
- `P(both succeed) = p_I p_O/(1-q_I q_O)`.

If the first decisive event is `I fails, O succeeds`, Iron Thorns must continue redraws until a valid Basic. Conditional on that first failure, the expected total one-sided failed seven-card draws is `1/p_I`. Hence the **expected optional extra-card draw allowance available to the opponent** is

`E[O bonus eligibility] = q_I p_O / [(1-q_I q_O) p_I]`.

Likewise, the Iron Thorns player's own expected optional draw allowance due the opponent's mulligans is

`E[I bonus eligibility] = p_I q_O / [(1-q_I q_O) p_O]`.

The chance the opponent has *at least k* bonus draws available is `q_I p_O q_I^(k-1)/(1-q_I q_O)` for integer `k>=1`.

## Exact quantitative comparison

| Setup quantity | Four-Basic Iron Thorns vs fourteen-Basic Shadow Rider |
| --- | ---: |
| Four-Basic no-Basic opening probability | **60.0500%** |
| Fourteen-Basic no-Basic opening probability | **13.8591%** |
| Probability opponent becomes eligible for at least one free card | **56.4234%** |
| Opponent's expected optional bonus-draw eligibility | **1.41235 cards** |
| Probability Iron Thorns becomes eligible for at least one free card | **6.0393%** |
| Iron Thorns' expected optional bonus-draw eligibility | **0.07011 cards** |
| Expected paired simultaneous both-fail restarts | **0.09078 rounds** |
| Probability opponent becomes eligible for five or more bonus draws | **7.3369%** |

For a **symmetric four-Basic-versus-four-Basic matchup**, each player's expected optional bonus eligibility is **0.93916 cards**, since simultaneous mulligans suppress one-sided gift counting. The exact rank1 matchup asymmetry is **1.34224 expected *offered* extra cards**, favoring the fourteen-Basic opponent as a setup *resource entitlement*.

These expectations are **not actual cards drawn**. The opponent may draw any permitted amount up to the allowance, may rationally choose fewer, and individual game states can affect the marginal utility. The calculation excludes strategy, redrawing beyond limits for deck scarcity in extreme negligible tails, changing decks, concession, and all play after setup. The model treats ideal physical shuffling as independent draws; opponents’ reveal of failed hands is separately public information and could affect later decisions.

## Reproducible implementation and independent check

- [Pure 60-card combinatorial probability and exact paired-protocol calculations](../../scripts/agent12-expanded-mulligan-pairing.cjs).
- [Seven adversarial tests](../../tests/agent12-expanded-mulligan-pairing.test.cjs) check the specific four-vs-fourteen values, symmetric four-Basic baseline, extreme Basic counts, normalization of all possible one-sided mulligan counts, seat interchange invariance, five-extra-card tail, and a deterministic **300,000 paired game-setup Monte Carlo** that independently reproduces the mathematical expectations within registered numerical tolerance.
- [Exact original Pokémon printing-stage census](../../scripts/agent12-aichi-basic-opening-census.cjs) now resolves every Pokémon row in the 29 authenticated source inventories by set and printed number, including the roster/card-database Prism Star diamond glyph difference. Its [tests](../../tests/agent12-aichi-basic-opening-census.test.cjs) pin Ditto LOT 154 and Tapu Koko TEU 51 to their Basic printings.
- The [cheap manual Node22 evidence workflow](../../.github/workflows/agent12-statistical-field-confidence.yml) includes the pairing, source census, and 128-stratum confidence suites without building Twinleaf. CI run [42381804142](https://github.com/FlareZ123/experiment-01/actions/runs/42381804142) passed **46/46 tests**.

## Implications for one fixed 60 against the field

The three authentic Iron Thorns-only references commit to exactly four possible legal opening Basic Pokémon, as their deck strategy requires starting and maintaining the Future Pokémon lock. The above math identifies a **real setup opportunity-cost channel**: facing the rank1 reference, opponents receive a greater expected allowance to draw before Iron Thorns can establish its lock. Existing optimization based solely on first attacking turn, card availability after setup or theoretical Ability-lock power could miss this gift.

This does **not** imply that adding arbitrary Basic Pokémon improves the Iron Thorns fixed 60. Such additions could make a non-Iron-Thorns starting Active, alter lock uptime, consume switching resources, reduce other engine space, and increase the chance of starting incompatible support Pokémon. Starting-pool changes must be compared by real lines, not only the mulligan rate. Nor does this quantify actual matchup win rates: setup bonus-card entitlement is one contribution among many interactive and matchup-specific effects.

The result suggests a concrete future experiment: preserve the source/contender pair and both physical seats; record simultaneous versus one-sided seven-card mulligans separately from optional draw choices, exact pregame hand/Bench/Prize custody, and subsequent Item-lock/Ability-lock activation. Test with truly independent source deals, strong opposing policies and paper-legal full games. **The 99.5% objective remains unproven.**
