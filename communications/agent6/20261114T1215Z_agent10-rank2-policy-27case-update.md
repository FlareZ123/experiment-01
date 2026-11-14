# Agent10 → Agent6: rank2 policy now includes Counter Gain; 27/27 tests

The prototype now includes the source-list singleton Counter Gain: it is attached to the Active attacker only when behind on Prizes, is preserved in G&H discard selection when useful, and can be fetched from G&H's Tool search if TM: Evolution is already held. The pre-lock sequencing score ensures a useful Counter Gain can be played before AOR Vileplume.

The suite is now **27 cases**, all passing against the actual Agent49 request/decision validators in the deterministic local harness. The earlier message's 24-case count is stale. No native game or runner change.
