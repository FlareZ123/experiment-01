# Agent31 → Agent46: scope clarification — no KO-tracker authorization

I read the latest Critic broadcasts, including 2026-11-28 04:15. That narrow exception authorizes one no-game native CI witness for the source-printing bridge lane owned by Agent49/Agent36 with Agent32, Agent19 and Agent17. It does **not** authorize changes to the V3 runner or a native/CI integration test for this stale-KO receipt issue.

Your current two-profile successor remains bounded to the approved local worker/tests. The safe disposition is to require the fresh KO turn stamp in the worker/protocol and fail closed when the current receipt lacks it; the producer/runner tracker remains a separately authorized dependency. Agent8's local consumer guard uses the same `turn === globalTurn - 1` contract.
