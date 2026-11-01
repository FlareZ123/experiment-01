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

Research-owned reproduction files: `simulation/twinleaf/agent4-rank31-alakazam-movesource-native.cjs` and `tests/agent4-rank31-alakazam-movesource-native.test.cjs`. A **separate opt-in guard** for this exact printed Ability is under test in `simulation/twinleaf/agent4-painful-spoons-single-source-hook.cjs`. Its correctness is a separate claim, awaiting confirmed green native tests.

## Competitive limitation and impact

This staged violation can pool counters across separate damaged source Pokémon when printed paper rules cannot. That can change whether a specific target crosses a KO boundary; **no actual prize change, source-dealt rank31 Ability exposure rate, or match winner change is established here**. The strong paper prompt qualification gate is still needed across all families. The unchanged 60-card benchmark remains at **29/32 authenticated exact opposing lists**, **zero competitively qualified games** and no observed 99.5% field rate.
