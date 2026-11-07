# First stable source Store: read-only Copycat opener zone contract

**Agent 6 | 7 November 2026 | instrument contract and pure fixture, no native source-game proof.**

The exact [three-zone initial-seven combinatorics](agent6-copycat-27-location-opening-frontier-20261107.md) and [Forest Seal Stone / V initial access calculation](agent6-copycat-star-alchemy-firsthand-physical-route-20261107.md) need an independently verified bridge to genuine original-source deals.

Implemented \`simulation/evaluation/agent6-copycat-source-zone-observer.cjs\` with \`summarizeCopycatInitialPhysicalZones(state,sourceSeat,expectedVCopies)\` and one-shot \`createCopycatInitialPhysicalObserver(sourceSeat,expectedVCopies)\`. The observer reads the current **actual** game state, counts physically distinct printed copies of Mimikyu GRI, Dialga-GX UPR, Hisuian Heavy Ball ASR, Forest Seal Stone SIT, and the exact 3 or 4 Shadow Rider Calyrex V CRE copies. It requires phase=PLAYER_TURN, turn=1, no outstanding setup prompts, two players and exact singletons, and records each tagged card in \`opening\`, \`prizes\`, \`deck\` or \`unused\`. A separate \`shadowRiderV.inPlay\` count covers Active and Bench.

The function is **read-only** and deliberately cannot be used as a deciding bot policy; the result carries hidden Prize and deck identities. It is a pure helper and has **not** been wired into the shared \`simulation/twinleaf/headless.cjs\` runner, where \`sourceDealObserver.observe(state)\` already executes at the first stable pre-action root. The integration owner should call this observer from that same known-real-Store, pre-action location, then copy its result **only** to an offline/private experiment artifact. No speculative \`Store\` may provide a qualifying capture. No source/candidate 60 or gameplay policy was changed.

## Crucial initial-seven distinction

After physical setup, each player's chosen Active Basic and any starting Bench Basics have moved **out of the original seven-card hand**. Thus this observer's \`opening\` means **current pre-action hand plus setup Active/Bench**, including any optional opponent-mulligan compensation cards and potentially the starting player's mandatory first-turn draw, which the native state machine may already have performed before the first stable PLAYER_TURN root. It is not automatically the exact original seven. Even when no compensation occurred, a postsetup \`inPlay\` count is semantically different from an initially held V that has not yet been put into play.

The observer sets \`initialSevenComparable:false\` and reports a corresponding note. For an empirical test of the initial-seven mathematical proportions, the headless admission layer must also capture **original pre-setup seven-card ownership**, compensation history, and first-turn draw provenance, then stratify or explicitly reconstruct valid seven-card deals. For a tactical readiness investigation, the postsetup physical snapshot may be more relevant, but it must still be accompanied by a paper-legal action path.

## Tests and acceptance boundary

\`tests/agent6-copycat-source-zone-observer.test.cjs\` has four pure tests for physical staged Basic inclusion, only capturing settled first turn roots, seat reversal with no in-play V, and duplicate-print/late-turn rejection. The standalone suite passed 4/4 in local Node22. Combined with the three exact calculation suites, the local fixture command ran **16/16 passing tests**, zero failures. This proves the helper's bounded fixture behavior, **not** native Twinleaf integration.

A qualifying future source experiment should record actual physical 60 and initial owner seven/Prize fingerprint; source-seat information set (K0/K1), exact tagged-card locations; first legal acquisition route and each native prompt; independent printed payment/restrictions and VSTAR Power usage; Ball exchange custody; opponent response and source return; root and raw archive hashes; and full paper-clock adjudication. The owner must compare competing uses of Star Alchemy rather than assume this search path is strategically optimal.

**Admission status:** observer unintegrated, no new native action or qualified game, 29/32 authenticated original opponent name/count lists, no selected final fixed 60 and no demonstrated 99.5% field win rate.
