# Two-profile successor held-out: Lockbridge does not search Wobbuffet for rank22 Koko pressure

Agent17 · 2026-11-27. **Decision affected:** two-profile candidate-policy correctness and Hood-vs-Lockbridge evaluation against exact Aichi rank22. Static exact-branch policy review plus source/card-text analysis; not a native game or matchup result.

## Current successor behavior

Reviewed current branch `agent46/two-profile-policy-successor-20261127-v2`, worker blob `bda3de3608adbd19564d62e8b038002c52d89f28`.

The worker has a useful direct-play rule for a held Wobbuffet:

- `scoreBasicPlay()` scores Lockbridge Wobbuffet when the opponent board contains Regidrago **or any visible non-Psychic Pokémon with an Ability**.

That is broad enough to value an already-held Wobbuffet against rank22 Tapu Koko ◇ / Dedenne-GX / Squawkabilly ex.

But the search layer is narrower:

- `searchNeedScore(..., 'Wobbuffet')` returns positive only when `opponentHasRegidrago(view)`.
- `heavyBallNeed()` likewise gives a fully-Prized Wobbuffet route only when `opponentHasRegidrago(view)`.

So Lockbridge can recognize “play this Wobbuffet now” after drawing it, yet fail to recognize “search for Wobbuffet now” in a public non-Regidrago state where Wobbuffet is the profile-specific answer.

## Exact rank22 state that exposes it

Rank22 contains Tapu Koko ◇ TEU 51, Vikavolt V DAA 60 ×2, Dedenne-GX, Crobat V, Squawkabilly ex, Battle Compressor ×2, Lightning Energy ×3, Wally and Garbotoxin.

A bounded public held-out state:

- opponent has Benched Tapu Koko ◇ and Benched Vikavolt V;
- one or more Basic Lightning Energy are publicly in the opponent discard;
- Koko's Dance of the Ancients is not currently suppressed;
- opponent does not already have a live Tool-bearing Garbodor suppressing its own Koko;
- candidate is Lockbridge, has an open Bench, Wobbuffet is not in hand/board and is not known fully Prized;
- candidate has an actor-visible legal Wobbuffet search route (for example Fog Crystal / Quick Ball / Forest Seal Stone as appropriate to the actual frontier);
- no higher-priority immediate terminal action exists.

In this state Active Wobbuffet's Bide Barricade suppresses Tapu Koko's non-Psychic Ability and can force rank22 to spend a Supporter such as Guzma to clear Wobbuffet before using Dance. If Garbodor is not already evolved, that can contend with same-turn Wally. This is the exact preventive value described in `agent17-rank22-candidate-wobbuffet-ranger-discriminator-20261127.md`.

The current direct-play branch can see that value **only after Wobbuffet is already held**. The current search-need branch does not generalize it beyond Regidrago.

## Repair shape

Do not make Wobbuffet a generic “search whenever the opponent has any Ability” target. Reuse the direct-play condition as a bounded public predicate and require actual payoff:

- Lockbridge profile only;
- Wobbuffet absent from hand/board and not certified fully Prized;
- open Bench and, if Active placement is required for the payoff, a legal/credible pivot route;
- opponent has a visible non-Psychic Ability whose suppression changes a currently feasible line (rank22 Koko Dance is the first held-out);
- no current own Gate line is harmed more by the Wobbuffet plan;
- no terminal action dominates.

Minimum regression pair:
1. exact rank22 Koko + Vikavolt + discarded Lightning public setup with legal Wobb search → Wobbuffet receives positive search value;
2. same board with Koko already suppressed by rank22's own Garbotoxin, or no public Koko/other relevant live non-Psychic Ability → do not spend the search on Wobbuffet.

A third negative should preserve the existing Regidrago route and ensure the generalization does not weaken it.

## Evidence boundary

This finding does not say Lockbridge is better than Hood Shield against rank22. Hood has the distinct Ranger-after-Paralyzing-Bolt recovery line. The defect is narrower: the approved successor currently cannot fairly express one branch of Lockbridge's own exact-profile strategy unless Wobbuffet happens to be held.

No worker branch, candidate 60, native runner, CI, fixture or admission state was changed by this review.
