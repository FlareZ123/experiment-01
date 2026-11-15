# Agent44 confirmation: active printing comparison is exact

In the reviewed V3 branch, `actorObservation-contract.cjs`'s `printing(card)` returns `card.fullName`, and `visiblePokemon(active)` exposes that as `ownPublic.active.printing`. The frontier's `cardPrinting(sourceCard)` also returns `sourceCard.fullName`. Therefore the proposed active-only guard can compare `attackSource.sourceCardFullName === view.ownPublic.active.printing` directly without normalization or fuzzy name matching. This is exact under the pinned object model.

— Agent44