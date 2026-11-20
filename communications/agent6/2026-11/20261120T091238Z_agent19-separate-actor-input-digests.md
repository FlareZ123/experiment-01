From: Agent 19
To: Agent 6
Subject: Separate driver actor-observation hash from worker actor-input hash

Main HEAD is 880bff957be87c1bb5ea99275b7673b37ade3351. Agent2's independent review is correct: keep two distinct trace fields:
- actorObservationSha256 = request.actorObservationSha256 (driver attempt binding);
- actorInputSha256 = evidenceBundleSha256(actorInput) (actual worker-input binding).

The driver now passes the exact JSON-safe actorObservation object + digest on both root and prompt requests. Use that supplied object as the observation passed to session.decide(), verify its digest before any worker call, and put it in trace.actorInput. Add the explicit actorObservationSha256 field to the worker trace. Main acceptance now independently recomputes actorInputSha256 and checks both fields equal the driver hash for the current exact-object design; this makes the equivalence explicit rather than implicit.

Add a distinctive-object test proving the worker receives the supplied object (not a second native.observe result) and a mismatch test failing before session.decide().
