# Agent 4: rank31 Radiant Alakazam SIT59 Painful Spoons accepts printed-illegal two-source movement in native Store

**1 November 2026 | actual pinned native Store, authenticated original rank31 printing | staged conditional board, not a source-dealt competitive match**

## Exact paper-vs-code discrepancy

The authenticated original **rank31 Dusknoir/Chimecho** Aichi 2026 source 60 in `results/aichi-2026/full-decklists.json` contains one **Radiant Alakazam SIT59**. Its printed *Painful Spoons* Ability reads: once per turn, move up to **two damage counters from one of the opponent's Pokémon to another**. Thus a legal two-counter movement must have **one source Pokémon** with two existing counters; it cannot aggregate one counter from each of two opponents into one destination.

Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, file `ptcg-server/src/sets/09-sword-and-shield/set-silver-tempest/radiant-alakazam.ts`, creates `MoveDamagePrompt` with `min:1,max:2,allowCancel:false,singleDestinationTarget:true`. It **does not set** `singleSourceTarget:true`, so `MoveDamagePrompt` defaults that restriction to **false**; the native validator accepts two different sources. Native `Store.reducePrompt` does not invoke `prompt.validate` as a universal gate.

## Actual pinned Store reproduction

Staged exact SIT59 on its owner's Active board and three opposing CRE74 Basic Pokémon: opposing Active initially carries **10 damage**, opponent Bench slot0 carries **10 damage**, and opponent Bench slot1 is **undamaged**. Genuine `UseAbilityAction('Painful Spoons')` first issued an animation `WaitPrompt`, which was resolved as a real native `ResolvePromptAction(null)`. The next **genuine Store-created `MoveDamagePrompt`** accepted the two-transfer response:

- One counter: opposing Active to opposing Bench1.
- One counter: opposing Bench0 to opposing Bench1.

The native `prompt.validate` returned **true**; the live native Store accepted the result and settled it without error, leaving **0** on opposing Active, **0** on opposing Bench0 and **20** on opposing Bench1. It physically moved two real counters, violating the printed **one source** identity constraint.

The full native original-Store reproduction and original rank31 printed-roster witness passed **2/2 tests** in [manual CI 41325406843](https://github.com/FlareZ123/experiment-01/actions/runs/41325406843), which also passed the entire existing native-attachment-probe workflow. No upstream simulator edits were made.

Research-owned reproduction files: `simulation/twinleaf/agent4-rank31-alakazam-movesource-native.cjs` and `tests/agent4-rank31-alakazam-movesource-native.test.cjs`. An **opt-in, synchronous reversible** research-owned guard for this exact SIT59 Ability is implemented at `simulation/twinleaf/agent4-painful-spoons-single-source-hook.cjs`. It captures native `MoveDamagePrompt` instances created by Painful Spoons, marks `singleSourceTarget:true`, and preflights only those actual prompt replies for physically occupied opponent source/destination identity, source/destination distinctness, one source, one destination, the printed 1–2 counter bound, available source damage, and actual native validator acceptance. A rejected illegal two-source reply leaves the native pending prompt and physical counters unchanged; a legal reply moving two counters from one source with 20 damage succeeds, leaving the other source unaffected. The synchronous prototype override restores both the pinned card reducer and Store dispatch after completion or exception. It has no automatic integration with the frozen bilateral profile.

The **latest full native workflow [CI 41325758993](https://github.com/FlareZ123/experiment-01/actions/runs/41325758993) succeeded**, with **5/5 exact SIT59 native tests** and **6/6 CRE74 Astral Barrage native tests** passing; the existing Agent14 native retaliation/energy decision tests also passed. The five SIT59 tests cover published print validation, original illegal native receipt, guarded rejection, valid one-source transfer, and synchronous reversible restoration. The earlier CI 41325406843 independently first reproduced the original two-source native acceptance and had the whole original native workflow green. Both use the pinned original engine revision.

## Actual native Prize consequence in a conditional prepared state

The same pinned fixture was extended with **opponent Bench1 carrying 190 damage on a genuine 210-HP Shadow Rider Calyrex V CRE**, while opposing Active and Bench0 carried one existing 10-damage counter each. In an otherwise identical genuine native `UseAbilityAction('Painful Spoons')` and subsequent `MoveDamagePrompt`, the **original accepted two-source reply** consolidated both counters onto Bench1. The native Store Knocked Out that V, physically moved it to the opponent's discard, triggered the genuine `ChoosePrizePrompt`, and the ability user took **two actual Prize cards** (6 to 4). Under the research-owned source-identity paper guard, the identical reply was rejected before mutation: no Knock Out, zero Prize cards taken (6 remain), both original source counters remain. This demonstrates a **conditional two-Prize inflation possibility** from the original paper-invalid implementation.

This is a prepared conditional 210-HP V board, no original source-dealt turn or opponent policy, and an eligible single-source legal move after one source holds two counters could legitimately produce a different result. The paired counterfactual isolates the **invalid particular reply** rather than proving that all winning native lines rely on invalid moves.

**Pinned manual [CI 41326181218](https://github.com/FlareZ123/experiment-01/actions/runs/41326181218) completed SUCCESS**, extending the SIT59 native suite to **6/6** including actual Knock Out/Prize consequences; the independent CRE74 6/6 and previously repaired Agent14 2/2 suites also passed. Precise reproducible native code: `probeTwoSourcePrizeInflation` in `simulation/twinleaf/agent4-rank31-alakazam-movesource-native.cjs`, tested by `tests/agent4-rank31-alakazam-movesource-native.test.cjs`. Do not interpret this conditional prize count as a 32-field win rate.

## Competitive limitation and impact

This staged violation can pool counters across separate damaged source Pokémon when printed paper rules cannot. That can change whether a specific target crosses a KO boundary; **no actual prize change, source-dealt rank31 Ability exposure rate, or match winner change is established here**. The strong paper prompt qualification gate is still needed across all families. The unchanged 60-card benchmark remains at **29/32 authenticated exact opposing lists**, **zero competitively qualified games** and no observed 99.5% field rate.
