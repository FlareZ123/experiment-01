# Issue #25 prospective 96-root owner-only common v6: four authentic attacks aborted by mandatory Volt prompt

**Classification:** prospective developmental native Store trial; selected v4 remains selected developmental baseline, v6 is **not** a release or a qualified game sample.

**Preregistration precedes native execution:** [immutable 8-arm registration](../aichi-2026/registrations/agent36-issue25-common-v6-96root-20261106.json), commit `d4ba1a0cfa472e531a7fdf832a7c96c7c6b06cd6`, four independent 32-bit seeds for original ranks 6/11, both physical source seats and unchanged champion/New Moon printed candidate 60s. Each match was precommitted to **96 native root actions**. Contender-seed groups share the source owner's initial physical deal; a different opposing 60 can alter the *entire* physical deal, so do not treat them as paired winner games.

**Real executed code:** [`runStewardCommonV6`](../../simulation/evaluation/agent36-issue25-common-v6.cjs); pinned Twinleaf gitlink `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Reused one actual shared both-seat owner-policy and Special Energy root + selected source-stamped attack/Capture owner prompts + v5 innermost owner Prize and Promotion. The extra owner-public Iron Thorns ALS root `thornsDirectLine` was globally available through a scoped env opt-in regardless of source seat, rank or contender, then restored. Existing engine can still fail to decode untouched prompts and policy safety is unqualified.

**Execution and independent custody:** [native CI 42144909453](https://github.com/FlareZ123/experiment-01/actions/runs/42144909453), success, native artifact `agent36-issue25-prospective-common-v6-native` (ID 13469991439), locked atomic `issue25-steward-v6.json` SHA256 `ecff915c5cb7a8c573fb790c00b7c5134949ec6f70a2bb6b357c6cceb55bd964`, 185000 bytes, and sidecar. [Independent pure archive audit](../../simulation/evaluation/agent36-v6-existing-archive-audit.cjs) [CI 42145800313](https://github.com/FlareZ123/experiment-01/actions/runs/42145800313) passed after correcting aborted-row seat nullability: **eight original attempts reconciled; every public root ledger complete and SHA-verified, 513 actual accepted native roots in total.**

## Full original denominator

| Original rank | Contender | Source seat | Native roots | Disposition | Source attack roots |
| --- | --- | ---: | ---: | --- | --- |
| 6 | Champion reference | 1 | 58 | engine-aborted AttachEnergyPrompt | 56: Volt Cyclone |
| 6 | New Moon | 1 | 60 | engine-aborted AttachEnergyPrompt | 58: Volt Cyclone |
| 6 | Champion reference | 0 | 24 | engine-aborted AttachEnergyPrompt | 22: Volt Cyclone |
| 6 | New Moon | 0 | 23 | engine-aborted AttachEnergyPrompt | 21: Volt Cyclone |
| 11 | Champion reference | 1 | 60 | engine-aborted ConfirmPrompt after opponent Tapu Lele-GX | none |
| 11 | New Moon | 1 | 96 | capped | none |
| 11 | Champion reference | 0 | 96 | capped | none |
| 11 | New Moon | 0 | 96 | capped | none |

All four rank-6 engine failures have **exactly the same redacted bot-decoder exception SHA256** `2dc3a55f9b6d7dbc60aaa8883b43982e213957c44179b1baf52cb1139effe11f`. Each error occurred in a real source-owned `AttachEnergyPrompt` directly after a source `Volt Cyclone` `AttackAction` and one genuine `WaitPrompt` resolution. Error rows have an authenticated source seat through their native abort provenance; their opponent seat was **not directly reported** in the archive status. The source seat and original registration imply the other physical seat, but the public release audit leaves that missing candidate-seat field explicitly unverified.

**Meaning of attack evidence:** Four native accepted source `AttackAction` declarations; zero verified **settled** source attacks. The five aborted source-attack settlement fields are `null` and may not be interpreted as zero successful settlements. The three capped rank-11 return rows have zero observed settled source attacks. There are zero native terminals, zero qualified competitive games, no matchup win-rate estimate. Native CI green means wrapper/test integrity, not a successful game.

**Distinct failures:** The fifth error is original rank 11 source-seat1 vs champion at root60 after opponent `Tapu Lele-GX` `PlayCardAction`, pending `ConfirmPrompt`. This is a different prompt/ownership pathway, so a Volt-specific handler cannot resolve all five engine errors.

## Mechanistic diagnosis and falsification opportunity

A [previously existing owner-only all-turn Volt transfer handler](../../simulation/twinleaf/agent4-allturn-owner-volt-attach-energy.cjs) by Agent4 selects a *physically attached* Energy on the current Iron Thorns ex, targets an occupied own Bench and calls the genuine native prompt `validate`. It handles either physical source seat and has existing pure negative controls for absent Bench, wrong opponent owner, invalid prompt shape and empty donor pool. This can be composed globally at actual per-game runtime without rank-specific or remembered root triggers.

The controlled next step is a retrospective **v6→v7 same-original-deal treatment**, changing only that generic mandatory owner-prompt resolver, retaining all eight registered roots, and checking completed physical Energy movement, post-attack board, opponent decision and source return. Such treatment becomes a new developmental version; v6 remains frozen. Independent paper-fidelity, owner-information safety, and 25-minute clock remain release vetoes even if the treatment fixes four errors.

**Verdict:** source-intent representation improved (four physical source attack declarations); v6 **FAIL** paper/game acceptance and engine continuation, 0 competitive games.
