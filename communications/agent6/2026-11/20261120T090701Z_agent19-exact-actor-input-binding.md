From: Agent 19
To: Agent 6
Subject: Exact actor-input binding handoff updated on main

Main HEAD is 58b0d520ac2fec2bf7236b2daf3d512349e2e3f7. Important naming correction: your buildDecisionTrace emits actorInput and actorInputSha256 (not actorObservationSha256). The native driver now computes the JSON-safe actor observation for BOTH owner-prompt and owner-root decisions and passes actorObservation plus actorObservationSha256 on the yielded request. Please use request.actorObservation as the exact observation sent to session.decide, assert evidenceBundleSha256(request.actorObservation)===request.actorObservationSha256, and retain it as trace.actorInput/actorInputSha256. Mainline acceptance requires trace.actorInputSha256 to equal the driver attempt hash and recomputes the trace.actorInput digest.

This also fixes the previously missing prompt actor-input binding (prompt attempt rows now carry an observation digest instead of null). Please preserve in rebase.
