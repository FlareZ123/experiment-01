# Horror House-GX does not stop a prepowered Iron Thorns attack

**Agent 3, 18 October 2026 UTC.** Source-based rule interpretation plus a compiled, two-seat constructed Store action regression. This is a narrow counterexample to an unconditional New Moon hand-lock win line. No authentic shuffled 60-card match or qualified competitive result is claimed.

## Tested claim

Gengar & Mimikyu-GX TEU's printed `Horror House-GX` prevents the opponent from **playing cards from their hand during their next turn**. This is a player-scoped restriction, consistent with the supplied Advanced Player's Rulebook II C-19. It does **not** stop an already-powered Pokémon from attacking. The pinned [Gengar implementation](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/08-sun-and-moon/set-team-up/gengar-and-mimikyu-gx.ts) sets hand-play locks; the [Iron Thorns ex TWM implementation](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/10-scarlet-and-violet/set-twilight-masquerade/iron-thorns-ex.ts) has `Volt Cyclone`, costing [Lightning][Colorless][Colorless], dealing 140 damage and moving an Energy to a Benched Pokémon.

## Authentic reducer actions on a deliberately staged board

[`simulation/twinleaf/new-moon-native-horror-house-opponent-action.cjs`](../../simulation/twinleaf/new-moon-native-horror-house-opponent-action.cjs) constructs both physical seats separately. It gives Active Gengar & Mimikyu-GX one Basic Psychic Energy, with opposing Active Iron Thorns ex already carrying Speed Lightning Energy and Double Colorless Energy and another Iron Thorns on the Bench. It then:

1. Dispatches a real `AttackAction('Horror House-GX')`, resolves the engine's actual Wait prompts, and checks all six categories of hand-play restrictions on the opponent's turn.
2. Attempts to play an Item and a Supporter from the opposing hand, requiring each to be rejected without consuming the card.
3. Uses `CheckProvidedEnergyEffect`, `CheckAttackCostEffect` and `StateUtils.checkEnoughEnergy` to confirm the active opponent has sufficient Energy.
4. Dispatches a real opposing `AttackAction('Volt Cyclone')` on the locked turn, resolves the actual `AttachEnergyPrompt` by moving Double Colorless Energy to the Bench, and asserts **140 damage to Gengar** and physical Energy movement.

The [manual compiled CI 39082466238](https://github.com/FlareZ123/experiment-01/actions/runs/39082466238) at head `b71c1d4645baa0a1d655145bd00c08aba7034ce1` **passed the entire workflow**, including both seats of this source fixture. [Machine-readable Horror House response artifact](https://github.com/FlareZ123/experiment-01/actions/runs/39082466238/artifacts/12119303080).

## Earlier false-negative: illegal-action rollback changed the State object

The [prior manual run 39081821001](https://github.com/FlareZ123/experiment-01/actions/runs/39081821001) was red at the expectation of a `Volt Cyclone` continuation. Investigation of the pinned [`Store.reduce`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/store.ts) reveals that a rejected `PlayCardAction` assigns `this.state = deepClone(state, [Card])` during rollback. The fixture retained a reference to the **pre-rollback** `state`, `Player` and Bench slot objects. It therefore looked for prompts and damage on an obsolete graph even when subsequent actions actually targeted `store.state`.

The [fixture correction](../../simulation/twinleaf/new-moon-native-horror-house-opponent-action.cjs) now rebinds `state`, both players and the target Bench slot after each rejected action and asserts that the engine really replaced the state object. Successful two-seat attack resolution on the corrected fixture falsifies the original apparent non-attacking result. This distinction is important for any other research test that deliberately dispatches illegal actions and then retains references to the original State or players.

## Implication and limits

Horror House's hand lock buys a setup/hand-denial window **only insofar as the opponent actually depends on playing cards from hand**. Against a prepowered Iron Thorns, the protected New Moon board must account for the opponent's legal attack, Energy movement and next-turn pressure. Conversely, the fixture makes no claim about which attacks are available from a natural four-Thorns 60, how often Speed Lightning plus Double Colorless is attached beforehand, whether the New Moon player could take a stronger line, or the matchup win rate. The first actual source-dealt hard-matchup experiment must track realistic initial resources, both seats, honest opponent decisions and engine/policy fidelity. **Zero competitive games qualified.**

## Earlier one-attachment countercase: Double Colorless plus Thunder Mountain

The source field lists at ranks **6, 24, and 29** each run four Iron Thorns ex (their only Basic Pokémon), one Thunder Mountain Prism Star, and respectively **one, three, and one** Double Colorless Energy. The pinned [Thunder Mountain implementation](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/08-sun-and-moon/set-lost-thunder/thunder-mountain-prism-star.ts) removes the Lightning portion of attacks by Lightning Pokémon while that Stadium remains in play. One Double Colorless then satisfies Iron Thorns's remaining two Colorless requirements. A Stadium played on an earlier turn can continue working during Horror House's restriction on playing new cards from hand.

The same authentic Store fixture now runs **four rows**, both physical seats with each of the two conditions: two preattached Energy and **only one attached DCE with Thunder Mountain already in play**. Each row asserts a successful locked-turn 140-damage `Volt Cyclone` and an actual Energy move to the Bench. The expanded [full manual CI 39082876097](https://github.com/FlareZ123/experiment-01/actions/runs/39082876097) **passed** at head `6084af371dc5dec9ef3c182a29a4d0a4f60b7463`; [four-row source artifact](https://github.com/FlareZ123/experiment-01/actions/runs/39082876097/artifacts/12119164326). This countercase needs only one ordinary manual attachment on a previous turn, so it is especially important when evaluating first-response hand-lock plans.

### How often are the required physical cards directly visible?

An independent exact hypergeometric count, conditional on at least one of the four Iron Thorns Basics in the **initial seven cards**, computes the joint event that at least one Double Colorless and the singleton Thunder Mountain appear across those seven plus the first mandatory draw. Marginalizing random Prize-card placement by exchangeability, with **no mulligan bonus draws, Trainer search, or opponent choices**, gives:

| Published rank | DCE copies | Direct joint visibility by eighth observed card |
| --- | ---: | ---: |
| 6 | 1 | **1.278355%** |
| 24 | 3 | **3.499748%** |
| 29 | 1 | **1.278355%** |

The exact rational results are `13697/1071455` for one-DCE lists and `722693/20649860` for the three-DCE list. Calculation: enumerate seven-card multivariate hypergeometric counts of Basics, DCE, Stadium and other cards; condition on a valid starter; multiply each cell by the chance of completing any missing single resource on draw eight. Reusable source-anchored calculation: [`scripts/aichi-thorns-dce-mountain-direct.cjs`](../../scripts/aichi-thorns-dce-mountain-direct.cjs), with [exact-value test](../../tests/aichi-thorns-dce-mountain-direct.test.cjs). The rational fractions were independently computed and cross-checked numerically. The newly committed JS calculation and test **have not been run by CI yet**.

These percentages describe only an extremely narrow **direct physical access** event. They are neither estimates of the probability that a Thorns deck will establish Thunder Mountain plus DCE nor the chance of a legal attack against New Moon: every further search, pre-Horror-House turn, Prize-access line, discard constraint, Stadium counterplay, relative turn order and opponent tactical choice remains outside this model. In particular, both Tag Call and Guzma & Hala appear in all three lists and create additional access routes subject to first-player Supporter restrictions. Do not interpret these small direct odds as proof the counterattack rarely occurs in actual games.
