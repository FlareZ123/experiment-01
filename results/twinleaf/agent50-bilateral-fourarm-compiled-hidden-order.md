# Agent 50: compiled four-arm owner-deck-order audit, zero generic scorer exposure

**20 October 2026, 01:57 UTC.** The previously synthetic-only `agent50-bilateral-hidden-order-audit.cjs` was run against the actual pinned compiled Twinleaf source-dealt common-policy development environment via the existing manually dispatched `twinleaf-hidden-information.yml`. This is a retrospective policy-boundary diagnostic, never a prospective win-rate sample.

## Evidence and fixed conditions

- **Source and code:** Agent 50 workflow patch head [`fb5cc901b0a3d493af6b95f0c04cf94d5035b0a3`](https://github.com/FlareZ123/experiment-01/commit/fb5cc901b0a3d493af6b95f0c04cf94d5035b0a3), frozen existing Agent 41 `developmentTrials()` selected rank 6 `6:0:A` and rank 11 `11:2:B` streams for the unchanged champion reference and New Moon Lockbreaker v1 60s.
- **Compiled CI:** [run 39355698893](https://github.com/FlareZ123/experiment-01/actions/runs/39355698893), success. Pinned upstream Twinleaf submodule `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; 33/33 synthetic and observer regressions passed before actual replays. All four original games ran once as control, then once with read-only postgame probes.
- **Complete artifact:** [`agent50-live-deck-order-historical-fourarm`, artifact 12235715768](https://github.com/FlareZ123/experiment-01/actions/runs/39355698893/artifacts/12235715768), ZIP SHA-256 `142c772bc96518ebe67b4700153a94e967fafdd8248233bc49a64823f6829a94`. Includes all four raw rows, complete compared control/replay projections and the printed actual/physical/reversed action signatures.
- **Vetoes:** matched authentic actor/turn root, real source-deal digest, original root-action ledger and public end-state projections, verified starting player, and unchanged gameplay with the postgame comparison. Independent freshly rebuilt bot's actual-world action must equal the original live action; no unresolved errors were observed.

## What really happened

| Historical candidate / source pair | Owner deck cards at sampled turn-3 root | Live replay match | Fresh policy action match | Hidden-order action reversal | Tactic evaluations in each cloned world |
| --- | ---: | --- | --- | --- | ---: |
| Rank 6, champion reference | 39 | Yes | Yes | No | **0** |
| Rank 6, New Moon | 44 | Yes | Yes | No | **0** |
| Rank 11, champion reference | 45 | Yes | Yes | No | **0** |
| Rank 11, New Moon | 44 | Yes | Yes | No | **0** |

All four actual actions were `PlayCardAction` with exactly matching serialized action and target in the unchanged order and reversed-hidden-order cloned worlds. The persisted historical `classification` fields say `no-sensitivity-on-tested-root`. The **more informative underlying result is that the generic `SimpleTactic.evaluateAction` scoring hook was invoked zero times in each world at all four chosen roots**. In particular, `equalScoreTraces:true` arises from two *empty* scoring traces. This is a real negative for **those four instantaneous action signatures**, and a vacuous test of the generic scorer's hidden-information boundary. Do **not** promote it to `hiddenInformationSafe:true` or general decision independence.

The matched live-root/fresh-bot actions and unaltered Store games make it useful for checking the injection and replay controls. The zero scorer invocation also pinpoints why the original selection of the first turn-3 candidate root had low diagnostic power: at that point, a higher-priority automatic path can choose a card-play action without any speculative `SimpleTactic` scoring, so reversing unseen physical deck order may have no causal channel into that particular action.

## Next discriminating experiment

Capture a candidate owner decision **at which at least one finite generic tactic score is actually computed**, in the *same canonical runner*. Mark actual native decision, any delegated attack/prompt, source-owned K1 searches and known deck-top observations. Choose that root using a **precommitted objective selection rule** such as the first eligible owner root after turn 3 with at least one scored generic option, rather than selecting after seeing a favorable deck-order reversal. Preserve original 4-arm control/replay, earliest-root absence, all capped/failed attempts, cloned-world parity, and agent-owned published card printings. Only compare hypothetical order changes that respect legitimate owner knowledge. The current pilot cannot certify that last prerequisite; coordinate with [Agent 21's read-only actor/K1 observer](../aichi-2026/README.md) and Agent 41's main integration.

No opponent-hidden-hand, Prize, path-dependent wrapper or delegated-copy-policy boundary is certified by this test. No paper-rule or 25-minute-clock qualification. **0 competitively qualified games; 29/32 exact Aichi source lists; 99.5% remains unproven.**
