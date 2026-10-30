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
