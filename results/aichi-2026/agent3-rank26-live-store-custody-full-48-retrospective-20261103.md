# Rank-26 Battle Compressor: full original-source live Store provenance replication

**Agent 3 | 3 November 2026 | pinned native historical replay; no competitively qualified games**

## Finding

The previously published rank-26 first-turn Battle Compressor movement census used a broad `Store.prototype.dispatch` observer. Twinleaf's bot creates speculative Stores when evaluating hypothetical choices. The old observer also counted those cloned game states as successful deck-to-discard movements. Its causal interpretation is invalid.

We executed a new **24-original-deal, 48-native-arm retrospective replay** of the same historical baseline and treatment source policies, now with both observers operating together. For each pair the physical native initial-deal fingerprint matched exactly. There were **24/24 identical physical starting deals**, **zero execution errors** and **14 source-first physical deal groups**.

| Count in the 14 source-first deal groups | Baseline | Treatment |
| --- | ---: | ---: |
| Actually selected first-turn source Battle Compressor card plays | 0 | 9 |
| Old broad observer positive receipts across the full replayed game traces | 225 | 77 |
| Corrected live-root observer accepted source Battle Compressor settlements across those traces | **0** | **9** |

Across all **48 arms**, the corrected observer excluded **35,882 speculative Store dispatches**. The difference between the observers is direct evidence that the old broad movement counter was contaminated by hypothetical gameplay branches. The old 225/77 counts span *whole game traces*, whereas the historical [21 orphan baseline first-turn receipts](agent3-rank26-compressor-receipt-lineage-audit-20261102.md) were filtered to global turn one. These differently scoped counters must not be directly equated.

The nine genuine treatment settlements occurred on **eight distinct source-first physical deal groups**. Each was linked by physical card identity to a source-owned accepted Battle Compressor `PlayCardAction`, its newly issued unresolved own-deck prompt, and actual own-deck-to-discard card movements at the root Store. In source seat B / repeat 72, the baseline selected Escape Rope and **zero** Compressor, while the treatment played one Compressor and moved two actual Lightning Energy cards plus one Exeggcute to discard. On repeat 73 seat B, two treatment Compressed prompts settled: first Lightning Energy plus Exeggcute, and second another Battle Compressor card. All three detailed groups independently passed their historical original-source physical fingerprints.

## Reproducibility

- Full compiled [GitHub Actions run 41597259324](https://github.com/FlareZ123/experiment-01/actions/runs/41597259324), successful. Registered source head: `268068a55bdf3061970c18bb859bb303eae52c9e`.
- [All 48 archived native attempts, artifact 13213570265](https://github.com/FlareZ123/experiment-01/actions/runs/41597259324/artifacts/13213570265), ZIP SHA256 `deeac9297b1bd82d6acd75db3bf273c337ecb8d4d1c5f3e823ac2984c4a5e112`.
- Pinned Twinleaf submodule `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- [Reproduction script](../../simulation/twinleaf/agent3-rank26-compressor-v3-full-retrospective.cjs), [root-bound observation implementation](../../simulation/twinleaf/agent3-compressor-root-provenance-v3.cjs), [original broad observer](../../simulation/twinleaf/agent3-compressor-discard-settlement.cjs). Manual workflow `.github/workflows/agent3-paper-counterfactual-smoke.yml`, opt-in `rank26_full_v3_native`. The full run passed its two then-current pure observer tests; a third clone-differential regression committed afterward has not yet been executed in CI.
- Original source: rank 26 (Hibiki Yamada, Meloetta Donk); authentic opponent: rank 6 (Iron Thorns); two unchanged 60s. Replay seeds derive from `20261106`, repeats 72–83, physical seats A and B, max 120 native actions per attempt. Source decisions and policies are the historical frozen baseline versus opt-in source setup. Prior-art anomaly and causal source code: [archived contradiction](agent3-rank26-compressor-receipt-lineage-audit-20261102.md), [speculative simulator mechanism](agent3-rank26-speculative-store-receipt-mechanism-20261102.md).

## Interpretation and limits

This is a **retrospective replay of previously selected physical deals** with an improved observer, not 48 newly independent competitive games or a prospective field test. The verified native card objects moved in selected prompts. The work does not certify all paper card effects, source policy competence beyond these actions, attachment/payment-to-attack chains, outcome-clock fidelity, opponent choices or actual game wins. No valid claim that the treatment improves winning performance follows from its nine genuine Battle Compressor plays.

**Project status remains 29/32 original registered 60s authenticated, ranks 23/25/28 missing; zero competitively qualified games; no established fixed strongest deck or 99.5% win rate.**
