# Agent 2: coupled paid Apex Store regression and frozen historical rank-10 source pair

**17 October 2026. Evidence type: constructed genuine-engine Store prompts plus an adversarial counterexample. Qualified competitive games: zero.**

## Question and experimental distinction

Agent 37's copy-selector and six-counter allocator had individually passed compiled Store fixtures. Agent 2's joint headless installer had passed a non-Regidrago lifecycle test and a single exact rank-10 source-dealt negative-exposure comparison: neither genuine source copy prompt contained Phantom Dive. Thus the exact combination installed by `runMatch({apexSpreadPrizeWindowPolicy:true})` had not yet been proven to execute its intended two-prompt sequence under a paid Apex Dragon attack.

The new `tests/apex-coupled-paid-store.test.cjs` constructs a **genuine pinned-engine Store**, with an already-established Regidrago VSTAR SIT paying the printed GGF Apex Dragon cost, discarded Dragapult ex TWM and Hisuian Goodra VSTAR LOR, opposing Active evolved Pidgeot ex OBF, and two 30-HP Budew ASC on the opposing Bench. This is a **constructed position**, not a naturally obtained source-60 game and not a qualified competitive sample.

## Positive paired-prompt witness

The test installs both factories using the exact `installApexPrizeWindowPolicy` used by the headless flag **before constructing the SimpleTacticsAi**. It verifies both actual bot resolver instances, then dispatches a genuine `AttackAction('Apex Dragon')` into the pinned Store.

The unmodified engine copy resolver chooses Rolling Iron in the tied-200-damage prompt. The jointly installed resolver chooses Phantom Dive, and the action passes the actual prompt's `validate`. Dispatching that choice creates the engine's **real** `PutDamagePrompt` of 60, with target caps and blocked sets from the current State. The jointly installed damage resolver returns exactly 30 counters of damage to each Budew. This allocation passes `prompt.validate`, is dispatched through the real Store, and is followed by real animation and Prize-selection prompts. The test requires both exact Budew card objects in the opponent's discard and exactly two fewer Prize cards for the Regidrago player.

This establishes coupled **constructed-board prompt-to-Prize mechanics**, with no test of hidden information, a representative bot opponent, full 60-card natural setup, or opponent response.

## Adversarial fallback witness

The second test starts from the same genuine paid copy-prompt decision. It then deliberately changes the *already-created* damage prompt's two per-target maxima to 20 each. This synthetic condition leaves too little permissible allocation capacity for all six damage counters, and is **not asserted to arise naturally in this source game**. The test requires `prizeWindowDamageMap(...)` to return `null` despite the earlier successful Phantom Dive choice, and spies on the pinned generic damage resolver to verify exactly one delegation by the jointly installed resolver.

This is a sharply bounded illustration of the Agent 37 warning: a copy-selection opportunity does not guarantee the downstream custom allocator can execute. It does not certify the quality of generic fallback play in real matches.

## Compiled evidence and archival replay isolation

- New [coupled Store test](../../tests/apex-coupled-paid-store.test.cjs) added to the existing [manual-only Aichi policy workflow](../../.github/workflows/aichi-attack-pass-score.yml).
- [Manual compiled run 39037625736](https://github.com/FlareZ123/experiment-01/actions/runs/39037625736) head `2f4ae8ab679ad1c006eb2d4f02971a3b47f405ed`: the **test stage and entire manual workflow passed**, including this new file. This validates the constructed paid-prompt and fallback tests at the specified immutable head.
- Existing [rank-10 joint Apex source pair](../../simulation/twinleaf/rank10-apex-prize-source-pair.cjs) now explicitly requests `doubleDragonRecovery:true, doubleDragonArchiveV3:true`, asserts the archive flag on the source control result and labels the output `DoubleDragonAttachTactic-v3-archive`. This is necessary because current DDE v4 makes the rank-10 game diverge on source turn 2 and end on turn 16 rather than preserving its historical turn-26/28 no-Phantom-Dive observation. See [Agent 8's paired trajectory audit](../aichi-2026/agent8-rank10-dde-v4-trajectory-differential.md).
- The archived v3 policy deliberately retains the historical cross-clone card-reference mistake. The old negative-exposure result is scientifically useful **only as an archived policy**, never as current-v4 performance evidence. Re-execution of this newly frozen source script remains a separate validation requirement until manual CI explicitly verifies its current-head output.

## Current-v4 source-60 exposure screening\n\nAdded [rank-15 Regidrago screen](../../simulation/twinleaf/rank15-regidrago-spread-exposure.cjs), a separate **current-v4**, default-off paired comparison against the exact rank-15 Lopunny/Vileplume 60. It uses two fixed seeds, both Regidrago physical slots (four paired controls, eight total games), up to 280 actions per match, and the existing source-root-only prompt observer. Each pair requires identical deck hashes, complete initial source hand/deck/Prize-zone digest, and authenticated actual first player. It records source copy and damage selections and the first root-action difference. It has **not yet been compiled or run**; no outcome or opportunity has been observed. It is callable only through the new `apex_rank15_screen` flag of the existing manual-only workflow, and cannot change the archived v3 rank-10 comparison.\n\n## Next work

Find an *authentic, fixed-60-card source-dealt* rank-10 or other Aichi opponent trajectory where Regidrago has discarded Dragapult ex, a 1-60HP eligible Bench target, and Rolling Iron is the baseline chosen copy. Record both real prompts, source-state noninterference, all opponent replies, hidden-information-safe choices and the true starting player. A positive constructed Store fixture by itself cannot promote an opponent matchup or infer win probability.
