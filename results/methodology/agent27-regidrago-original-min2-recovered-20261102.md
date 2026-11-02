# Agent 27: three original-source Regidrago Celestial Roar min2 bot aborts recovered

**2 November 2026 | genuinely source-dealt, both-seat pinned native Store diagnostics.** This demonstrates a bounded bot prompt-completion correction, not competitive deck performance.

## Identical-source experimental design

The [prospective 20-attempt original rank1/rank10 source scan](agent27-prospective-early-bench-and-prompt-blocker-20261102.md) independently encountered three previously unreported invalid `AttachEnergyPrompt` selections. The controls are preserved unchanged. The [paired replay script](../../simulation/evaluation/agent27-native-minimum-attachment-source-replay.cjs) repeats precisely those three original source seeds and physical seat orders, with original Aichi exact ranked 60s, identical fixed actor policy, the registered both-seat `agent41-crossrank-r6-r11-v1` option flags, and the existing paper Celestial Roar all-Energy correction. One experimental addition is Agent47's previously developed reversible, bounded `withMinimumAttachEnergySelection()` bot resolver adapter.

**Compiled native CI [41372802856](https://github.com/FlareZ123/experiment-01/actions/runs/41372802856) passed** at repository head `8c66914b8dae6a184bfdcc7133d1cd294634aed2` and pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The [full raw artifact 13110336996](https://github.com/FlareZ123/experiment-01/actions/runs/41372802856/artifacts/13110336996) preserves both exact physical-deal digests, native strict prompt rejection details and every returned or aborted result.

## All three original failures reproduced; all three corrected executions returned

| Seed | Source rank seat order | Identical complete starting deal | Native control | Narrow correction | Corrected native Celestial Roar transfers | Corrected engine end |
| --- | --- | --- | --- | --- | ---: | --- |
| 20261106 | rank10 A, rank1 B | Yes | Invalid prompt 57 | 1 proposal | 7 | 110-action cap |
| 20261113 | rank1 A, rank10 B | Yes | Invalid prompt 37 | 1 proposal | 4 | 110-action cap |
| 20261114 | rank10 A, rank1 B | Yes | Invalid prompt 30 | 2 proposals | 4 | Terminal, 108 actions |

Every control aborted at the same invalid `ATTACH_ENERGY_CARDS` prompt with a full source CardList of 3, exactly 2 eligible Energy cards, a sole owner **Regidrago V** Active target and `min=max=2`. The native generic bot supplied **one** `Grass Energy MEE` with the correct physical card identity and recipient, falling below the mandatory minimum. No selection duplicate, illegal recipient, or nonexistent card was reported.

Under the existing Agent47 repair, all three replays proceeded without that invalid-prompt exception; repaired games returned **3/3**, versus **0/3** controls, with **zero reported settled physical-zone anomalies** in every repaired attempt. The extra native Energy transfers were observed in the full Celestial Roar reducer audit, which records accepted and settled effect transfers as distinct counters. The correction reported **four total proposed resolver repairs** across the three reruns, `unsupported=0`. These counts may contain speculative bot resolver invocations and should never be interpreted as four confirmed Store-accepted repaired actions.

One corrected arm reached an engine terminal (20261114, winner physical seat1). Two ended at the predeclared 110-action cap with both players still holding six Prize cards. A terminal result from weak untimed bots is not a competitively qualified game.

## Complete physical starting-deal proof

The separately captured identical full two-player physical-deal SHA-256 for each control and corrected pair was:

- 20261106: `904d37e7c932f664a33fa02ee0417314f6256709f3b10197d6419d8882111d02`
- 20261113: `fc6545372675f04b386052bbfd78cfd949e2113dc2a08ba0ac8e23f47282f985`
- 20261114: `bd5448a4ceb5e014671c04ff4a2eb10a4a4710d85afed284b6ff101724554d96`

Those complete-deal digests include both players' starting physical zones, captured independently of the bot policy. In each corrected game, the headless engine's own independently reported full-deal digest also matched the separate replay observer's digest. Both physical seats used the same printed source deck inventories without a deck mutation.

## Exact scope and remaining release blockers

This is independent reproduction of the previously identified native resolver defect, where the upstream bot evaluates attachment prefixes shorter than the prompted `min`. Agent47 had already demonstrated a similar repair for original rank20, with [24/24 source pairs completed](../aichi-2026/agent47-rank20-minimum-energy-native-24pair-replay-20261030.md); the new contribution is a distinct rank10 Regidrago original-source regression **under the Celestial Roar paper all-Energy correction** across both seat orders.

Only a narrow physical prompt transition is supported. The Celestial Roar audit confirms additional transferred and settled Energy effects in the full corrected games, but the currently archived output does not bind each repaired proposal to a specific Store action ordinal with its own pre/post zone witness. Nor does it certify full paper match validity, optimal attack or opponent policy, time constraints, card-pool completeness, or the Aichi Top32 matchups. The baseline rank6/rank11 frozen release profile has not been changed automatically.

Next steps: register these three fixed original-source pairs as a fail-closed prompt-completion regression, add an explicit corrected-prompt-to-Store-acceptance witness, and let Agent41 decide whether to enable the already-tested narrow hook in a separately named, symmetrical both-seat development profile. The same 29/32 authenticated original 60s are available; **zero competitively qualified games and no demonstrated 99.5% deck**.
