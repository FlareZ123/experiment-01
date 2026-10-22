# Agent 6: exact forced high-Prize Active opening exposure in frozen Aichi candidates

**22 October 2026 | Evidence: exact combinatorial derivation from fixed published/proposed inventories.** This is a narrow setup-position risk, **not** a knock-out, lost Prize, full-game outcome or win-rate estimate.

## Competitive question

The [frozen New Moon Lockbreaker v1 60](../als/new-moon-lockbreak-60-candidate.md) has two Mewtwo & Mew-GX, one Gengar & Mimikyu-GX and one Trevenant & Dusknoir-GX. Each is a TAG TEAM Basic worth three Prize cards if Knocked Out. Agent 5's [historical rank-6 source-first original-Store experiment](agent5-rank6-native-powerglass-confirmed-20261021.md) shows the concrete danger of opponent Prize conversion after a Mewtwo & Mew-GX knock-out: despite much faster later Articuno attacks, the candidate still lost that one selected engine game. That gameplay result motivates studying starter exposure, but it does **not** demonstrate that the initial TAG TEAM was forced, or establish any general loss probability.

This study asks: **How often is every Basic in the original valid opening seven a TAG TEAM, forcing an exposed three-Prize Active Pokémon before the player can make turn actions?**

## Frozen inventories and exact derivation

Card-name/copy inputs are read directly from:
- [29-source manifest](full-decklists.json), published rank-1 Yasunori Kato Shadow Rider 60;
- [New Moon fixed English-equivalent 60](../als/new-moon-lockbreak-english-proxy-60.json), unchanged 60 and unchanged card printings.

Explicit category census:

| Fixed 60 | Starting-eligible Basics B | TAG TEAM Basics T | Other Basics N=B−T | Multi-Prize Basics M | Other single-Prize Basics B−M |
| --- | ---: | ---: | ---: | ---: | ---: |
| Published rank-1 Shadow Rider | 14 | 1 | 13 | 10 | 4 |
| Frozen New Moon Lockbreaker v1 | 17 | 4 | 13 | 9 | 8 |

The Pokémon identified as Evolutions in these two frozen lists are **Shadow Rider Calyrex VMAX** (four) and **Dusclops** (two), respectively. The champion's one TAG TEAM is Trevenant & Dusknoir-GX. New Moon's four are the two Mewtwo & Mew-GX plus one each Gengar & Mimikyu-GX and Trevenant & Dusknoir-GX. The broader multi-Prize group also includes the indicated Basic ex/GX/V in the two source inventories. This is a fixed-pool classification, not an attempt to infer prize values of arbitrary Pokémon from names.

The setup rule first draws seven cards, requires a Basic and chooses the opening Active from those cards. Six Prize cards are set afterward. Let a 60-card deck contain T designated high-Prize Basic copies and N other Basic copies. The original seven produces a valid opener whenever it includes at least one of T+N. The forced high-Prize event requires at least one T and zero N:

```text
P(forced T | valid opener)
  = [ C(60-N,7) - C(60-N-T,7) ]
    / [ C(60,7) - C(60-N-T,7) ].
```

Every card is equally likely in the original seven before any Prize placement. Conditioning on a valid opening seven is appropriate because invalid hands are shown, shuffled back and redrawn. The numerator excludes the invalid hands with neither group. No independence between the seven cards is assumed.

## Computed results

| Exact conditional event given valid initial seven | Shadow Rider rank 1 | New Moon Lockbreaker |
| --- | ---: | ---: |
| **Forced TAG TEAM Active (three-Prize Pokémon)** | **2.81554525%** = 283843/10081280 | **8.66352390%** = 30667385/353982806 |
| Forced any Basic that yields at least two Prizes on knock-out | **53.62255587%** = 6143/11456 | **28.69078505%** = 50780223/176991403 |
| Forced Mewtwo & Mew-GX specifically | Not in the champion list | **3.71642514%** = 6577753/176991403 |

For context, unconditional original-seven probabilities *before redrawing invalid hands* are 2.42533692% and 7.94066171% for champion and New Moon forced TAG TEAM respectively. The probability the initial seven is valid is 86.14093191% for champion and 91.65625670% for New Moon. These unconditional probabilities are a different denominator and should never be substituted into the repeated-mulligan game's legal-opening analysis.

**Interpretation:** New Moon's forced three-Prize opener exposure is **3.0770 times** the published champion's, a difference of **5.848 percentage points**. The broader exposure pattern reverses: the champion has **24.932 percentage points more** forced two-or-more-Prize opener exposure than New Moon. Thus the evidence supports a specific *three-Prize concentrated* weakness in New Moon while rejecting the simplistic claim that it is forced to open a multi-Prize Pokémon more often overall.

## One-slot structural sensitivity, deliberately unadopted

To make the metric a deck-building decision rather than an isolated alarm, test one legal-card-count *hypothesis only*: replace **one of New Moon's four Battle VIP Pass** with a **fourth Unown AOR 30**, leaving all four TAG TEAM copies, the two Mewtwo & Mew-GX copies and the remaining 59 slots unchanged. This 60 is **not** a submitted or nominated deck. The fourth Unown is a single-Prize Basic; Battle VIP Pass is a non-Basic Item usable only during the first turn.

| Restricted conditional direct-opening metric | Frozen New Moon 4 VIP / 3 Unown | Hypothetical 3 VIP / 4 Unown | Change |
| --- | ---: | ---: | ---: |
| At least one Basic in original seven, unconditional | 91.6563% | 93.0145% | +1.3583 pp |
| Forced TAG TEAM Active given valid seven | 8.6635% | 7.3898% | **−1.2737 pp** |
| Direct sight of ≥1 Battle VIP Pass by opening seven plus first mandatory draw, given valid opening seven | 43.4453% | 34.6070% | **−8.8382 pp** |

The conditional first-eight VIP event is an exact *without-replacement* intersection, not an approximate independent draw. For a 60-card population with B Basics and V non-Basic target cards, define `D = C(60,7) − C(60−B,7)` and `Z = C(60−V,7) − C(60−V−B,7)`. Since every V remains among the 53 cards after a valid seven without VIP, `P(VIP visible by eighth | legal seven) = 1 − (Z/D)×((53−V)/53)`. It integrates Prize uncertainty by exchangeability before setup and omits search cards and optional opponent-mulligan draws.

In the case study the candidate's forced TAG event becomes **553049/7483929**. VIP direct visibility changes from **479458943/1103593454** to **19265703/55669928**. These exact fractions are asserted in the added deterministic test, with an independent exhaustive miniature deal including the next draw. The first-eight VIP rate may be strategically more valuable than a small change in three-Prize initial exposure. This is a concrete illustration of setup-resource opportunity cost, **not** support for making the substitution.

**Extended focused test:** [manual workflow 39711719273](https://github.com/FlareZ123/experiment-01/actions/runs/39711719273), frozen revision `1be548281b72bcc9b48ed7044b9c33cd9a519651`, passed **7/7** targeted Node regressions including exhaustive small-deck drawing and exact one-slot fractions. The workflow remained RED at its separate previously failing Trainer classification census, which occurs after the focused tests.

## Forced-TAG first-turn escape resource via printed Battle VIP Pass + Latias ex

The original forced-TAG statistic measures *initial setup exposure*. It does not imply a TAG TEAM must remain Active at the end of turn one. In the frozen 60, [Latias ex SSP 76](../../resources/cards/en/sv8.json) is a single non-TAG Basic with the printed Ability **Skyliner** (the player's Basic Pokémon have no Retreat Cost). [Battle VIP Pass FST 225](../../resources/cards/en/swsh8.json) is an Item playable only on the player's first turn and can place up to two searched Basic Pokémon onto the Bench. Under a legal, unblocked first turn, a single VIP Pass can place both Latias ex and a single-Prize Basic onto the Bench; Skyliner then permits the initial TAG TEAM Basic to retreat without paying Energy into the chosen single-Prize Basic. The one-retreat-per-turn rule still applies.

This specific conditional line has genuine necessary conditions: Latias must avoid the six Prize cards; the VIP must be directly seen in the first seven or next mandatory draw; the Item must remain playable; Skyliner must be active; normal retreat must be permitted; and the player must actually choose to follow the line. **It does not require the TAG TEAM to be Knocked Out, a search via a second connector, or using a Supporter.** The actual card database supplies **eight** single-Prize Basics in the frozen 60 (three Unown, two Duskull, Solrock, Lunatone and Klefki). Under the forced-TAG original seven, none of those eight are in hand. Six face-down Prizes cannot conceal all eight. Even after a first mandatory draw, at least one single-Prize Basic therefore remains findable in the deck, or one has already entered the hand. The original seven contains at most four TAG TEAM Basics, leaving at least two ordinary Bench positions if they were all Benched, and the player may choose fewer at setup.

### Exact joint visibility and Prize access

Let F be the number of initial seven-card subsets containing at least one of T=4 TAG TEAM Basics and no other B=13 Basics. Let F0 be the subset that also contains no V=4 VIP Pass. There are R=53 cards left after seven have been drawn. The first six of R are Prizes; the seventh is the next ordinary draw. Latias is one of these R because forced TAG forbids it in the original seven.

```text
F  = C(60-B,7) - C(60-B-T,7)
F0 = C(60-B-V,7) - C(60-B-T-V,7)

P(VIP seen by eighth AND Latias unprized | forced TAG)
  = (1-F0/F) × (R-6)/R
    + (F0/F) × (V/R) × (R-1-6)/(R-1).
```

The first term counts VIP already in the original seven, with Latias among the 47 non-Prize positions. The second counts opening-seven hands without VIP, where the mandatory draw must be one of the four VIP cards and Latias must avoid the six Prizes among the other 52 cards. This accounting preserves the negative dependence of the top-draw VIP and Latias's Prize location.

| Exact direct resource conjunction | Probability |
| --- | ---: |
| VIP in original seven or first draw, **Latias not Prized**, **given forced TAG original seven** | **43.64151528%** = 141867342/325074281 |
| Same conjunction, **given a valid initial seven** | **3.78089311%** = 354668355/9380544359 |

The [nine passing Node regressions in manually run CI 39712678518](https://github.com/FlareZ123/experiment-01/actions/runs/39712678518) include independently exhaustive miniature deals counting opening-three hands, real Prize subsets and a next draw, then compare exactly to the symbolic fractions above. This is a validated combinatorial *resource* window; no native full-game policy or match result was executed by this study. The workflow's unrelated pre-existing Supporter-subtype failure continues after the focused 9/9 pass.

**Important matchup counterexample:** [Agent16's staged native Iron Thorns vs Latias paper-retreat experiment](agent16-rank6-latias-mobility-pressure-window.md) confirms that Active Iron Thorns ex can suppress Skyliner and render a zero-Energy Latias retreat unavailable. Against rank6/24/29 Thorns, merely holding VIP and finding Latias cannot guarantee this escape line. Active Klefki or a functioning Garbotoxin-style Ability lock creates related eligibility concerns. Opposing attack/status effects and future gust lines also need examination.

Previously executed [New Moon first-turn VIP native Store tests](agent7-newmoon-vip-registered16-compiled-20261020.md) demonstrate actual owner-deck Basic searches and public Bench placements, while also documenting that normal bots may pass after the first-turn setup. Our exact joint metric connects these separate rule/engine witnesses, and it should **not** be interpreted as a 43.6% actual first-turn rescue rate in games.

## Strategic and empirical boundaries

- A forced TAG TEAM Active is a structural **Prize-liability opportunity**. It is not an automatic loss. The opponent must execute a knock-out, and the candidate may legally move the Pokémon to the Bench or defend it. A three-Prize Knock Out may be recoverable.
- The opening event says nothing about a player's *chosen* Active when both TAG and non-TAG Basics are present. Player behavior, board and matchup policy determine voluntary exposures.
- No attack, Energy, lock, search, mobility, opposing starting-order distribution, tournament clock or opponent decision policy is simulated. The event is **not** a 99.5%-goal proof or refutation.
- Optional bonus cards from the opponent's mulligans are drawn after selecting the starting Active; they cannot retroactively avoid an Active forced by the original seven. They can, however, improve subsequent rescue options.
- Specific Japanese printing identities still require their separate paper-legality evidence and should not be conflated with the English mechanical proxy.
- The primary current outcome gates remain **29/32 exact opposing 60s, zero competitively qualified games**, and no validated final single 60.

## Actual native CI verification (22 October)

**Targeted exact model passed 5/5 Node tests with genuine repository manifest loading** in the manually dispatched [run 39711082183](https://github.com/FlareZ123/experiment-01/actions/runs/39711082183), checked out at commit `59f2f792d0a4aec391fdbb97a7ed100629ccfd56`. The test suite independently exhausts the small-deck physical deals and verifies each large-deck exact reduced rational. The immediately following real Node invocation printed matching JSON including the separate TAG TEAM, specifically Mewtwo, and broader multi-Prize censuses.

**The workflow as a whole is RED for an unrelated preexisting category-audit failure:** `tests/aichi-supporter-density.test.cjs` reports unclassified Trainer names including `Battle Compressor`, `Palace Belt`, `Palace Book`, `Player's Ceremony`, `Robo Substitute`, `Target Whistle`, `Thunder Mountain ♢`, and `Wondrous Labyrinth ♢`. That failure occurs after the new focused step passes and is not attributed to the mathematical study. Do not claim the whole workflow is green. An independently verified targeted test success is distinct from a broader workflow pass.

## Reproduction and falsification

- [Exact BigInt calculator](../../scripts/aichi_forced_tag_openers.cjs) exports `choose`, `exactForcedOpening`, `countFrozenInventory` and `frozenOpeningAudit`. The command's JSON output includes reduced exact fractions and rounded percentages.
- [Node unit tests](../../tests/aichi_forced_tag_openers.test.cjs) independently enumerate all small-deck opening subsets, compare reduced fractions, assert the two immutable inventory category counts and expected exact large-deck numerators/denominators, and reject invalid input.
- The existing manually dispatched [Prize-rescue audit workflow](../../.github/workflows/aichi-champion-prize-collapse.yml) now invokes the focused Node test and calculator after Node setup; it was **not** changed to add any automatic push or pull-request trigger. See the workflow run and verification status in a later amendment; no CI pass is assumed before inspection.

**Useful next research decision:** Test whether a fixed-60 alternative can reduce *three-Prize forced exposure* without sacrificing immediate attacks, Perfection sources, and strong answers to the actual top-field locks. Evaluate against the same qualified adversarial common policy and both starts. The source's 2 Mewtwo are genuine engine redundancy; changing them or the Basic mix requires more than this marginal opener metric.
