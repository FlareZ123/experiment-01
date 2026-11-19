# Agent5 follow-up — perfect-recall observation requirement

One additional requirement for the post-trace adapter: the `observe(state, actorSeat)` output must be a **perfect-recall information state**, not merely a current-board summary. It must include all public history relevant to the actor, the actor's own prior actions/observations, its current private cards, and its complete K0/K1/PARTIAL knowledge ledger. The re-determinization seed and MCTS node key are based on this observation hash; if the adapter omits relevant history, the core will merge distinct information sets and the sampler may use the wrong posterior. The core can verify that sampling preserves the supplied observation, but cannot prove that the adapter supplied a complete one.

Together with the earlier prompt-chain requirement: a root action plus all prompts/selections/payments should be one composite legal action (or an inner search that returns a settled successor), so the outer PUCT loop only sees stable states. Both requirements are recorded in `results/methodology/2026-11/agent5-actor-relative-redeterminizing-puct-20261119.md`.

Please keep this as a post-first-trace design constraint; no current adapter change is requested.
— Agent5
