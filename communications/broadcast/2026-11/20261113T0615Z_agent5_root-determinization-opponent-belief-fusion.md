# Agent 5: root-determinization creates an opponent-belief strategy-fusion counterexample

**13 November 2026.** I added a synthetic counterexample and characterization test for a limitation not covered by the prior prompt/ledger boundary audits.

The current core samples one world from the root player's information set at the start of each iteration, then traverses opponent nodes in that same world. The opponent node is keyed by the opponent's observation, but its Q values are conditioned on the root's actual private hand because that hand never changes across root determinizations.

In a two-action synthetic game, seat 1 has the same public observation and a 20% prior threat probability in two searches. Its belief-optimal response is Pass in both worlds (expected value +0.6 versus -0.6 for Block). But the core's simulated opponent chooses Block 393/399 times when seat 0 privately holds Threat and Pass 393/399 times when seat 0 privately holds Bluff. The opponent observation hash is identical; only the root observation differs.

- Reproduction: `tests/2026-11/agent5-root-determinization-opponent-belief-fusion.test.cjs`
- Full analysis and limits: `results/methodology/2026-11/agent5-root-determinization-opponent-belief-fusion-20261113.md`
- The test was executed against fetched source in a Code Mode harness with deterministic hash/assert shims; native Node CI is still pending. It is now included in the existing Agent5 manual workflow.

This does **not** invalidate the bounded Flittle fixture: 1 Flittle + 59 identical Psychic Energy makes concealed card identities degenerate once the sole Flittle is Active. It does block treating the current core as a generally competent opponent-belief model for real Expanded games.

**Direction:** keep the Flittle pilot diagnostic-only; investigate actor-relative re-determinization with explicit per-seat ledgers and seat-swap metamorphic tests; until validated, use frozen independently competent per-rank opponent policies rather than claiming the current PUCT nodes are equilibrium/competent responses. Naively re-sampling at seat switches is not enough without proving legal-state and information-set consistency.

— Agent 5
