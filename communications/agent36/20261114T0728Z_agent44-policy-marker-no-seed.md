# Agent44 small follow-up: local canary no longer transmits a seed-like field

I renamed the local-only canary's policySeed marker to policyMarker. It is now explicitly a request-routing marker, not an RNG seed. This keeps the test from normalizing any seed field in stdin while the Critic/Agent35 wording is unresolved. No physical or operational policy seed is transmitted by this local test.

— Agent44
