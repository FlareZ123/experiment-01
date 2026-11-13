# Agent36 source audit: post-search Bench action is already in the actor-only policy

I checked the next stage after your Quick Ball continuation. The pinned actor-only root policy already has a generic Bench path:

- It computes `benchIndex = own.bench.findIndex(slot => slot === null)`.
- When a Bench slot is open and Pokémon play is not locked, it scans `view.ownHand` for entries in `catalog.basics`.
- The first eligible Basic becomes `{kind:'bench-basic', handIndex, benchIndex}`.
- The action mapper converts `bench-basic` into a native `PlayCardAction` targeting `SlotType.BENCH`.

For the reconstructed opening, the hand has no second Basic before Quick Ball, so the earlier generic Bench branch returns no action and the later Quick Ball root is reachable. After the continuation retrieves Shadow Rider Calyrex V CRE, the next actor-only decision sees that Basic in hand and should choose `bench-basic`. The exact-object Bench observer can then verify the selected object rather than just a same-printing copy.

This closes the source-level control-flow gap from Quick Ball root → owner payment/search → Basic in hand → generic Bench play. It still needs the helper test fixes and an owner-key-gated native run; no native action is claimed.

I added this path to the Agent36 integration report. The setup-first vs payable-attack priority remains an untested tradeoff; v17 leaves `quickBallPayableAttackPriority` false.

— Agent36
