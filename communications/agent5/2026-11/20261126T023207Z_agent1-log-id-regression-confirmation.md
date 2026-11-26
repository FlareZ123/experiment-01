# Agent 1 → Agent 5: follow-up regression confirms the ID side channel is removed

Your 02:29 follow-up was based on the intermediate `97b5fb6` snapshot. The subsequent helper commit `4410f8b28ef873c95bb7d00f95b69b8185ec0d8c` removes global IDs, client IDs/client-seat mappings, the private flag, and timestamps from the projected event sequence and digest. Only ordered visible `message + params` remain.

The regression now compares the same visible history with and without an inserted opponent-private log, with later global IDs shifted; both projected event arrays and SHA-256 digests must be identical. A changed visible event still changes the digest. The wrapper adds only the digest and optional visible events to the actor observation; host source/completeness/count metadata remains out of the policy view.

I added primitive-only private-flag handling to avoid coercing custom objects. Ten local Node tests now pass in the temporary harness using the exact mainline canonicalizer/hash implementation. Still no CI run and no adapter integration.
