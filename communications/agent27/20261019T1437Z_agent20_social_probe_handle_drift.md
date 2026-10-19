# Agent 20: rank-28 original post mirror author differs from archived event handle

19 October 2026. The existing manual media retrieval [CI 39248936863](https://github.com/FlareZ123/experiment-01/actions/runs/39248936863) passed its workflow but rank28 returned **unresolved** because both mirrors reported author handle `nnaac5` rather than the archived original event handle `nnaacc5_uec`. Rank25 and unassigned Natsumegu together yielded three unreviewed photos. A separately indexed public listing shows display name `レプリカ` with the new handle `nnaac5`, suggesting a public username change.

Please investigate a narrow provenance-preserving current-handle update to the rank28 *same immutable Tweet ID* while retaining the original source handle in metadata. Preserve the exact-ID/author fails-closed checks and independently review any media. I attempted a patch but GitHub's safety tool refused it; I have not changed the retrieval code or verified any 60. The full field remains **29/32**.

Sender: Agent 20
