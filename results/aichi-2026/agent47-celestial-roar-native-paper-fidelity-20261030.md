# Regidrago V Celestial Roar: pinned native Special Energy omission and temporary-card leak

**Agent 47 | 30 October 2026 | exact source-printing mechanics and failed native fixture, not competitive game evidence.**

## Why this is a release-blocking class of mechanics

The original registered Aichi 2026 rank-20 60 includes **4 Regidrago V SIT135,
4 Double Dragon Energy ROS97, 4 basic Grass and 2 basic Fire**. Its Regidrago V
Celestial Roar states: **discard the top three deck cards and attach any Energy
cards found to this Pokémon**. Double Dragon is a Special Energy, printed to
attach only to Dragon Pokémon; Regidrago V is Dragon. The conditional printed
instruction therefore includes Double Dragon Energy.

The pinned Twinleaf upstream revision is
`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Source audit shows
two independent mechanisms in its
[exact Regidrago V SIT reducer](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-silver-tempest/regidrago-v.ts):

1. **Special Energy excluded:** after moving three physical cards into a
   temporary `CardList`, the reducer selects only
   `card instanceof EnergyCard && card.energyType === EnergyType.BASIC`.
   It sends a Special Energy such as Double Dragon to discard, even though
   the printed attack says any Energy. If no Basic is drawn, it skips the
   attachment prompt entirely. The pinned
   [Double Dragon ROS implementation](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/07-x-and-y/set-roaring-skies/double-dragon-energy.ts)
   confirms it is `EnergyType.SPECIAL` and accepts Dragon.
2. **Temporary-card physical loss:** when at least one Basic is attached,
   the residual `temp.cards.forEach(card => MOVE_CARDS(... temp ...))`
   mutates `temp.cards` inside its forward iteration. If there are at
   least two residual cards (for example one Basic plus Double Dragon
   and Quick Ball among the three), only the first residual card is moved;
   the next can remain in the inaccessible temporary list. That card
   disappears from all ordinary physical game zones.

A separate third bug was directly traced to the pinned
[SimpleTacticsAi AttachEnergyPromptResolver](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/prompt-resolver/attach-energy-prompt-resolver.ts):
it may select a highest-scoring attachment prefix shorter than the mandatory
minimum. This caused two paired aborts in the original 48-run
[natural rank-20 census](agent47-source20-original-24pair-apex-opportunity-20261030.md).
See the linked report for exact seeds, trial statuses and original artifact.

## Concrete native verification state

[Both-seat source-original stage](../../simulation/twinleaf/agent47-celestial-roar-double-dragon-pinned-native.cjs)
uses a complete physical copy of the original rank-20 60; moves two cards
to its Active Regidrago V line and arranges a chosen top three from the same
original print pool. It dispatches the actual native `AttackAction('Celestial
Roar')`, resolves real prompts and checks distinct physical IDs and zone
counts. This is deliberately a staged positive/negative fixture, not a
naturally dealt game or an opposing policy test.

- [CI 41131875944](https://github.com/FlareZ123/experiment-01/actions/runs/41131875944)
  failed during fixture preparation because both spare Double Dragons were
  in the deterministic Prize six. The fixture was corrected by moving an
  already-owned physical DDE from the staged evolved Active to the artificial
  deck, preserving all 60 cards. This early failure proves no attack effect.
- [CI 41132236515](https://github.com/FlareZ123/experiment-01/actions/runs/41132236515)
  compiled the pinned Store and actually reached the mixed
  **Double Dragon + Grass + Quick Ball** Celestial Roar native resolution.
  The fixture's final source-60 conservation assertion failed **59 versus
  60**. This is a direct physical-zone failure signal; no game win can be
  inferred from this failed job. Its pre-attack source-60 assertion passed.
- A modified fail-closed script now explicitly expects the **59-card** result
  for the original mixed scenario, and preserves 60-card expectations for
  no-Basic scenarios. [CI 41132531501](https://github.com/FlareZ123/experiment-01/actions/runs/41132531501)
  **succeeded**, with four directly executed native Store cases:
  both seats for special-only and for Double Dragon + Grass + Quick Ball.
  The [raw artifact 13014111401](https://github.com/FlareZ123/experiment-01/actions/runs/41132531501/artifacts/13014111401)
  has ZIP SHA-256 `f630cb386a07311051e5fbe57343ce4518edf56da374a8d5d466f51c16c9fe9a`.

  | Staged source case | Seat 0 | Seat 1 |
  | --- | --- | --- |
  | Double Dragon + two non-Energy | DDE discarded, no attach prompt, 60 cards retained | Same |
  | Double Dragon + Grass + Quick Ball | Grass was native-attachable; DDE excluded/discarded, **59 cards retained** | Same |

  Every native attack used the exact staged original-rank20 physical sixty
  before resolution, and each sample was created from named source printings.
  The fixture's `fixedDeckTop3` artifact field is empty because it references
  the deck array **after** native `MOVE_CARDS` empties that same array.
  Treat that one display field as an **instrumentation flaw**, rather than
  an authenticated post-hoc top-three receipt. The scripted physical
  selections and pre-attack source-count assertions remain reproducible;
  a future unaliased pre-dispatch sample receipt would improve audit strength.
  The physical-zone counts and attachment outputs remain separately observed.
- A research-owned *opt-in* source-rule correction prototype exists at
  [`agent47-celestial-roar-paper-energy-hook.cjs`](../../simulation/twinleaf/agent47-celestial-roar-paper-energy-hook.cjs).
  It includes Special Energy in a mandatory self-Active attachment prompt
  and iterates a copy of the remaining list when discarding. Its implementation
  is **unqualified and unvalidated natively**; do not silently enable or claim
  paper parity merely because its code exists.

## Quantitative illustrative upper population, not real-game exposure

Nine of the 29 authenticated original Aichi source 60s contain Regidrago V:
**ranks 10, 12, 13, 14, 18, 20, 21, 27 and 32**, with 34 copies of V and
3 or 4 Double Dragon Energy per 60. This establishes actual source-field
relevance without establishing how often any policy attacks with Celestial Roar.

For a transparent *hypothetical pre-opening sampling model*: remove one
Regidrago V and one attached Double Dragon from source rank20, then take
three uniformly random cards from the remaining 58. The population contains
three further Double Dragon, six Basic Energy and 49 other cards.
The full sample space is `C(58,3)=30,856`.

| Paper-rule exposure class | Exact numerator / 30,856 | Probability |
| --- | ---: | ---: |
| At least one remaining Double Dragon in top 3, suppressed by pinned Basic-only filter | 4,621 / 30,856 | 14.9760% |
| Exactly one Basic Energy in top 3, leaving two residual temporary cards exposed to the forward-mutation bug | 7,956 / 30,856 | 25.7843% |

These events can overlap. These percentages are **not** Celestial Roar
usage rates, probabilities conditioned on a legal actual opening, or
predicted game-win effects. Actual Prizes, hand, search, play policy and
remaining deck composition affect exposure. They quantify why the
implementation discrepancy warrants native fidelity review.

A slightly more conditional *opening-hand sensitivity check*, calculated
combinatorially from the exact original rank-20 60, samples the initial seven
uniformly and requires at least one Regidrago V and one Double Dragon in it.
That opening event has probability **14.5406%**. Assume the player chooses
Regidrago V as Active, attaches one of the held Double Dragons, chooses to
attack with Celestial Roar going second, and performs no intervening search
or deck-order manipulation. Marginalizing across the opening hand's
other five cards and random Prize/draw positions, the subsequent three
deck cards contain at least one additional DDE with probability
**15.5751%**, and exactly one Basic Energy (the original source reducer's
two-residual-card physical-loss configuration) with probability
**25.6855%**. This is a conditional card-arrangement model with
a deliberately forced action and ignores opponent effects. It is
**neither an estimated policy frequency nor competitive performance**.

The exact computation sums opening-hand multivariate hypergeometric
counts, weighted by `C(v,hV)C(d,hD)C(b,hB)C(o,7-hV-hD-hB)`
for original population counts `(v,d,b,o)=(4,4,6,46)`,
`hV>=1`, `hD>=1`. The remaining-deck marginal is three
uniform cards from the 53 not in the initial hand. Thus the missed
DDE numerator given each hand uses
`C(53,3)-C(53-(4-hD),3)`, while the exactly-one-Basic numerator
uses `(6-hB)*C(53-(6-hB),2)`; both are divided by
`C(53,3)` and averaged by the normalized hand weights.

## Nine-source conditional exposure panel (reproducible exact card populations)

The nine authenticated source 60s containing Regidrago V also have
different Energy counts. For each original list independently, impose
a *forced* Active Regidrago V with one original Double Dragon Energy
attached and no other cards seen or removed. Draw its next three cards
uniformly from the remaining 58, with no intervening actions and no
conditioning on a natural successful opening. This is a card-population
calculation that makes **no assumption about actual attack selection**.

| Source final ranks | Source 60 profiles | Probability any DDE in sample (omitted by pinned reducer) | Probability exactly one Basic in sample (two non-Basic residuals susceptible to skipped card) |
| --- | --- | ---: | ---: |
| 10, 12, 14, 20, 27, 32 | 4 DDE + 6 Basic | 14.9760% | 25.7843% |
| 13, 21 | 3 DDE + 7 Basic | 10.1633% | 28.9247% |
| 18 | 4 DDE + 4 Basic | 14.9760% | 18.5507% |

The DDE exposure is
`1 - C(58-(D-1),3)/C(58,3)`, the Basic-count exposure is
`B*C(58-B,2)/C(58,3)`, using the exact original source counts
`D` and `B`. A card being exposed to the broken effect does not
prove the SimpleTacticsAi chose Celestial Roar or that a full game
would be affected. The reported 59-card native loss is an actual
effect witness for **one staged mixed composition**; these percentages
are descriptive test-coverage priorities across original deck
populations, not measured native error rates or win-rate estimates.

## Benchmark consequence

Any matchup involving actual Regidrago Celestial Roar under this pinned
revision needs a distinct original-print, native-effect, source-60
conservation and paper-equivalence witness. Full game wins must remain
unqualified until these and the other known policy/engine limitations are
settled. One source fix must not silently convert the pinned revision into
a fully paper-accurate simulator.

**29/32 original opponent sixties, 0 competitively qualified games, no
demonstrated 99.5% fixed-60 result.**
