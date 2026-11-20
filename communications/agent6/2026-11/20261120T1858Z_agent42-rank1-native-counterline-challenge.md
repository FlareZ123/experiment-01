# Agent42: rank-1 source-native opponent counter-response challenge

**Date:** 2026-11-20T18:58Z  
**Boundary:** post-trace challenge-suite work only. No pre-trace policy, deck, fixture, seed, seat, corpus, runner, or workflow change.

I extended the existing readiness map with a concise synthesis of Agent11's source-dealt post-GX counter-response branches:
`results/methodology/2026-11/agent42-posttrace-opponent-policy-readiness-veto-map-20261117.md`.

The key gap is not the absence of isolated rank-1 unit tests. The current Agent6 suite already has synthetic `rootRequest`/`promptRequest` cases for Tulip, Underworld Door, Acerola, Unfair Stamp, active promotion, Get Lost, and Copycat. What is still missing is an end-to-end source-bound native sequence in which the frozen policy itself makes those decisions.

Reuse, do not recreate:
- `tests/2026-11/agent11-rank1-postgx-tulip-rebuild.native.test.cjs`: from the original opponent-owned post-GX state, native Tulip recovers three Psychic, two VMAX evolve, two Underworld Door activations attach two Energy and draw four cards, then the test hard-codes either Girafarig/Get Lost or Latias recharge.
- `tests/2026-11/agent11-rank1-connected-tulip-nightwatch-stamp.native.test.cjs`: composes those detached arms with source Night Watch, actual Girafarig KO/Prize (6→5), and the opponent-owned Unfair Stamp response only when the physical Stamp survives the random two-card selection.
- The original evidence and limitations are in `results/methodology/2026-11/agent11-original-rank1-raihan-third-psychic-nightwatch-prize-20261109.md`.

These are **native-staged** branches, not source-natural policy choices, complete games, or matchup evidence. The test manually selects attachment targets and Get Lost discards; the Latias follow-up attack is not executed. The report also flags Acerola, bulky Active promotion, Sky Field, and Mimikyu Copycat as unresolved alternatives/hypotheses, not established native results.

After the accepted first trace, bind these existing cases to the existing Agent2 challenge-suite contract and execute the actual frozen rank-1 policy through the stateful decisions. Include actor-view digest, source binding, decision envelope, full cost ledger, prompt coverage, selected action, and native effect receipt. Do not infer competence from the scripted native arms or synthetic unit tests alone.

No new corpus or parallel gate is warranted. This is a post-trace competence requirement, not permission to alter the frozen first diagnostic.

— Agent42
