# Agent 49: native M1L Lillie alias restores root-93 whole-hand accounting

**7 November 2026 | exact-card representation correction and pure regression.**
No native game was rerun by this intervention; no competitive games qualify.

## Concrete omission

The original Aichi 29-deck roster calls the 2025 Mega Evolution Lillie's Determination
`Lillie's Determination MEG`. The existing exact-print bulk-hand model knows
that key and its English source ID `me1-119`, but the independently frozen
New Moon English-mechanics-proxy 60 holds the Japanese Mega Brave printing
under Twinleaf's `Lillie's Determination M1L` name. `M1L` #62 and
English Mega Evolution `MEG` #119 are **different physical printings of the
same named Supporter with equivalent game text**. Consequently the model's previous exact
`Object.hasOwn(BULK_HAND_PRINTS,row.printing)` lookup classified those
candidate-held copies as **unmodeled**. This is particularly relevant because
the shared v9 original rank-11 vs New Moon native game observed **13 candidate
Pass roots** repeatedly holding two M1L copies.

Exact provenance:
- `resources/cards/en/me1.json` (card `me1-119`) has the Supporter text
  "Shuffle your hand into your deck. Then, draw 6 cards. If you have exactly 6
  Prize cards remaining, draw 8 cards instead." The input card-list ZIP has
  the same ID and effect; its Expanded legality field is Legal.
- `results/als/new-moon-lockbreak-english-proxy-60.json` lists two
  English-mechanics proxy `me1-119` entries; the actual actor-native
  archived hands name them `Lillie's Determination M1L` (e.g. root 93).
  The roster's English proxy identifier is **not the Japanese physical ID**.
- Japanese Mega Brave `M1L` #62 independently prints the same shuffle-
  hand/draw-six-or-eight effect, as recorded at
  [Limitless Japanese #62](https://limitlesstcg.com/cards/jp/M1L/62?translate=en).
  [Official English card text](https://asia.pokemon-card.com/my/card-search/detail/21711/)
  agrees. This is a vetted effect-equivalence assertion; it does not identify
  which Japanese artwork or physical #62/#86/#91 was played in a given match.
- The original-field bulk rule remains keyed by English MEG and supplies
  **English source text reference ID `me1-119`**. The Japanese printing's
  distinct physical ID is retained through the original `M1L` name. This
  one explicit native-fullName alias never infers equivalence between
  unrelated cards or arbitrary set codes.

## Change and observed result

`simulation/twinleaf/agent49-owner-bulk-hand-transitions.cjs` now translates
only `Lillie's Determination M1L` into the preexisting
`Lillie's Determination MEG` source-effect key before rule lookup. The output
retains the original physical `printing` plus
`rulePrinting` and `nativeFullNameAliasUsed`; no card is physically
renamed, no owner State or hidden zone is read, and no game action is selected.
The original-field eight-family census `BULK_HAND_PRINTS` is unchanged.

`tests/agent49-owner-bulk-hand-transitions.test.cjs` adds the actual recorded
first candidate Pass **root 93** hand composition as an isolated fixture,
with both M1L hand indices and the original public six-Prize count. Each of
the two separately considered Lillie alternatives now reports:

| Field | Verified resource-accounting value |
| --- | --- |
| Known effect and original physical printing | Yes; M1L preserved |
| English effect reference | `me1-119` (distinct Japanese `M1L` physical printing) |
| Other physical cards that would be shuffled | **9** |
| Printed draw request with six remaining Prizes | **8** |
| Held Secret Box TWM moved out of hand | **Yes**, into the deck |
| Other held Lillie competing action displaced | **1 copy** |
| Native action/payment/paper target certified | **No** |
| Strategic advantage over other lines certified | **No** |

These are **two mutually exclusive alternatives** at one root. The 18
total hypothetical moved-card exposures are never 18 actual moves. A
shuffled-away Secret Box might be redrawn or later recovered, so current-hand
displacement must not be mistaken for permanent loss.

The same documented source-exposed root already has a stronger game-relevant
contrast, developed by other agents: Agent 43's owner-only
Secret Box -> Fog Crystal -> Basic Psychic -> Unown Hidden Power native
replay physically Knocked Out the opposing 60-damage Trubbish, removed its
three Darkness Energy and took one Prize; the separate Lillie replay drew
eight but found no Energy. These are same-source developmental observations
from the [Agent 43 detailed evidence](agent43-v9-root93-lillie-eight-card-energy-screen-20261107.md),
not a new paired experiment or a reliable universal policy ranking.
A source-independent decision system must evaluate the **attainable tactical
payoff and competing use of held resources**, rather than count access or
draws as success.

## Conditional exact loss of immediate Secret Box access under Lillie

The already archived root93 owner had **35 cards in deck** and ten in hand,
including one Secret Box and two Lillie's Determination. If the owner legally
plays one Lillie as the sole new Supporter action, its source card leaves
the hand first and its nine *other* hand cards are shuffled into that
35-card deck, making a **44-card** uniformly randomized paper deck.
Exactly **eight** are then drawn at the owner's six remaining Prizes.

Because the Secret Box is a *known held physical singleton* before this
shuffle, it is certainly among the 44 and its chance of appearing in the
new eight-card hand is exactly:

\[
P(\\text{Box redrawn}) =
1 - \\frac{\\binom{43}{8}}{\\binom{44}{8}} =
\\frac{8}{44}=\\frac{2}{11} \\approx 18.18182\\%.
\]

The probability of **losing immediate access to that originally held
Box** is therefore `9/11 ≈ 81.81818%`, conditional on this one Lillie
line, a correct uniform paper shuffle and no intervening search effects.
The second physically held Lillie has the same individual redraw
probability. Both would be redrawn together with probability
`(8 × 7)/(44 × 43) = 14/473 ≈ 2.95983%`.

This calculation does **not** infer Box's value, ongoing game win
probability, future search/recovery, or that the Lillie action should
be avoided in all states. It isolates the immediate option-displacement
risk before the player can use a paid Box/Fog attack. In the exposed
real Store replay, the alternative paid Box line removed the current
powered Trubbish and took a Prize, while the separate Lillie line
missed Energy; neither constitutes prospective policy proof.
The fractions were independently checked using Python's exact
`fractions.Fraction` arithmetic.

## Validation and boundaries

After commit `f2ace8ced0b72ccdb937a8c5b1449f2c4d75bce8` and regression commit
`b6913b8ceb7fcf028d1c0a752d0088f9e1206ec5`, the **actual fetched
four source modules, original 29-deck roster, and full modified test file**
were loaded into an isolated V8 tool harness with a minimal assertion/test
shim. **All 12 synchronous pure cases passed**, including the new physical
hand fixture. This is **not** a Node 22 process, native Twinleaf Store test,
or GitHub Actions verification; no CI success is claimed. The previously
recorded native root-93 and Lillie/Box results are independent historical
observations.

The model still does not decide whether Lillie is a paper-playable Supporter
in a particular live root, whether it is strategically preferable, or which
cards are drawn after shuffling. Source rank original inventory authentication
remains **29/32**, missing **23, 25, 28**; zero paper-competitive games,
no nominated final fixed 60, and no demonstrated 99.5% rate.

**Integration recommendation:** In future actor-only owner-choice comparisons,
include the M1L bulk displacement and the actual opponent-prize/turn restrictions
with the genuine Store-confirmed direct-payoff path. Treat owner-hand transitions
as the cost side of the decision and paper-legal attack/control settlement as
the reward side. Do not dispatch Lillie solely because its draw count is eight.
