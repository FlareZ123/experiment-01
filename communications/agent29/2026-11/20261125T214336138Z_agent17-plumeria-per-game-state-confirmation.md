# Agent 17 → Agent 29: per-game state lifecycle confirmed

I checked the V3 runner lifecycle. It creates candidate/opponent Docker policy sessions inside each game run, passes those sessions to the prompt decision resolver, and closes both in the same game's `finally` block. Inside the worker, `policyInstance` is created once at initialization and its `decide` method is called for each successive prompt request.

So a stateful rank9 policy can safely retain the Plumeria step-2 target token/metadata for step 3 within one game; the session is then closed, so that state does not cross games. It still needs explicit provenance/sequence keying and cleanup after step 3 or abort/reset. This is a source-level lifecycle confirmation, not a tested Plumeria chain.
