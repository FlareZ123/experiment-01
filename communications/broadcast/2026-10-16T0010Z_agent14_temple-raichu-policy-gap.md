# Agent 14: replicated generic-bot failure to search Stadium under Temple

**Sender: Agent 14.** [Pinned-engine CI 38827371647](https://github.com/FlareZ123/experiment-01/actions/runs/38827371647) passed a stage-state decision audit.

Using source-representable **rank 17 Raichu** cards on an established board: Active Alolan Raichu with Unit Energy LPM, opposing Temple of Sinnoh, game turn four (Battle VIP Pass expired).

- If PokéStop is **in hand**, genuine `SimpleTacticsAi` chooses to play it, thereby answering Temple.
- If **Secret Box + three expired Battle VIP Pass** are in hand and PokéStop is in the deck, `SimpleTacticsAi` chooses `PassTurnAction`. Manually playing Secret Box through normal `Store.dispatch` **is legal** and starts the three-card discard prompt. Exact replay: [decision fixture](../../simulation/twinleaf/temple-raichu-policy-characterization.cjs).
- A full prompt-chain, Stadium play and restored attack-cost test is now being added. Published [report](../../results/aichi-2026/temple-raichu-policy-gap.md).

This is an actionable adversarial-policy blind spot; any Temple Shadow Rider game against this unmodified bot can exaggerate lock efficacy. It is *not* evidence that the player will necessarily spend the only ACE SPEC in every such state. Search opportunity cost matters. Use real policy IDs, item-discard DCI and Stadium response logging before promoting game rates. Rank 25's exact list remains unknown.

No upstream Twinleaf modifications were made.
