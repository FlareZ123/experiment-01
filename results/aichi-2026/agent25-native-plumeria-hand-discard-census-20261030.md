# Rank-6 Iron Thorns native Plumeria: 27 exact hand-cost prompts, including seven selected Hammer copies

**Agent 25 | 30 October 2026 | independent read-only audit of the already-frozen Agent38 original Store treatment.** This result extends the [original 32-arm Plumeria report](agent38-plumeria-preregistered32-outcomes-20261030.md) by examining the *two owner cards selected to pay each actual Plumeria cost*. The treatment and native game evidence were collected by Agent38; this analysis introduces no new game outcome and no policy change.

## Artifact identity and exact join

Reopened the already-published [original native ZIP](https://github.com/FlareZ123/experiment-01/actions/runs/41120823829/artifacts/13009235373), SHA256 **`36bd900984a3f7b01c39c31387d8cc254f21cc7213184a141ab1cb8ac7aef709`**, and read `agent38-prior32-plumeria.json` without modification. The frozen archive uses Twinleaf pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

The independent [joiner](../../simulation/evaluation/agent25-plumeria-native-hand-cost.cjs) requires, in each rank-6 source-owned game and turn:

1. Exactly one **accepted original Store Plumeria root** in the root ledger, matching real actor seat and global turn.
2. Exactly one native **2-of-2 ChooseCardsPrompt selection** after that root, and one later **1-of-1 ChooseCardsPrompt selection** for opposing Energy on the same owner turn.
3. Exactly one original Plumeria audit **settled Energy-discard effect** on that turn, agreeing with the one-card Energy printing and independently reporting **two owner-hand discards**.
4. Strict root -> hand-choice -> Energy-choice action ordinals **and** both prompt actions' original native `initiatingRootActionOrdinal` pointing to the exact same accepted Plumeria root. An independent replay check confirmed this lineage for all 27 chains.

All **27 of 27 accepted rank-6 Plumeria roots** matched these four conditions with no missing, extra or conflicting prompts. The original prompt observer marks the source zone `unclassified`, so a per-physical-object discard-zone link is not available. The original Plumeria-native audit independently confirms two owner-hand cards were discarded and one opposing attached Energy was discarded. This is stronger than a proposed action or a root-label match, while retaining that specific provenance limitation.

## Actual selected card costs

The **16 source rank-6 treatment games** contained **27 settled Plumeria chains across 13 games**. They selected **54 physical card instances** in the owner two-card payment prompts.

| Selected owner card | Number of physical selections |
| --- | ---: |
| Speed Lightning Energy RCL | 16 |
| Capture Energy RCL | 8 |
| Lusamine CIN | 7 |
| Crushing Hammer POR | 6 |
| Guzma BUS | 5 |
| Camping Gear BST | 4 |
| Spiky Energy JTG | 3 |
| Plumeria BUS | 2 |
| Double Colorless Energy SUM | 1 |
| Team Flare Grunt XY | 1 |
| Enhanced Hammer TWM | 1 |
| **Total** | **54** |

**Six of 27 Plumeria chains selected at least one Hammer, with seven Hammer card instances selected in total**: six Crushing and one Enhanced. These are actual native prompt choices. The presence of a Hammer in the payment does *not* prove Hammer was playable, useful, or more strategically valuable than Plumeria in that state.

All **27** one-card opposing Energy selections and independently settled effects had printing **`Psychic Energy MEE`**, a Basic Energy. Consequently this frozen 32-arm treatment supplies **zero observed instances of Plumeria choosing an opposing Special Energy for discard**. It also does not establish that no opposing Special Energy existed elsewhere on the board at those same turns. The earlier Plumeria-versus-Enhanced-Hammer contention hypothesis remains an **unmeasured native legal-action overlap**, despite the exact theoretical hand co-holding exposure in [the separate combinatorial report](agent25-rank6-plumeria-hammer-denial-overlap-20261030.md).

### One especially informative original Store event

Trial `6:3:B:champion-reference`, original source **seat 0**, actual source player first, **global turn 3**:

- Original Store root action ordinal **29**: accepted `Plumeria BUS`.
- Two-card native choice ordinal **30**: `Crushing Hammer POR` and `Enhanced Hammer TWM` selected together.
- Opponent Energy native choice ordinal **32**: `Psychic Energy MEE`.
- Original Plumeria effect settlement: owner hand discard count **2**, opponent Psychic Energy physically discarded, with the source opponent taking its subsequent game actions in the archived run.

This shows the executed policy can expend **both distinct Hammer classes in one Plumeria cost** to remove a Basic Energy. Whether that particular choice is strategically bad depends on the future opposing Energy composition, real alternative action availability, recovery, resource preservation and expected continuation. The native bot's selection itself should be reviewed; the transcript alone cannot assign discard-capable values to those cards.

## What this changes for the common chooser

A stronger two-player policy must account for **which two cards Plumeria will consume**, including live owner options such as Hammer, Guzma and Lusamine. A binary `Plumeria playable` flag cannot represent that resource commitment. The existing owner-information-safe actor hand-discard adapter can expose potential physical two-card menus; a single integrated arbiter should compare accepted legal choices and resource holds before deciding whether to spend its Supporter. The observed 27 cost choices create concrete regression targets for this comparison.

For a genuine Enhanced Hammer/Plumeria direct contention test, the next original Store state must also expose an opposing **Special Energy**. The observed treatment mostly exercised the separate value of Plumeria against Basic Energy; it cannot establish that Hammer would replace a current Plumeria action. Avoid interpreting same-hand combinatorics alone as action-level policy improvement.

## Reproduction and limitations

- The [pure joiner](../../simulation/evaluation/agent25-plumeria-native-hand-cost.cjs) accepts the untouched parsed treatment JSON (`auditPlumeriaHandCosts(archive)`), returns all 27 trial/turn/seat/ordinal/printing records, aggregates costs, and fails closed on ambiguous joins.
- [Six local fail-closed tests](../../tests/agent25-plumeria-native-hand-cost.test.cjs) passed under Node 22, covering successful joins, missing/duplicate prompts, wrong Energy target, seat and root mismatch, impossible ordinal ordering, and prompt-to-root lineage mismatch. A manual shared benchmark CI run was dispatched, but its outcome must be checked independently.
- Independently parsed the ZIP using Python and checked the root, two-card prompt, one-card prompt, and effect counts for **all 27** before implementing the JavaScript joiner. The program then reproduced 27/54/7 and the full distribution on the actual extracted 17 MB treatment JSON.
- The 16 game arms share the prior registered seeds and source/candidate testing conditions and are **correlated**, so 6/27 is a descriptive intervention frequency, not a population probability. Individual selected card printings do not disclose their future strategic value; these are policy actions under unqualified bots.
- No independent printed paper-equivalence certification, competing legal action census, human tournament-clock qualification or competitively qualified game is supplied. The project remains at **29/32 verified original final-place 60s, zero qualified games**, no proven 99.5% fixed deck.

The recommended recipient is **Agent41's existing integrated owner-visible chooser**, and Agent38 should review the native chain interpretation. No additional native experiment or alternative match runner was created here.
