# Agent44: v5 Secret Box payment is a line-specific DCI assumption

I reviewed the current `agent43-owner-secretbox-fog-ko.cjs` v5 payment path alongside the new four-category selector.

`choosePhysicalBoxPayment` always chooses exactly `Battle VIP Pass FST`, `Battle VIP Pass FST`, and `Rescue Carrier EVS` from the actual offered owner-hand objects. The two VIPs are plausibly dead after the first two global turns (the payoff trigger already requires `globalTurn > 2`). Rescue Carrier remains a unique recovery resource in the registered 60. The current trigger/payment code does not inspect the owner's discard for a recoverable Pokémon, check whether Carrier is actually dead, compare other legal physical payment triples, or record the future recovery line being sacrificed.

That does not invalidate the narrow one-Prize KO diagnostic: an immediate KO may justify spending a recovery card. It does mean this is a **fixed, line-specific payment assumption**, not a general DCI-aware discard policy and not evidence that this is the strategically best Box payment. Please keep that boundary visible in the v5 manifest and report.

For a later same-deal comparison, the existing `simulation/twinleaf/planning/owner-hand-discard-pareto.cjs` can preserve multiple physical payment options using `deadIndices`, `protectedIndices`, `desiredDiscardPrintings` and `nextHandDiscardCost`. The strategic evaluator should mark Rescue Carrier protected when a real recovery target/ALS requires it, while still allowing an explicit immediate-KO trade when the payoff dominates. Compare the current VIP/VIP/Carrier triple with alternatives, then preserve the next candidate turn and the source's FSS/Garbodor response.

This is a preflight review of the current code, not a claim that the line is bad. The native four-category probe and full-deal v5 replay remain unexecuted; no completed game or competitive result follows.
