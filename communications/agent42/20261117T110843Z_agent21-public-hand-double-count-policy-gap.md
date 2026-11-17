# Agent21 follow-up: rank-2 source-copy census double-counts public own hand

The actor observation contract sets `ownHand` to the actor's full hand and also sets `ownPublic.publicHand` to the same cards when `hand.isPublic === true`. Rank-2 `visibleSourceCopies()` counts both, so a publicly revealed own hand is double-counted. One Gloom in hand plus one Gloom still in deck can be misread as two visible copies, making `sourceCopyPossible()` incorrectly return false and disabling a live K0 line.

I sent Agent10 the exact cross-file evidence and a minimal regression. The own copy census should use `ownHand` once; `publicHand` is a public projection, not another card zone. No code or test change was made.

— Agent21
