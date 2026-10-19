# Ditto 30C → Vileplume AOR: native bilateral Item lock and Wobbuffet/Tool Jammer fidelity

**Agent 3, 19 October 2026. Evidence class: staged genuine pinned-Twinleaf Store mechanics tests, not a dealt game or competitive result.**

## Reproducibility

- [Probe](../../simulation/twinleaf/ditto-stage2-store-probe.cjs), [six assertions](../../tests/ditto-stage2-store.test.cjs), existing manually dispatched workflow `.github/workflows/aichi-dusclops-self-ko.yml`.
- Latest compiled [manual CI 39338442827](https://github.com/FlareZ123/experiment-01/actions/runs/39338442827), head `cb972da963ed722431e0bfad592aff98a00fc52c`: the pinned server compiled, **6/6** initial Ditto Stage-2 subtests passed, separate Dusclops tests 2/2 passed. Earlier [CI 39281436251](https://github.com/FlareZ123/experiment-01/actions/runs/39281436251) already compiled the original transformation, reroll and bilateral lock path.
- The repository pins Twinleaf submodule `vendor/twinleaf`, previously recorded as `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; the probe uses that submodule's compiled `ptcg-server/output` classes, not an independent paper rules engine.
- In the fixture, Ditto 30C starts Active with two artificially attached Psychic Energy, Stealthy Hood UNB, and 10 damage. The player's deck has an accessible Vileplume AOR. The genuine attack resolves live coin prompts, a Stage-2 deck-choice prompt, and the deck-shuffle prompt. This is a **constructed test fixture** and deliberately bypasses all first-turn access costs.

## Observed mechanistic results

1. `AttackAction(Surprisingly Transform)` on heads places **Stage 2 Vileplume AOR** directly Active; original Ditto returns to the deck; the two attached Energy, Stealthy Hood, and 10 damage persist. A second branch observes Glimwood Tangle DAA permitting the single opt-in tails-to-heads reroll.
2. With Vileplume AOR's *Irritating Pollen* active and Stealthy Hood attached, the pinned Store's genuine `PlayItemEffect` refuses **both players'** attempted Switch SVI Items (`CANNOT_PLAY_THIS_CARD`), consistent with bilateral Item lock. This explicitly tests the effect reducer, **not** a hand-sourced `PlayCardAction` under a natural turn.
3. Staged opponent Active Wobbuffet PHF alone leaves Stealthy Hood unsuppressed and leaves Vileplume's Ability operating; both Item attempts remain blocked.
4. Staged opponent Active Wobbuffet PHF **with Tool Jammer BST** highlights a pinned-engine fidelity defect: the **unpatched** engine still treats Stealthy Hood as active and still applies Vileplume Item lock. The printed Tool Jammer suppression is not functioning in this upstream implementation.
5. Enabling the preexisting reversible research-side [Tool Jammer correction](../../simulation/twinleaf/tool-jammer-hook.cjs) makes Tool Jammer suppress Stealthy Hood, allows Wobbuffet to suppress Vileplume's Ability, and makes both Switch Item attempts no longer blocked. All observations were verified in the same compiled six-test CI.

## Interpretation and limitations

These tests support the **mechanical plausibility** of using Ditto to install a Stage-2 lock and show a **specific counter-interaction** that can reverse the lock even with Stealthy Hood. The unpatched engine gives an unjustified positive account of the Hood protection under the staged Wobbuffet + Tool Jammer board, so a Ditto-lock simulation relying on that interaction should opt into the validated hook and document its provenance.

The test does **not** prove a legal fully dealt first-turn Ditto attack. It injects Energy, Tool, target and board state; uses one controlled coin sequence; has no authentic opposing source 60, K0/K1 prize knowledge, opponent decision policy, or 25-minute clock. It cannot establish a 60-card candidate's opening success probability, actual matchup strength, or win rate. The [exact restricted opening-route screen](../aichi-2026/agent3-ditto-prize-aware-firstturn-frontier.md) and [alternative Will path](../aichi-2026/agent3-ditto-will-natural-dce-frontier.md) remain separate, incomplete resource-access calculations.

**Field status:** 29 of the Aichi Top 32 complete original lists currently sourced; zero independent competitive-qualified games; no demonstrated 99.5% fixed deck.

## Follow-up native hand-play positive control, 23:13 UTC

The initial effect-level test has now been tightened through real `PlayCardAction` attempts. The [second manually dispatched compiled CI 39339936525](https://github.com/FlareZ123/experiment-01/actions/runs/39339936525) **passed 8/8** Ditto tests at head `6bc03bcc4ff1dba41b1c33a69d726de1cf718a60`, with separate Dusclops 2/2. It adds a live legal Bench target (`Pidgey MEW`), places an actual `Switch SVI` in the **acting owner's hand**, sets the acting player's native turn context, and attempts `PlayCardAction` from each physical seat. The observed control distinguishes the printed lock from lack of a switch target:

- Under transformed Vileplume + Stealthy Hood, both the owner and opponent's native Switch plays were rejected and the Item remained in hand.
- With injected opponent Active Wobbuffet PHF + Tool Jammer BST, **unpatched engine** rejected both native Switch plays.
- Under the same staged board with the existing opt-in reversible Tool Jammer hook, each physical seat's native Switch play was accepted and produced a genuine pending `ChoosePokemonPrompt` for the supplied Bench target. The regression asserts acceptance and that pending prompt; it does **not** claim the prompt was resolved or that full switch effects were audited.

The original report's `PlayItemEffect` characterization therefore has an independent end-to-end hand-play admission control. This is stronger mechanical evidence, while still being a constructed turn with injected resources, not a naturally reached source-game action. No official paper ruling, full-game result, or opponent competence has been established.

## Prompt-closed temporal lock restoration, 23:22 UTC

An additional native `ResolvePromptAction` extension resolved the exact pending `ChoosePokemonPrompt` with its live `PokemonCardList` Bench target rather than stopping at admission. [Compiled CI 39340905661](https://github.com/FlareZ123/experiment-01/actions/runs/39340905661), head `724362fb18f83a4125ad0d2adac480625e771783`, again **passed 8/8** Ditto tests. After either physical seat's accepted Switch under Wobbuffet + patched Tool Jammer, the acting Active becomes `Pidgey MEW`, the original Active is on that player's Bench, and Vileplume's Ability is no longer suppressed. A subsequent native `PlayItemEffect` is again blocked for **both** players. This is time-dependent: the counter opens a real legal Item window while Wobbuffet remains Active with its Jammer attached and Vileplume remains Active with Hood disabled; switching either side's Active changes the counter configuration and restores Irritating Pollen in this fixture.

The [published rank-7 source inventory](../aichi-2026/full-decklists.json) contains **three Wobbuffet PHF 36** and **one Tool Jammer BST 136**, the exact printings used in the staged counter. It establishes source matchup relevance, but does not establish that the cards were simultaneously accessed/attached in a real source-dealt match. Native Jammer *attachment from hand while Item-locked* is a further separate feasibility question until tested.

## Counter viability: native Tool attachment *during* Item lock, 23:27 UTC

New [compiled manual CI 39341363266](https://github.com/FlareZ123/experiment-01/actions/runs/39341363266), head `3383eaf081756e5e5ddee3d413572f5c9c1015b2`, **9/9 Ditto mechanistic tests plus 2/2 Dusclops passed**.

The ninth test removed the previously injected Tool Jammer. With real source-print `Wobbuffet PHF 36` already Active on rank-7 side and the transformed opponent Vileplume AOR 3 protected by Stealthy Hood, both players were initially Item locked. The source actor then *played `Tool Jammer BST 136` from its hand* using a genuine `PlayCardAction` targeting its Active Wobbuffet. The Tool attached successfully, left the hand, and required no unresolved prompt **despite the ongoing Item lock**. That is consistent with Advanced Player's Rulebook B-02: Pokémon Tools are treated distinctly from Item cards even for Sword & Shield-era printings carrying an older Item header.

With the existing reversible research correction installed, the Tool disabled the opposing Active Vileplume's Stealthy Hood, Wobbuffet suppressed Irritating Pollen, and both players' Item-lock checks became negative. In the **same constructed opponent turn**, an actual hand-play `Switch SVI` was accepted, its native `ChoosePokemonPrompt` was resolved to an authentic Bench slot, and after Wobbuffet left the Active Spot, Vileplume's Item lock returned. All nine assertions passed on the pinned compiler with no Twinleaf submodule modification.

This supplies a source-printing-matched **two-action Tool → Switch counterexample to the claim that Hood permanently secures a Vileplume Item lock** against rank-7 style boards. It still assumes an Active Wobbuffet, available Jammer and Switch in hand, a legal Bench target and adversary decisions. The authentic source 60 contains Wobbuffet ×3, Tool Jammer ×1, but source-dealt probability of assembling the interaction is **unmeasured**. There was no naturally dealt ranked game, no turn-clock or winning evidence. Published rank-7 source printings and counts come from [the 29-source manifest](../aichi-2026/full-decklists.json).
