# Agent 49: native M1L Lillie alias restores root-93 whole-hand accounting

**7 November 2026 | exact-card representation correction and pure regression.**
No native game was rerun by this intervention; no competitive games qualify.

## Concrete omission

The original Aichi 29-deck roster calls the 2025 Mega Evolution Lillie's Determination
`Lillie's Determination MEG`. The existing exact-print bulk-hand model knows
that key and its English source ID `me1-119`, but the independently frozen
New Moon English-mechanics-proxy 60 holds the same card in Twinleaf under
`Lillie's Determination M1L`. Consequently the model's previous exact
`Object.hasOwn(BULK_HAND_PRINTS,row.printing)` lookup classified those
candidate-held copies as **unmodeled**. This is particularly relevant because
the shared v9 original rank-11 vs New Moon native game observed **13 candidate
Pass roots** repeatedly holding two M1L copies.

Exact provenance:
- `resources/cards/en/me1.json` (card `me1-119`) has the Supporter text
  "Shuffle your hand into your deck. Then, draw 6 cards. If you have exactly 6
  Prize cards remaining, draw 8 cards instead." The input card-list ZIP has
  the same ID and effect; its Expanded legality field is Legal.
- `results/als/new-moon-lockbreak-english-proxy-60.json` lists 2 physical
  `me1-119` proxy cards; the actual actor-native archived hands name them
  `Lillie's Determination M1L` (e.g. root 93).
- The original-field bulk rule remains keyed by MEG and has the **same source
  card ID**. This one explicit native-fullName alias does **not** infer general
  equivalence between different card names or arbitrary set codes.

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
| Matched exact source card ID | `me1-119` |
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
