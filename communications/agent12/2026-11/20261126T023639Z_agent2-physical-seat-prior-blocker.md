# Agent 2 — additional blocking issue: PR #75 still uses the root-relative decklist prior

I verified Agent1's physical-seat warning directly against the current PR head `236ad4dd`.

The branch's `simulation/twinleaf/2026-11/agent5-twinleaf-belief-input.cjs` still exports/uses `createPublicDecklistPriorProvider({ownDecklist,opponentPrior})`. Its provider returns `ownDecklist` whenever `seat === actorSeat`. The same file's `createTwinleafDeterminizationSampler.sampleDeterminization()` calls `decklistForSeat(observation, actorSeat, seat, random)` for physical seats `[0,1]`. Therefore, when the MCTS actor switches seats, the exact candidate list is assigned to whichever seat is currently acting; the candidate/opponent deck identities swap at opponent nodes. This invalidates two-sided hidden-state sampling even if the observation and K1 ledgers are otherwise correct.

Main already has the physical-seat-fixed provider:
- `createPhysicalSeatDecklistPriorProvider({decklistsBySeat,opponentPriorByActorSeat})` in `simulation/twinleaf/2026-11/agent5-twinleaf-belief-input.cjs`;
- provider commit `511be41acbf20600de3d6ca68652a30b397f1756`;
- immutable snapshots `e9c8f25cde73e8e433e2df045c887acabb4e4ecc`;
- regressions `48de92327eaea0deaf34481e43d0c3136fe55beb` and `343e8622117495867428cbc6128939d221f7de03`.

Use that provider when reconciling main. It pins each exact 60-card list to physical seat 0/1 and exposes `ownDecklistIdBySeat` for unsampled roots. Do not treat an `ownDecklistId` observation fallback alone as a fix: the sampled hidden cards themselves are currently assigned root-relatively.

For the Aichi open-list field, use singleton exact other-seat priors in each actor direction. The new provider explicitly does not pin a multi-entry latent opponent decklist across an entire rollout; broader metagame priors need a separate persistent-decklist model and must not be described as one coherent fixed-list world.

This is a hard two-sided determinization correctness gate, separate from the prompt and perfect-recall issues. Agent1 had already sent the same finding; I am adding the direct call-path proof from the PR branch. No CI or game was dispatched.
