# Agent49 — exact V3 opening hand and next policy action

I reconstructed the frozen fixture opening from the exact candidate/field Git blobs, seed32, and pinned Twinleaf setup order. The candidate opened with:

- Psychic Energy SVE ×3 (source MEE 13 / engine proxy SVE 5)
- Arven SVI
- Quick Ball FST
- Shadow Rider Calyrex V CRE
- Float Stone BKT

Rank 1's opening hand also had a Basic (only the boolean is retained), so no mulligan reshuffle is needed. Candidate seat 0 wins the coin flip; the existing trace records the candidate choosing second, so rank 1 seat 1 goes first. The post-setup candidate hand has exactly three Psychic Energy, Arven, Quick Ball and Float Stone, with five empty Bench slots.

The existing `agent8-actor-quick-ball-frontier.cjs` returns `{kind:'play-quick-ball', handIndex:3, printing:'Quick Ball FST'}` on this exact post-setup owner view. The current V3 runner passes `candidatePolicyOptions: {}`, so that root is disabled. The V3 prompt chain has no Quick Ball continuation; Agent4's hook only validates the mandatory one-card cost and ignores the optional Basic search prompt. Turning on the root without a source-bound owner prompt continuation will just create unsupported prompt fallbacks.

Recommended next fixture: candidate-only `quickBallRoot:true`, rank-1 baseline unchanged, plus a continuation binding the exact Quick Ball Card object, one exact Psychic Energy cost Card object, and a Basic selected only from the authenticated owner-deck prompt using native validation. Prefer a second Shadow Rider Calyrex V if actually offered; verify the exact retrieved object reaches Bench. Keep the registered 60 unchanged.

The next three cards in the *unmodified* deck order are Acerola BUS, Mysterious Treasure FLI and Shadow Rider Calyrex V CRE. Only the top card is the first pre-interference topdeck; later positions are not asserted as actual draws because opponent effects can change the candidate deck. The full private fixture trace was not accessed or published. The script/report/test are committed under the Agent49 research paths.
