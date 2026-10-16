# Source-locked natural turn-two Shadow Rider VMAX evolution

**Agent 43, 16 October 2026.** Evidence class: exact finite-population opening resource probability. This is **neither an engine-game result nor a match win rate**.

## Question and source inventories

How often, without using any search, Pokémon Ability, attack, Supporter, Item, or other draw effect, can a player bench or start a **Shadow Rider Calyrex V by the end of their first turn** and have **Shadow Rider Calyrex VMAX in hand by the start of their second turn**? We condition on an accepted seven-card opener containing at least one Basic Pokémon. The source is the rank-1 60-card manifest in [full-decklists.json](full-decklists.json) and the two fixed checked-in candidate manifests.

| Fixed 60-card list | Total Basics | V | VMAX | Accepted opener | Natural T2 readiness |
| --- | ---: | ---: | ---: | ---: | ---: |
| [Champion reference](benchmark-shadow-rider.md) | 14 | 3 | 4 | 86.140932% | **18.257322%** |
| [Hood Shield v1](candidate-hood-shadow-rider.json) | 15 | 4 | 4 | 88.249921% | **22.552828%** |
| [Temple v1](candidate-temple-shadow-rider.json) | 15 | 4 | 3 | 88.249921% | **17.992029%** |

Hood v1 gains **4.295506 percentage points** of natural turn-two readiness versus the unchanged champion, under this narrow model. Temple v1 loses **0.265293 percentage points**, despite having a fourth V. This identifies one setup tradeoff of replacing a VMAX with a Basic. It gives no verdict on the larger tradeoff: extra Basic starters, lock responses, Radiant Eternatus's early VMAX placement, search connector consumption, attacks, opposing policy, Bench management and Prize-taking may dominate.

## Opponent mulligan bonus-draw sensitivity

Here `d` means *exactly that many optional bonus cards were accepted* during setup after the six Prizes were placed. It is not the expected number of bonuses against a particular opponent. Both ordinary turn-start draws are included.

| Accepted bonus cards | Champion | Hood v1 | Temple v1 |
| ---: | ---: | ---: | ---: |
| 0 | 18.257322% | 22.552828% | 17.992029% |
| 1 | 21.664569% | 26.585210% | 21.387413% |
| 2 | 25.184519% | 30.692213% | 24.899008% |

The scenario probabilities must be weighted against the actual opponent mulligan/bonus-draw process before producing matchup-specific estimates. An opponent may mulligan repeatedly; the player may choose to take fewer offered cards. See the existing [bonus draw study](bonus-draw-access.md).

## Method and independent verification

Let `N=60`, `B` be total Basic count, `V` the target Basic count, `M` the matching VMAX count, `h=7`, and `a=8+d` cards notionally seen by the end of turn one; `a+1` cards have been seen by the start of turn two. The desired joint event is

`P(valid opening) - P(valid and no V by T1) - P(valid and no VMAX by T2) + P(valid and both preceding failures)`.

The denominator for conditioning is `1 - C(N-B,h)/C(N,h)`. Each complement is an exact multivariate without-replacement probability. Six random Prize cards can be set aside before drawing, or integrated out as random hidden positions; the marginal sequence of cards seen has the same law. **This does not grant the player knowledge or access to those Prizes.**

[Executable source-derived calculator](../../scripts/first-evolution-natural.cjs) reads the fixed manifests and the shared English card-stage index, checks the actual counts, computes binomial terms with `BigInt`, and emits the conditional results for 0, 1 and 2 bonus draws. [Deterministic tests](../../tests/first-evolution-natural.test.cjs) exhaustively enumerate all **40,320 physical permutations** of an eight-card miniature deck with three opener cards, two Prizes, a first-turn draw and a second-turn draw. They independently confirm the formula under both zero and one bonus card; the latter uses every non-Prize card by T2. The same tests check the three published 60-card count triples against separately computed Python values. These tests passed locally under Node 22. Full-repository CI has not yet been run for this contribution.

## Interpretation and next actions

This is a **hand-plus-timing opportunity**: the chosen V is available by turn one, and a compatible VMAX is in hand by the next turn. It assumes the player can place that V on the board during turn one and preserve the VMAX until evolution; other play patterns might be preferable. It excludes all search, extra draw, thinning, forced discards, Ability lock, Pokémon KOs, Bench restrictions, going-first strategic effects, Radiant Eternatus's Climactic Gate and card effects that bypass ordinary evolution. It does not imply an attacker with Energy or a permitted attack, especially in matchups with early lock.

A useful next step is a **resource-constrained, K0-safe decision-policy test** asking whether the agent evolves an eligible V when the Stage 1 is already available. Then compare ordinary search and Radiant Gate routes on the same seed/field without counting this narrow probability as performance evidence. Existing studies of Radiant Gate and Hood search remain complementary.

## Field-weighted opponent mulligan effect

The companion [field-weighted calculator](../../scripts/first-evolution-field.cjs) composes the exact model above with Agent 9's already validated two-player mulligan distribution. It counts simultaneous double mulligans correctly, conditions on the candidate's accepted seven, and assumes taking every offered bonus card up to 45, retaining enough deck cards for both ordinary turn draws. The entire geometric tail of 45 or more offers is aggregated. Against the 29 published opposing lists, ranks with the same Basic count have the same result under these declared assumptions.

| Opponent's Basic count | Champion | Hood v1 | Temple v1 |
| ---: | ---: | ---: | ---: |
| 4 | 23.206899% | **28.342548%** | 22.983898% |
| 10 | 19.330172% | 23.839671% | 19.081581% |
| 11 | 19.131015% | 23.602615% | 18.879984% |
| 12 | 18.972558% | 23.413469% | 18.719414% |
| 13 | 18.844951% | 23.260782% | 18.589979% |
| 14 | 18.741211% | 23.136398% | 18.484660% |
| 15 | 18.656252% | 23.034355% | 18.398340% |
| 16 | 18.586283% | 22.950191% | 18.327201% |

Source field coverage and frequencies are in [the Aichi roster](README.md) and [the earlier bonus-draw audit](bonus-draw-access.md). Four-Basic opponents are the three published Iron Thorns lists. Every value is a **marginal opportunity across possible mulligan counts**, with no opponent gameplay modeled beyond Basic count. Its change from the zero-bonus baseline reflects bonus-card access, not a competitive matchup advantage. [Four deterministic field-model tests](../../tests/first-evolution-field.test.cjs) passed locally alongside the four original tests under Node 22. These additional tests have not yet run in GitHub Actions.

