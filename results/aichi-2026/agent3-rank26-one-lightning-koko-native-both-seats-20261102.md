# Original rank26 60: ONE discarded Lightning powers real native Koko -> DCE -> firstturn Crisis Punch in both seats

**Agent 3 | 2 November 2026 | pinned native-engine staged mechanics witness, zero natural games.**

## Verdict and official paper basis

Official [Japanese Tapu Koko Prism Star FAQ](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%82%AB%E3%83%97%E3%83%BB%E3%82%B3%E3%82%B1%E3%82%B3%E2%97%87&regulation_faq_main_item1=all) says Dance of the Ancients can activate and attach **one** Basic Lightning even when the only Benched Pokémon is Koko itself, while zero Lightning in discard prevents use. The independently documented English card text and partial-attachment discussion support choosing Meloetta as the one actual Energy recipient when multiple Benched targets exist. See detailed [paper-rule correction](agent3-rank26-koko-single-lightning-paper-ruling-20261102.md).

This explicit ruling now has a **positive pinned native Store witness**. The test drives a real one-Lightning Koko AttachEnergyPrompt in the genuine original rank26 Meloetta Donk 60 against genuine original rank6 Iron Thorns 60, completes original physical DCE + TM + Escape Rope, announces native firstturn Crisis Punch and achieves a real Store winner in **both source physical seats**. It preserves both original 60 unique physical card IDs before and after. Therefore **discarding a second Lightning is not mechanically required for this conditional firstturn Meloetta attack**.

## Frozen experiment

[Preregistration](registrations/agent3-rank26-one-lightning-native-koko-20261102.md) was committed before the native test. Existing fully native [Unown 2+2+1 original-source fixture](../../simulation/twinleaf/rank26-unown-starter-source-fixture.cjs) begins with the source Active Unown, Benched Meloetta ex and Benched Tapu Koko Prism Star, an opposing **sole Active Iron Thorns ex**, and five genuine native source self-KOs giving the opponent five Prize cards. The continuation does **not** simulate unassisted acquisition: source card positions and five self-KOs are deliberately prepared.

New [one-Lightning-only continuation](../../simulation/twinleaf/agent3-rank26-koko-one-lightning-native.cjs), commit 496768bd, stages only **one** original Basic Lightning into the owner discard, while leaving the second source Basic Lightning in its original physical zone. It stages the authentic original Cologne, unique DCE, Crisis Punch Tool and Escape Rope into own hand, preserving six populated source Prize positions. It plays Cologne first under opponent's Ability lock through a genuine native PlayCardAction. It then declares Koko's genuine native Dance of the Ancients. After resolving native WaitPrompts, the returned native AttachEnergyPrompt accepts a **single** transfer to Meloetta on Bench 0. It validates physical owner discard-to-Bench movement and Tapu Koko entering Lost Zone. The native Store separately accepts DCE and Crisis Punch Tool on Meloetta, native Escape Rope promotion and a real first global turn Crisis Punch attack. The target original sole Iron Thorns is Knocked Out, and the native game ends with the source winner. Full exact original source and opponent physical 60 identities are rechecked after the native terminal.

All actions use the pinned Twinleaf engine at **a9905a76a6c4103ba4b6cb9a49e86bad795c5c05**. No upstream source files were changed.

## Complete measured outcomes

Manual-only [CI 41416123542](https://github.com/FlareZ123/experiment-01/actions/runs/41416123542) under frozen branch agent3-rank26-one-lightning-native-frozen-20261102, head fba325c259891b51d56b79ca1d5fa0d04a21d41f, completed successfully in both source positions after pinned engine compilation and full existing workflow tests.

| Native milestone | Source physical seat 0 | Source physical seat 1 |
| --- | --- | --- |
| Exactly one Basic Lightning staged in source discard | Verified | Verified |
| Opposing Iron Thorns Ability lock broken by played Cologne | Verified | Verified |
| Real Koko AttachEnergyPrompt accepts precisely one Lightning card | **Yes** | **Yes** |
| That original Lightning physically attached to Benched Meloetta | Yes | Yes |
| Koko original Prism Star physically moved to Lost Zone | Yes | Yes |
| Unique original DCE + Crisis Punch Tool attached to Meloetta | Yes | Yes |
| Original Escape Rope promotes Meloetta to Active | Yes | Yes |
| Original 2+2+1 five self-KOs leave opponent one Prize | Yes | Yes |
| Real native firstturn Crisis Punch and target Knock Out | **Yes** | **Yes** |
| Native terminal source win against solo original rank6 Active | Yes | Yes |
| Both original 60-card physical ID sets fully conserved | Yes | Yes |
| Natural randomized source hand or complete competitive game | **No** | **No** |

[Raw archive artifact 13128201185](https://github.com/FlareZ123/experiment-01/actions/runs/41416123542/artifacts/13128201185); ZIP SHA256 11e34c9e6cfc733c99d1053e10267dbf77f2bae67bf3fd2b8ce04d01684033ce. Console evidence confirms both seats, single-card prompt, native attack and no qualification.

## Implication for card and policy optimization

Earlier rank26 owner-only source Koko and Cologne heuristics required **two** discarded Lightning before acting. In this original source, **one** Lightning in discard, a usable Koko and Meloetta, and an accessible manual DCE can satisfy the printed attack's Energy demand. Therefore revise the hypothesis representation from two Lightning required to **one Lightning required for Meloetta Energy acceleration**, preserving separate role, Bench, Tool, lock, Prize and action availability. Under realistic opponent pressure or multiple attack targets, a second discarded Lightning can still have value. The old >=2 gate remains a useful stronger sufficient condition but must not be used as a test for all possible firstturn Meloetta lines.

The existing source owner Battle Compressor selector chooses up to **two** basic Lightning before considering at most **one** Exeggcute, and in some deck configurations uses fewer than its allowed three selections. Because the self-KO 2+2+1 engine needs two physical Exeggcute available, an owner-visible alternative priority that puts two Exeggcute into discard and **one** Lightning may provide a stronger complete attack pathway in some hands. That is **a policy optimization hypothesis**, not a demonstrated source win-rate improvement. Exact source replay and firstturn native controller testing remain necessary.

**Benchmark:** Original 60s for 29/32 Aichi Top32 authenticated. Zero competitively qualified games. No 99.5% fixed-deck win claim.
