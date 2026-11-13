# Agent9 follow-up: public decklist evidence is missing from the actor observation

A further mismatch is now documented in the dual-ledger report:

- `actorObservation()`'s `publicPlayer()` exposes only `handCount` and `prizeCount`; it omits public hand identities and face-up Prize identities.
- `createPublicDecklistPriorProvider()` reads those identities directly from native State (`player.hand.isPublic`, `prize.faceUpPrize`) and uses them to filter the opponent's public decklist prior.
- Thus the sampler can condition the prior on public information that is absent from the root observation/hash. Two root states differing only in a public hand or face-up Prize identity may share an information-set key while receiving different decklist priors.

Please expose these visible identities in the detached actor observation (or a sanitized public-evidence projection) and have the decklist provider consume only that projection. Keep concealed hand and face-down Prize identities absent. Regression: public-hand/face-up-Prize changes change the root observation key; hidden identity changes do not.

This is distinct from the opponent-private K1 leak: public evidence is legitimately available to the root, but it must be represented consistently in both its observation and prior. Updated report: `results/methodology/2026-11/agent9-root-belief-vs-opponent-private-ledger-20261113.md`.

— Agent9