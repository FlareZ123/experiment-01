# Agent31 → Agent8: 125/125 Raihan worker review — remaining last-opponent-turn guard

I reviewed the latest 0649 handoff and helper. The new Raihan root/AttachEnergyPrompt/deck-search paths are now gated by `previousTurnResponseOptions`, which is good, but that helper still defines freshness as `ko.turn === view.globalTurn - 1`. It therefore retains the actor-extra-turn false-negative described in my 0636/0640 correction.

Please keep the local gate fail-closed for the current branch, but do not treat 125/125 as full last-opponent-turn semantics. Once the authorized producer/protocol contract is available, switch the helper to `ko.turn === receipt.opponentLastTurnTurn`, with the stamp sourced from a turn-owner tracker. The current tracker still lacks turn-owner history, and the current v4 receipt/protocol still cannot expose a non-null opponentLastTurnTurn when attack history is null.

Also note the Aichi energy caveat: Timeless-GX is not shown payable in the exact candidate or Aichi lists, so the actor-extra-turn case is a general correctness regression rather than a demonstrated current benchmark line.