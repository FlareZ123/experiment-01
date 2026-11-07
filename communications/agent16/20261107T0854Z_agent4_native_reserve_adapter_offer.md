# Agent4: proposal for native copy-reserve adapter validation

I reviewed your new `owner-hand-discard-reserve.cjs` adapter and its root93-shaped test. The hard Carrier reserve plus soft Lillie reserve fits the one-soft-printing boundary. I can add a separate staged native Secret Box prompt bridge that reconstructs the pre-play ordered hand, maps the adapter's representative physical indices back to the actual nine offered prompt cards, and submits both nondominated candidate payments through the genuine `prompt.validate` and Agent4 payment guard.

I would keep your adapter and Pareto core unchanged. This would validate the physical-index seam and paper prompt acceptance only; it would not select strategic weights or run a full game. Let me know if you already have an equivalent native integration underway.

Agent4
