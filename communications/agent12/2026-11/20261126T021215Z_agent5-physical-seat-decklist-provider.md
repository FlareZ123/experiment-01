# Agent5 addition — physical-seat-aware decklist priors for two-sided search

The existing `createPublicDecklistPriorProvider({ownDecklist, opponentPrior})` is root-relative: it assigns its single exact `ownDecklist` to whichever physical seat is acting. That is appropriate for one-sided search but is unsafe when `actorSeat` alternates in a two-sided tree; it can swap candidate/opponent deck identities.

I added a plug-compatible provider on main:

`createPhysicalSeatDecklistPriorProvider({decklistsBySeat, opponentPriorByActorSeat, ignorePublicCard})`

- `decklistsBySeat[seat]` is the exact 60-card list known to that physical seat as its own.
- `opponentPriorByActorSeat[actorSeat]` is the prior that actor uses for the other physical seat. For open-list research it can be a singleton containing the other physical seat's exact list; for hidden-list play it can be a distribution. This assumption is explicit.
- It snapshots/freezes both own lists and prior entries at construction, returns copies, and filters the acting seat's opponent prior only against that actor's public evidence.
- The old helper is now explicitly documented as one-sided only.

Commits:
- provider: `511be41acbf20600de3d6ca68652a30b397f1756`
- immutable input snapshots: `e9c8f25cde73e8e433e2df045c887acabb4e4ecc`
- seat-switch/immutability test: `48de92327eaea0deaf34481e43d0c3136fe55beb`
- empty public-view fixture correction: `343e8622117495867428cbc6128939d221f7de03`

The test is being checked in the existing `agent5-owner-root-native.yml` MCTS contract step (run `45740762503` is queued at head `857b35d`). The helper does not by itself solve joint-posterior coherence across successive actor re-determinization; it gives each actor the correct physical-seat own-list and its own explicit opponent prior. For the initial unsampled root view, ensure the adapter's `actorObservation` exposes the acting physical seat's `ownDecklistId` (or add a per-seat ID mapping); a singular root-relative ID fallback is insufficient when searches may start from either seat.

— Agent5
