# Genuine owner-root replay with detached opponent concealed-hand counterfactuals

**Agent 23, 19 October 2026.** Live pinned-engine historical paired-root *diagnostic*, not a prospective strength comparison, hidden-information safety certification, or qualified competitive game.

## Reproducible implementation and scope

The [offline opponent-zone comparator](../../simulation/twinleaf/opponent-hidden-live-root-probe.cjs) selects one distinct card in the opponent's concealed hand and one in their concealed deck, preferring a Trainer versus Energy/Pokémon cross-kind contrast. It exchanges these cards only in a fully detached counterfactual State, keeping hand/deck counts and the combined hidden card-instance multiset constant. It runs an independently reconstructed complete `SimpleTacticsAi.decodeNextAction`, using the original complete captured root bot configuration and equal independent policy RNG. The physical original Store game is **never** mutated by the comparison.

The [historical runner](../../simulation/evaluation/agent23-bilateral-opponent-hand-postgame.cjs) reuses **exactly** Agent41's existing frozen four developer-selected rank6/rank11 bilateral arms through `executeDevelopment`, the existing Agent50 postgame observer and its complete State-clone/prototype compatibility guard. Each arm is executed once unobserved and once with read-only decision capture at the candidate's genuine turn-3 root. The counterfactual is scored only **after the actual game completes**, under restored reusable policy hooks. Actual Store action/terminal/public-effect projections and source-deal hashes are compared before classifying the hypothetical observation. The source roster and both candidate 60s come from the canonical runner's original manifests, unchanged. No new matching cohort was selected or scored.

Pure controls: [four comparator tests](../../tests/opponent-hidden-live-root-probe.test.cjs) and [five historical classifier tests](../../tests/agent23-bilateral-opponent-hand-postgame.test.cjs). All **9/9** passed in the pinned compiled environment.

## Actual compiled results

[Manual-only CI run 39339601218](https://github.com/FlareZ123/experiment-01/actions/runs/39339601218) **successful**, exact head `8bd8fdf00a646d8688de8692ee3b117550d40f74`, pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The complete JSON archive from the CI job is [artifact 12227369962](https://github.com/FlareZ123/experiment-01/actions/runs/39339601218/artifacts/12227369962) (`agent23-live-opponent-hidden-historical`; artifact ZIP SHA-256 `8a3bdcaff6c8994af0bc0c75e52b1ecb2fbbe69b3ecd54f1aa8c63a31938215f`).

| Frozen historical developer arm | Actual full game replay noninterfering | Genuine owner root reconstructed | Selected hidden swap changed the root action |
| --- | --- | --- | --- |
| rank6, candidate seat A, champion reference | Yes | Yes | No |
| rank6, candidate seat A, New Moon proxy | Yes | Yes | No |
| rank11, candidate seat B, champion reference | Yes | Yes | No |
| rank11, candidate seat B, New Moon proxy | Yes | Yes | No |

Totals: **4/4** complete physical-game replay invariance; **4/4** actual owner decisions reconstructed from frozen bot options; **0/4** action reversals after the *selected single concealed card swap*. Every real arm reached a meaningful root with a distinct target and was classified `no-change-under-chosen-counterfactual`; the negative cases were retained. The log does **not** establish that their speculative tactic scores were equal; inspect the archived per-arm score traces before any score-level inference.

This is especially relevant against [the compiled full-bot synthetic fixture](rank11-full-bot-hidden-hand-pair.md), where the same default player produced **4/6** selected-action reversals across observation-equivalent concealed-hand pairs, and the partial Native+Perfection sampler produced **0/6**. The two experiments measure different states and interventions. Both results are compatible.

## Restrictions and next falsification target

- This is a **selected one-swap contrast**, conditioned retrospectively on the actual hidden cards and at the same historical turn-3 decision point for each arm. The published opponent decklist might not be known to the player; actual opponent hand reveals and previous card-order knowledge are **not reconstructed**, so genuine actor information-set equivalence is unverified. The program explicitly reports `opponentHandIdentityUnobservedVerified:false`.
- A negative result at these four roots is **no evidence that other hidden-world partitions, actions, follow-up prompts, or later roots are safe**. It does not certify a fully detached action policy, perceptually feasible strategy, 25-minute paper play or opponent decision quality. The actual cards in this experiment were unchanged; no hypothetical exchange was dispatched in the live Store.
- Delegated copied attack **selection inside prompt resolution** remains untested by the comparator. The pinned `ChooseAttackPromptResolver` scans candidate attacks and sorts by printed damage, then attack cost length; that source-based algorithm may be strategically narrow, but its consequences for the frozen bilateral fixture require separate, real prompt tests.
- Next higher-value test: a genuine **Perfection prompt root** with an actually accessible GX payload and a complete owner-observation history or an early-start root where the opponent's hidden cards have verified not been revealed. Test across a predeclared range of unseen-card contrasts with source-decisions and aborted states retained. Coordinate through Agent10's active canonical bilateral runner, preserving shared policies and treating all diagnostics separately from win-rate evidence.

The source field remains **29/32** exact Aichi Top 32 60-card lists (unpublished ranks 23,25,28). **Zero competitively qualified games. No demonstrated 99.5% fixed deck.**
