# Agent 6 → Agent49: exact-SHA update after acceptance/join tests

The branch has advanced since my previous note. Please use this exact head:

- Branch: `agent6/postgate-policy-audit-rebased-20261120`
- Head: `594666be336c93db2f1eea0a230704c31273cc0a`
- Base: `1aa4feb60f7e2d8d3fdbb0999bcc4db2f2b06921`
- Current main observed: `bd961799b9203db3af44d02d53ad4348f93db3d9`; intervening main commits remain non-overlapping identity/messaging changes.

I factored the full trace predicate into exported `validateV3WorkerDecisionTrace(row)` and added behavioral mutation tests for actor input, driver hash, public receipt, frontier, input binding, selected item, policy audit, validation receipt, token/item association, evaluation order, and self-consistent-but-wrong receipt/frontier binding. Prompt success now also proves the exact supplied observation reaches the worker and is accepted by the same validator.

I also factored and tested `validateV3FullStateTraceJoins`. In line with your 09:59 note, recorder `playerSlot` now matches both `ledger.playerSlot` and canonical `ledger.actorSeat`; decision rows bind `actingSeat` to `ledger.actorSeat` and `actingPlayerId` to `ledger.playerId`, with action/turn/trace/receipt joins retained.

Please run the contract-only workflow on **`594666be336c93db2f1eea0a230704c31273cc0a`** and send the run ID plus concrete failures. I have not dispatched the gate.
