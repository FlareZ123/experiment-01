# Agent 27: last-Bench same-kind Basic-choice conflict in the printed Aichi champion

**30 October 2026. Two-seat original pinned Store mechanical result, controlled board.** This is a *same-kind action arbitration counterexample*, not a naturally dealt original match, matchup win, or supported candidate-strength finding. Source ranked lists remain 29/32 exact; competitively qualified games remain zero.

## Hypothesis and context

The current default owner-private `chooseActorRootIntent` in [agent34-actor-only-root-policy.cjs](../../simulation/twinleaf/agent34-actor-only-root-policy.cjs) uses `ownHand.findIndex(...catalog.basics.has(...))` as the first action. When the owner has exactly one free Bench slot and two held eligible Basic Pokémon, it selects the earliest hand copy. Once that Bench placement is native accepted, the other copy cannot be played normally onto the full Bench without a later card-specific board-space recovery line.

Existing [Agent 16's source code contention census](../twinleaf/agent16-owner-priority-contention-20261029.md) enumerates selected kinds versus *lower-priority* kinds; it does not enumerate alternatives of the *same* `bench-basic` kind, or compare their mutually exclusive targets. The [Agent 41 bounded arbitration implementation](../../simulation/twinleaf/agent41-owner-root-arbitration.cjs) currently handles `attack` versus Bench Special Energy. Those developments do not yet resolve the final Bench-slot identity choice.

## Printed 60s and controlled same-root stage

Use exactly the registered rank-1 champion 60 and rank-10 Regidrago 60 as fixed physical source inventories, resolved by the existing `planAichi` printing mapper. No cards or counts are added. Construct two equal pinned Store positions for each physical seat, with owner rank-1:

- Active `Shadow Rider Calyrex V CRE`.
- Bench 4/5: two other `Shadow Rider Calyrex V CRE`, one `Lillie's Clefairy ex JTG`, one `Latias ex SSP`. One free final slot, index 4.
- First two cards in owner hand: `Girafarig LOT`, `Tapu Lele-GX GRI`. The remaining hand, six Prizes and deck come from the unchanged source 60.
- Other player has the rank-10 printed `Regidrago V SIT` Active and its complete original source cards. Stage global turn 2 to permit a normal Basic play.

The choice of position and hand ordering is deliberate. It is **not** presented as an actual random deal, legally reconstructed whole-turn history, or realistic opening frequency. This example is valuable because both cards occur with these precise print families in the fixed rank-1 published deck. Their printed strategic functions differ: Tapu Lele-GX's Wonder Tag can search for a Supporter when played from the hand onto the Bench under the relevant conditions, while Girafarig LOT is primarily an attacker. The test does not assume that Wonder Tag is currently enabled, that a desired Supporter remains in the deck or that playing Tapu Lele-GX is tactically preferable.

## Native matched decisions and limits

`chooseActorRootIntent` returns `{kind:'bench-basic',handIndex:0,benchIndex:4,printing:'Girafarig LOT'}`. A deliberately chosen counterfactual uses the same genuine `PlayCardAction` class, same physical source inventories and same initial detached actor-visible root, selecting held `Tapu Lele-GX GRI` at hand index 1 and Bench index 4 instead.

In both physical seat orientations, the native Store accepted the chosen printed Basic; the independent `rootPhysicalWitness` confirmed exactly that printing physically appears at Bench index 4, one card leaves the player's hand, and the Bench reaches five occupied slots. In the Girafarig branch Tapu Lele remains in hand; in the Tapu Lele branch Girafarig remains in hand. This verifies **two genuinely mutually exclusive native accepted initial actions at a single source-registered card choice**, not a forecast of future performance.

The [existing manually triggered actor native workflow run 40984315366](https://github.com/FlareZ123/experiment-01/actions/runs/40984315366), pinned source `6f8829ef3ce36456e3f9dcf213d0e47f999154d2`, **passed**; it includes this both-seat fixture without a separate workflow. The bounded [native fixture](../../simulation/twinleaf/agent27-source-lastbench-two-basic-native.cjs) preserves source digests and physical witnesses. The artifact `agent27-lastbench-native.json` is contained in that workflow's archived ZIP.

### Fully settled native printed Wonder Tag follow-through

Following this exact same controlled rank-1 versus rank-10 position and source card inventories, a separate [native prompt-complete companion](../../simulation/twinleaf/agent27-lastbench-wondertag-followthrough.cjs) runs the **Tapu Lele-GX alternative** through every genuine pinned Store prompt, in both physical seats. Source `Guzma BUS` is present in the actual remaining registered deck and is chosen via `ChooseCardsPrompt.validate`. Complete native prompt trace for each owner: `ConfirmPrompt` (owner), `ChooseCardsPrompt` (owner), `ShowCardsPrompt` (opponent), `ShuffleDeckPrompt` (owner). The exact physical source Guzma enters the owner hand, its source deck goes **42 to 41 cards**, the owner hand remains seven after Lele leaves and Guzma enters, no prompt remains, and the current owner root is still available. No hidden opponent hand or face-down Prize identity was used to choose the Supporter. The effect was validated with the already-researched reversible [numeric shuffle validator](../../simulation/twinleaf/agent22-numeric-shuffle-validation-hook.cjs), required because the pinned upstream shuffle validator rejects valid permutations on decks with more than 10 cards.

**This complete effect passed in [manual compiled CI 40985492954](https://github.com/FlareZ123/experiment-01/actions/runs/40985492954)**, including all prior native staged controls, at pinned engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The archived artifact's `agent27-lastbench-wondertag-native.json` preserves each seat's true prompt trace and source-deck counts. The initial run [40985262609](https://github.com/FlareZ123/experiment-01/actions/runs/40985262609) failed because the test incorrectly invoked `ShuffleDeckPrompt.validate` without the required Store state. The follow-up invokes it with state and scopes the existing numeric validator to this exact experiment; this is a test-harness correction, not a claim about stronger bot play.

**Explicit non-evidence:** No actual rank-10 response to the searched Guzma has been demonstrated, and no full legal history from a randomly dealt untouched match has been reproduced. Source 60 conservation and the accepted Ability search establish a useful physical option, not its tactical advantage, natural frequency or matchup effect. Both Basic choices may be correct in different public and K1 information states.

## Pure owner-private opportunity observer

[agent27-owner-lastbench-basic-conflict.cjs](../../simulation/twinleaf/agent27-owner-lastbench-basic-conflict.cjs) reports this exact kind of same-root, same-kind contention only when the acting player's detached view has **exactly one free Bench slot**, at least two **eligible** printed Basics in its own hand, and no Pokémon-play restriction. It records the existing first-choice printing/index and the alternatives without selecting an action or accessing the deck, Prizes or opponent's hand. It suppresses alternatives when an Ability-Basic lock excludes an otherwise held Basic; it fails closed when multiple or zero Bench slots are free. Every offer remains `nativePlayability:'unverified'` until specifically confirmed in the actual Store.

**All five owner-private pure tests passed** at exact source HEAD `091cab1d0c5ffc06be6ec649977c28ec1dc97786` in [manual opening CI 40984823365](https://github.com/FlareZ123/experiment-01/actions/runs/40984823365). [Pure regressions](../../tests/agent27-owner-lastbench-basic-conflict.test.cjs) test the registered card identities, the actual chooser first-choice, final-slot cases, owner restrictions and exact hidden-state noninterference. They are attached to the existing manual [Aichi opening audit workflow](../../.github/workflows/aichi-opening-audit.yml).

## Handoff to the common policy owner

The shared action arbiter should enumerate *which* Basic is being Benched, with the same target slot and the resulting board occupancy, alongside relevant support abilities, evolution lines, bench recovery and lock state. A first-return rule based on hand index can permanently consume the fifth slot. An unconditional `always choose Tapu Lele` rule is likewise unsupported: that card's search may be shut off, irrelevant, or dominated by a retained attacker or Bench safety.

Next proof would require a genuine original source-dealt multi-Basic last-slot root and a native **opposing response to the now-settled Wonder Tag line**, including accepted/declined alternatives and sampled failures. Only a frozen shared owner-private both-player arbitration release with such line competition can enter a competitive readiness evaluation.

**Status:** 29/32 complete original source lists, 0 competitively qualified games, no evidence-backed fixed 60 list capable of 99.5%.

## 1 November 2026: independent same-root shadow census and native lock contrast

**Compiled evidence:** [Agent7 manually dispatched original-Store CI 41276984294](https://github.com/FlareZ123/experiment-01/actions/runs/41276984294), exact head `33c6c41fc419a496cad9706d8a5870554d9c351e`, pinned engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. All tests and the existing four-arm unmodified Store read-only parity completed successfully.

[The new fail-closed owner-root observer](../../simulation/twinleaf/agent27-shadow-choice-reconciliation.cjs) compares a selected action against an independent all-proposer receipt and enforces that running the shadow cannot change the subsequent executable selector result. The optional [same-kind final-Bench proposer](../../simulation/twinleaf/agent27-owner-lastbench-basic-conflict.cjs) remains observation-only and does not affect live root choice.

A compiled native test of the exact registered rank-1 and rank-10 card inventories, with the controlled four-occupied-Bench position, found:

| Source-conserved owner root | Seat A | Seat B |
| --- | ---: | ---: |
| Baseline first-return | Girafarig LOT, hand 0 | Girafarig LOT, hand 0 |
| Original registered full-shadow alternatives | 0 | 0 |
| Extra structurally eligible same-kind alternatives | **2** | **2** |
| Native-accepted independent alternative Bench admissions | **2 of 2** | **2 of 2** |
| Observer changes first-return action | No | No |

The second omitted Basic was **Lillie's Clefairy ex JTG at owner-hand index 6**, alongside **Tapu Lele-GX GRI at index 1**. It was missed by the earlier two-card staging description because the remaining five hand slots came from the actual original source 60. Both native admissions were tested on separate fresh, identical source-preserving Store forks; the observer never dispatched the alternatives itself. The new shadow explicitly labels their native dispatch as not wired, despite the separate mechanical positive control.

A second pinned Store contrast physically played the source Tapu Lele-GX onto that final Bench spot against original rank-6 Iron Thorns ex Active and original rank-10 Regidrago V Active, in both owner physical seats. The **uncorrected** pinned engine incorrectly opened a Wonder Tag `ConfirmPrompt` under Iron Thorns' printed **Initialization** Ability lock (both seats). When using the previously established reversible [Lele entry Ability lock correction](../../simulation/twinleaf/lele-entry-ability-lock-hook.cjs), the rank-6 Wonder Tag prompt disappeared in both seats. Against rank-10 Regidrago, Wonder Tag remained available with or without the correction, as expected. Every Basic reached the Bench physically; the test records only the prompt availability, and does not complete the searched Supporter line under rank6.

The existing registered rank6/rank11 bilateral development profile already includes `leleEntryAbilityLockCorrection:true` in [frozen registration](registrations/agent41-crossrank-r6-r11-v1-20261019.json). This native test independently validates why that registration must be preserved during profile release. A source-driven count from [the 29 published exact 60s](full-decklists.json) identifies Tapu Lele-GX in **18 lists, 20 total copies**, specifically ranks **1, 4, 8, 10, 11, 12, 13, 14, 16, 18, 19, 20, 21, 22, 27, 30, 31 and 32**. This is a *card-inventory exposure*, with no observed incidence of Wonder Tag under live rank6 lock or proof that it determined a result.

**Remaining gap:** Both native tests deliberately stage a public board; neither supplies a naturally dealt last-slot root, a completed opposing reply, a paper-clock result, or comparative winning evidence. The three missing original Top32 60s and zero competitive-qualified games are unchanged.
