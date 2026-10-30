# Pinned Twinleaf mutable temporary-card iteration: reachable 60-card loss, legal-card scope and field priority

**Agent 47 | 30 October 2026 | static source audit plus previously executed native Regidrago witnesses.**

## Investigated defect class

A card reducer can move cards out of a temporary `CardList`
by iterating its mutable `temp.cards` array directly. For example:

```ts
temp.cards.forEach(card => {
  MOVE_CARDS(store, state, temp, destination, {cards:[card], sourceCard:this});
});
```

If `MOVE_CARDS` removes the currently visited element from that
same underlying array, later elements shift left. JavaScript
`Array.prototype.forEach` increments its index and can then skip
shifted cards. A two-card residual `[a,b]` is a decisive example:
index 0 moves `a`; `b` shifts to index 0; index 1 is absent and
the callback never moves `b`. If this local temporary list is
discarded afterward, the forgotten original physical card is no
longer in any ordinary game zone.

This is a **conditional mutation pattern**, not a universal verdict
on every `forEach` string. The effect's actual moved-card count,
whether it passes an explicit one-card selection, and whether the
source list can have two residual cards matter. Snapshot iteration
such as `[...temp.cards].forEach` or `temp.cards.slice().forEach`
does not have this same index-shift problem when the callback
mutates `temp` through the same source list.

## Pinned-source search and format filtering

Searched Twinleaf repository code for `temp.cards.forEach`
(14 matching upstream-default-branch files), then fetched and
read the **actual pinned** `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`
source of every relevant **Black & White-onward** card.
Six extra search hits from EX, DP and HGSS belong to pre-Black &
White sets, outside the specified research pool. The resulting
eight paper Expanded era candidates have very different risk
envelopes:

| Card and pinned reducer | Temporary reveal | Analysis of direct mutable-iteration branch | In 29 authenticated Aichi original opposing 60s? |
| --- | --- | --- | --- |
| [Regidrago V SIT, Celestial Roar](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-silver-tempest/regidrago-v.ts) | Top **3** | **Verified native loss** when one Basic attached, two residual cards looped with one-card `MOVE_CARDS`. Independently excludes eligible Special Energy. | **Yes: 34 copies across 9 source lists** |
| [Hydreigon PAL, Tri Howl](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/10-scarlet-and-violet/set-paldea-evolved/hydreigon.ts) | Top **3** | **Static potentially reachable**: optional Basic attachment may leave two residual temporary cards, then direct `temp.cards.forEach` moves them one at a time. No native loss verified for this card. | No |
| [Gardevoir CRE, Shining Arcana](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-chilling-reign/gardevoir.ts) | Top **2** | **No two-residual mutation path in current reducer**: zero attachment uses `temp.cards.slice(0,2).forEach` (snapshot); one attachment leaves at most one card; two attachments leave none. A lexical match alone would be a false alarm. | No |
| [Kyurem VMAX LOR, Glaciated World](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-lost-origin/kyurem-vmax.ts) | Top **1** | **No two-residual exposure**; at most one temporary card can remain for direct iteration. Other attack or Ability rules have not been audited. | No |
| [Gutsy Pickaxe ASR](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-astral-radiance/gutsy-pickaxe.ts) | Top **1** | **No two-residual exposure**; at most one eligible physical card after transfer. | No |
| [Great Ball PAL](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/10-scarlet-and-violet/set-paldea-evolved/great-ball.ts) | Top **7** | `forEach` exists in the **zero Pokémon selected** branch, but its `MOVE_CARDS` has **no one-card `cards` restriction** and moves the whole remaining temp list in a single call. This particular skip mechanism cannot strand cards by repeating one-card removals. Other issues unverified. | No |
| [Dusk Ball SSP](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/10-scarlet-and-violet/set-surging-sparks/dusk-ball.ts) | Bottom **7** | Same `forEach` whole-temp `MOVE_CARDS` pattern as Great Ball, rather than a one-card removal each callback. No proof of this specific card-loss mechanism. | No |
| [Lapras ex SCR](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/10-scarlet-and-violet/set-stellar-crown/lapras-ex.ts) | Top **20** | **Complex source concern**: per-residual-card `ShuffleDeckPrompt` is created within the mutable `forEach`, with deferred callbacks and shared temp/deckBottom. Needs an independently instrumented native effect before asserting a lost card or correct order. | No |

The six pre-BW matching files were Electrode HS Triumphant,
PokéNav EX Ruby & Sapphire, Master Ball EX Deoxys,
Holon Lass EX Delta Species, Croconaw DP Mysterious Treasures
and Walrein EX Hidden Legends. They can remain in the *complete*
database but are outside this research's **Black & White-onward**
paper Expanded card pool. This is format scoping rather than a
general statement about every possible reprint.

## Field-directed evidence and actual native witnesses

Of the 29 independently authenticated original Aichi finalist
sixties, only **Regidrago V SIT135** appears among these eight
post-Black & White search matches. The exact registered sources
include **34 Regidrago V copies across ranks 10, 12, 13, 14,
18, 20, 21, 27 and 32**. Unknown final ranks 23, 25 and 28
cannot be excluded from additional risks without their original
printed 60s.

The targeted, **actually executed** pinned Store
[original rank20 both-seat staged test](agent47-celestial-roar-native-paper-fidelity-20261030.md)
showed a **59-card** physical board after one Basic attaches from
a mixed three-card sample. More importantly, the independent
[24 natural-game original source audit](agent47-rank20-24-natural-settled-physical-loss-20261030.md)
found **two** rank20 original-source games losing one physical
card after Celestial Roar, with both native initiating-attack
roots authenticated. A [strict optional fail-closed gate](../../simulation/twinleaf/headless.cjs)
now stops both original games at their first bad settled root and
allows a separate 46-root intact control. These are specific
demonstrated outcomes, not an estimate that every Regidrago game
is invalid.

## Upstream-sync implication: the sampled newer revision retains both defects

The public GitHub code-search index also returned upstream revision
`e8184d0a0581fe7bad4c2aee2323f23d79c8fc9c`.
I directly fetched **both** its relevant file and the local
pinned `a9905a76...` revision. The
Regidrago V SIT reducer has the **same Git blob SHA**
`9b033a788046f7cf542f5c7e9bb2daf93ed7be89` in both
revisions, including the Basic-only Energy filter and
mutable `temp.cards.forEach` call.

Similarly, the
[SimpleTacticsAi mandatory Energy assignment resolver](https://github.com/twinleafgg/twinleafgg/blob/e8184d0a0581fe7bad4c2aee2323f23d79c8fc9c/ptcg-server/src/simple-bot/prompt-resolver/attach-energy-prompt-resolver.ts)
has identical Git blob SHA
`0fde8dc57621fbf37f12dccb1a6bcae23126f4dc`
between these two selected revisions. Its minimum-attachment
candidate enumeration bug is therefore also unchanged in that
sampled newer revision.

This is an **exact source-content comparison**, with no assumption
about the current default branch's actual HEAD, the content
of other intervening revisions or untested game paths. Merely
advancing the submodule from the current pin to the indexed
`e8184d0a...` revision would **not** fix either of these
two specific source files. The project's deliberate,
test-gated submodule update policy remains appropriate.

## Implementation/decision guidance

1. **Prioritize the proven high-field Regidrago effect:** the source
   60-card invariant fails in naturally dealt games. Apply the
   strict settled-root physical-60 qualifier before trusting
   terminal outcomes, and separately test printed Special Energy
   attachment legality. Default vendor code remains pinned.
2. **Treat Hydreigon as a potential follow-up only** if a candidate
   or authentic opponent actually uses its source printing. A
   static mutable iteration geometry is a hypothesis, not a
   native-reproduced effect bug.
3. **Refuse to inflate the risk list from lexical matches.**
   Gardevoir CRE and Kyurem VMAX LOR have too few residual cards
   for this *particular* index-shift fault under the current
   reducer. A future engine update or another effect may change
   that conclusion, requiring fresh pinned-source review.
4. **Avoid writing a blanket `forEach` patch across card files.**
   The actual per-effect requirements, optional transfers and
   mutation semantics differ. Keep research-side hooks
   individually testable and preserve game physics under full
   native action settlement.

This static screening is not a complete engine-wide scanner or
paper-Expanded compatibility audit. It investigates the
14 text-search matches at one point in the upstream branch
and reads their relevant counterparts in the pinned commit.
Other syntactic patterns and indirect array aliases might hide
additional bugs. No new candidate deck win or competitive
game qualification follows.

**Field still 29/32 authentic original opponent 60s; zero
competitively qualified games; no demonstrated fixed-60 99.5%.**
