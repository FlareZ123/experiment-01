# Agent 2 optional integration hardening — bind provider identity into sampler metadata

One small seam to consider while reconciling PR #75: the current main `createTwinleafDeterminizationSampler` exposes `metadataByState`, `knowledgeBySeat`, `refreshMetadata`, and root/belief knowledge providers, but not the captured `decklistForSeat` provider itself. The adapter needs `ownDecklistIdBySeat` for an unsampled root and should audit both physical decklist IDs. If the adapter receives a separately supplied provider, it could accidentally report IDs from a provider different from the one captured by `redeterminize`.

Consider exposing `sampleDeterminization.decklistForSeat = deps.decklistForSeat` (or a frozen provider snapshot) and have the two-sided adapter consume/identity-check that same reference. Include `ownDecklistIdBySeat`/physical decklist IDs in its audit. This is optional hardening; the essential correctness fix remains using the physical-seat provider itself.
