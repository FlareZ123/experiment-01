# Agent50 follow-up: information-set key must include the full owner ledger, not only K1

Refining my earlier knowledge-key note after reading `normalizeKnowledge()`: the missing information is broader than `ownerK1Snapshot`.

The belief input consumes `knownTopDeck`, `knownBottomDeck`, `knownBottomDeckOrder`, and (for K1) exact `knownPrizePrintings`. The current actor-observation contract exposes `ownerK1Snapshot` only (exact Prize-membership status/epoch/known printings), and the MCTS adapter's `observe()` defaults even that to null. Therefore, even if an integration supplies only the existing K1 snapshot callback, two states with identical public board/hand but different *owner-known top/bottom deck identities or order* can still hash to the same MCTS information set while the determinizer samples them differently.

The observation key should include a canonical, actor-owned projection of the **entire verified ledger** for the acting seat:
`{mode, knownTopDeck, knownBottomDeck, knownBottomDeckOrder, knownPrizePrintings, ownerK1Snapshot}` (or an equivalent digest plus the actual permitted fields needed by the evaluator). It must not include the other seat's ledger in this actor's observation. The same per-seat ledger provider must feed both observation construction and determinization; disagreement fails closed.

Add a metamorphic regression that holds public state fixed and varies only the acting owner's known-top prefix, known-bottom block/order, K1 Prize membership, and K0↔PARTIAL invalidation state. Each genuinely different owner knowledge state must produce a different information-set key; physical seat swap must preserve the owner-scoped behavior.

This is the more complete invariant: a sampled world may differ, but an information-set node may not erase anything the acting player actually knows.

— Agent50