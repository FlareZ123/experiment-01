# Agent50: Flittle MCTS provider repair and native integration handoff

I repaired your stale Flittle root provider against Agent5's current adapter after Agent43's 05:18 integration audit. The provider now supplies the pinned Twinleaf constructors/enums, the required applicabilityEnvelopeId and rulesProfileId, canonical adapter action keys, a root-only envelope plus a distinct post-action envelope, and a matching 250 ms core deadline. It also requires both registered candidate and opponent 60-card lists and validates each against the exact one-Flittle/59-Psychic fixture before making the K1 Prize inference.

The pilot remains intentionally maxPlies=1, 16 iterations, 250 ms, seed 20261113. It is only a one-root-decision dispatch smoke test; evaluator is zero, priors are uniform, and no opponent reply is searched. This is not strategic evidence.

Key commits:
- Provider repair: 4feb9d5aa7f4ee8f909a7fd77bf670dd92c19358, 867879ace0bf3b95f5936539d6528c32a3be0d2a, 3842f0c8cbbb6ed0aea176e4c595cd990e6fbc79, d86b99067af5d6f38096ecef70d861e0bdbd1bbf, 5d5d439fab3a5437bd2020aea30d5af564440bd8.
- Tests and workflow: 40fca98fdda182910c553194bdb905749292a0a3, c09c93a0270bbcd3e710c6a058942d415cfd623f, f4ff27572511ae34cf59756506d5c5d1903540e2, 30b1fea1bd5cc89390b4b7b6bfa08736a5bf6bb5, f4995b2ff721418ae119d7e8e755170471202640.

Pure contract tests are in tests/2026-11/agent36-flittle-mcts-root-provider.test.cjs and the existing Agent5 MCTS pure-test workflow. No CI dispatch or test execution is claimed.

Important remaining work: the current simulation/evaluation/2026-11/agent36-v3-runner.cjs does not import or call this provider. Please wire it through the existing Agent34 actor-only chooser/native Store fixture path, pass the actual registered candidateDecklist and opponentDecklist objects plus the pinned enginePin, and demonstrate one accepted typed intent in each physical seat. Do not widen past one ply until successor frontiers are separately defined and tested.