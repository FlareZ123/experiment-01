# Rank-2 Vileplume Control: exact-physical target and two-sided Guzma continuation

**Agent 10, 2026-11-28.** Review-only branch `agent10/rank2-physical-slot-selection-20261128`. Decision changed: the original rank-2 opponent policy can select a physically correct target and complete a synthetically modeled Guzma root→two Pokémon prompts, instead of passing or guessing. No candidate 60 or opponent source 60 changes.

## Defect and correction

1. **Duplicate physical Pokémon.** The policy previously mapped a `ChoosePokemonPrompt` choice to the first board entry with the same printing. With two identical opponent Pidgeot ex, Guzma selected the healthy Bench slot while the chosen token should have targeted the 10-HP duplicate. Cassius similarly selected healthy rather than damaged Bunnelby. Grand Tree selected a newly played Oddish rather than an older physically eligible duplicate. The corrected `choiceBoardPokemon` resolves `ownerSeat` + `targetZone` + exact `benchIndex`/`slotIndex` in the published actor observation and confirms the printing. Missing/mismatched physical locations fail closed.
2. **Guzma’s dual owner.** Printed Guzma BUS 115 text says to switch an opponent's Benched Pokémon with their Active, *then* switch one's own Active with one of one's own Benched Pokémon. The policy previously required every Guzma Pokémon choice to have `ownerSeat='opponent'`, rejecting the mandatory own-Bench prompt. The corrected policy distinguishes opponent-target scoring from own-pivot scoring. It promotes a visible Stoutland lock pivot when Garbotoxin is absent and prefers Bunnelby under visible Garbotoxin.
3. **Targetless Supporter root.** The action frontier projects `PLAY_CARD_ACTION` and may contain no `target` before Guzma's target-selection prompt. Previously the policy assigned score 0 to such a root and selected Pass. The corrected rule recognizes a legal gustable opponent Bench plus own pivot, retains the explicit-target path, and declines the root when no eligible opponent Bench is visible. The native Store remains the legality authority.

## Executable decision evidence

- Exact mainline original policy evaluated against the branch's full 45-case test suite and current shared protocol: **38/45 passed**, with seven identifiable failing decisions (three wrong physical targets, one nonexistent target wrongly selected, two own-Bench Guzma continuations rejected, and one legal targetless Guzma root incorrectly passed). The eighth new case, no opponent Bench → Pass, already worked on main.
- Corrected exact branch source plus the complete 45-case suite: **45/45 passed** under in-memory V8 CommonJS evaluation, using the repository's current `agent49-policy-protocol.cjs` `validateRequest` and `validateDecision`. Mainline baseline `37/41` on duplicate-target additions; intermediate branch `41/43` before own-Bench correction; last intermediate branch `44/45` before targetless-root correction. These individually reproduced failures all reversed after the respective patches.
- Source: `simulation/evaluation/2026-11/agent10-rank2-vileplume-control-opponent-policy.cjs`, branch blob `7f45cce6b58c7575fb3e7f1189874308e4be09dd`.
- Test: `tests/2026-11/agent10-rank2-vileplume-control-opponent-policy.test.cjs`, branch blob `bac17f594d3d35688294891c3f13b5aef4acad6b`.
- Shared protocol used unchanged: `simulation/evaluation/2026-11/agent49-policy-protocol.cjs`, main blob `d8349ae6f3537816b357b8309e9ab140ddec51eb`.
- Host metadata checked against `simulation/evaluation/2026-11/agent36-prompt-projection.cjs` `projectChoosePokemon`: exact `benchIndex` or `slotIndex`; actor-owned observation only. No private zones used.

## Limits and follow-up

These are **synthetic actor-only decisions**, not native Store state transitions, a valid three-prompt sequence driven by the actual engine, full Node worker IPC, game traces, paper adjudication, opponent competence or field win-rate evidence. The mock root→two-prompt test is an ordered synthetic choice sequence, not a physical settlement receipt. Independent review should challenge one actual native rank-2 Guzma continuation when permitted; no new workflow or game authorization is implied. The separate rank-2 v2 worker was not modified or tested.

The code branch is intentionally unmerged pending the existing owner/reviewer decisions. No Stage-A, V3, CI, official benchmark, frozen policy or deck status changes.


## Engine setup: complete actor-only opening decisions (28 November extension)

The same v1 worker previously lacked all three authenticated host engine setup prompts: `CHOOSE_STARTING_POKEMONS` (Basic selection or no-Basic mulligan), `GO_FIRST` and `WANT_TO_DRAW_CARDS`. A normal opponent worker therefore could abstain before the first legal turn. The updated branch handles exactly those three prompt descriptions, requires phase 1, the trusted engine provenance, exact typed options, and rejects malformed provenance or out-of-phase attempts. All other prompt types—including historical tests that use generic engine source labels—continue through their existing code without interception.

- Starting Basics: preserve native sorted physical hand indices and select up to the native maximum. If the legal prompt presents no Basic and permits zero, select the native empty-selection token.
- Coin-flip winner choice: choose going **second** to retain the option for the rank-2 Bunnelby Barrage + TM: Evolution first-turn attack. This is a **policy heuristic**, not a measured performance advantage.
- Opponent mulligan bonus: choose the largest offered native draw count using the typed `choiceIndex` and exact `Draw N card(s)` label.
- Negative controls include phase-2 lookalike and a forged card-effect source with matching description.

**Exact before/after:** same previous branch source and six new tests: **46/51** protocol-validated V8 decisions; updated branch source and unchanged 51-test suite: **51/51**. The prepatch branch fails five cases, passing the going-second choice accidentally by generic fallback. This is a synthetic actor-protocol test, not physical game setup, native Store settlement, or an authorized game. Current branch policy blob `6861ff6730f15b8f58dfcf8567721bf7f2ffc8bd`, test blob `80b6d8c3b065afd05141e6b27b8cbec31623213b`, both readback verified. No deck or source change.



## Garbotoxin is conditional, not a printed-Ability-only lock

The rank-2 worker's `opponentHasGarbotoxin()` previously treated a visible Garbodor with printed Garbotoxin as locking Abilities even with **no Tool attached**. The supplied source card text (DRX 54 / BW6 54) states its Tool-attached condition explicitly. The revised predicate requires at least one attached Tool and respects an explicitly actor-visible `abilitySuppressions[].suppressed===true` fact, while treating unknown suppression conservatively. This changes the Stoutland active-promotion and Guzma self-pivot decisions when the opponent's Garbodor has no Tool or is known suppressed.

**Exact executable before/after** on the final 54-case branch test suite: previous branch policy **51/54** (three failing cases), revised policy **54/54** (all pass). Controls preserve Bunnelby preference when Garbotoxin bears a Tool and is not reported suppressed. The three failures cover Tool-less Garbotoxin blocking a legal Stoutland self-switch, blocking a Stoutland root Retreat, and falsely blocking a certified-suppressed Tool-bearing Garbotoxin. These are synthetic game-state/actor-protocol tests, not evidence that a particular suppressed real-native state has been demonstrated.

Updated review-branch blobs: worker `f6e9ed0d7af6907637fed3b44afbb3b9c21a99d5`, test suite `b7d7e17ec38e9a475a89c90d6e6205f3cbe3ff31`. No native Store, CI, game, merge, candidate nomination or qualified matchup was run.


## Guzma opponent-only gust without an own Bench

Guzma BUS 115's printed sequence first switches in an opponent Benched Pokémon, then conditionally switches the user's Active with one of their own Benched Pokémon. The Advanced Player's Rulebook permits carrying out applicable parts of an effect when another part is inapplicable. The prior branch rejected targetless Guzma at root if no own Bench existed, incorrectly removing an otherwise meaningful opponent gust. The corrected root scoring accepts a visible opponent Bench target regardless of own Bench occupancy; the second switch remains inapplicable if own Bench is empty. The existing no-*opponent*-Bench Pass control remains unchanged.

**Exact synthetic before/after:** old branch **54/55**, corrected branch **55/55** protocol-validated V8 decisions, with a new no-own-Bench Guzma → opponent 10-HP target case. This is a paper-rule-model inference tested against the actor decision contract; **no native Store execution of this partial effect was performed**, so a possible Twinleaf implementation discrepancy remains an explicitly unsupported native path until owner-approved testing. Final branch blobs: policy `f7d5e6cb21f5e74baad2e8bd30083319b43cbd76`, tests `1f45aef172b3af4b2684d103ade0831c0d2e9202`.


## TM: Evolution avoids unusable Tool recipients

The original v1 root scorer gave the same high 178 priority to TM: Evolution when *any* Bunnelby and a K0 evolution target were present, regardless of the Tool's **actual recipient**. The native frontier can offer a Tool attachment to another eligible Pokémon first. As TM: Evolution expires after this turn, attachment to an unrelated Benched Pokémon can waste a scarce setup card even though an Active Bunnelby could execute its double Evolution attack. The revised scoring requires a matching actor-owned **Active Bunnelby**, or **Benched Bunnelby with Jet Energy currently in hand** and a K0 Bench evolution target, before awarding the ALS setup score. Other technically legal attachments are deliberately declined until an independently modeled alternate attack route establishes their value.

**Exact before/after:** previous branch **56/58** protocol-validated V8 source decisions, revised branch **58/58**. The new competing-action test placed the unrelated Bench target **first**, so the old scorer demonstrably chose it. A second negative test shows a lone unrelated target no longer burns TM; a third positive control preserves the Jet/Bunnelby opportunity. Updated final review blobs: worker `d7b9e45437d58a8d37b5e8ad1248b7c9b37ba2cd`, tests `8a1ff38a9b1cdf49a337c2a5e48f512f798f6118`. No native Store or game was executed.


## Plumeria and Faba: actor-visible Energy / Tool disruption continuations

**Plumeria BUS 120** (one in authentic rank2) was root-playable without verifying two acceptable hand discards, yet the opponent-Pokémon target prompt was unimplemented. The revised root evaluation removes the played Supporter from the hand *before* checking availability of two acceptable discard cards; the prompt chooser selects an exact owner-visible, Energy-bearing opponent Active/Bench slot, preferring a Special-Energy target. The prior energy-payment chooser is reused to remove the chosen Special Energy. Full **synthetic** root→two-card discard→opponent target→Energy choice is now test-covered, alongside no-discard and no-Energy-target negative controls. Exact prepatch branch **59/61**, patched **61/61**.

**Faba LOT 173** (one in rank2) also lacked the opponent-Pokémon selection step. The revised scorer chooses an exact opponent slot with a removable Tool or Special Energy, prioritizing the latter. Its card-selection evaluator now matches actual **visible attached Tool/Special Energy or in-play Stadium printings**, rather than assuming only names containing "Tool"/"Special Energy" are removable. That fixes named Tools such as `Stealthy Hood UNB 186` being silently scored zero and handles duplicate Pokémon printings in different physical slots. The negative case rejects Basic Energy as a Faba target. Prepatch **62/64**, patched **64/64**. Furthermore, an omitted **Basic Fairy Energy** from the Special Energy discriminator created a false Faba legal-target score; the exact negative root decision was corrected from **64/65 to 65/65**.

These are game-state-specific actor decisions checked by the shared protocol and real source text. They are not native resolved Store paths and not demonstrated performance. Review-branch current worker blob `67d7669f1a007b7105b8c09302b93f81b33501f7`, tests blob `4d2728e26f1b1106d2763df3ecf4c22674ad4d90`, both GitHub readback confirmed.


## Targeted resource-conservation follow-through

- **Basic Fairy Energy** remains a Basic Energy in paper Expanded and must not be scored as a Special Energy. In addition to Faba's root misfire, the Plumeria Energy-removal prompt previously ranked a Basic Fairy at the same high value as a Double Dragon Energy. Fixed its mandatory Energy-choice discrimination, **65/66 → 66/66** on the extended suite.
- **Stealthy Hood** (three copies in rank2) was assigned a lock-protection score of 205 whenever an opponent's Garbotoxin was live, even if the actual Tool recipient was a Bunnelby. Fixed the root by resolving exact actor slot from native target metadata, checking the recipient printing, prioritizing Gloom/Vileplume (205) and separately acknowledging Pidgeot ex (110). Irrelevant targets score zero. Competing Bunnelby-first vs Gloom and no-lock-target negative tests reproduced the defect: **67/69 → 69/69**.
- **Grand Tree** is a shared-effect singleton ACE SPEC Stadium, not an unconditional +95 setup card. Card text explicitly forbids evolving a Basic played this turn and both players can use the Stadium. The root policy now preserves Grand Tree if no usable source Stage1+Stage2 line exists for a prior-turn Basic, except to replace a currently disruptive Stadium such as Path to the Peak. The stranded-turn comparison was **71/72 → 72/72**, with legal-evolution and Stadium-counter positive controls.

Current review-branch exact source blob `ebbf384f01f8a81194a25fe4e6a2c5ec3997bc26`, tests blob `7360782eb37977d20f29c7dde14f2aff5b864ebd`, both readback verified. Nothing in this experiment demonstrates native Store settlement, actual game win rate, field coverage, or authority to run CI.


## Revealed-hand K0 identity and shared Artazon donation

**K0 source count, concrete double-counting:** The acting player's own hand appears as `observation.ownHand` irrespective of public visibility. When the hand is also revealed, `ownPublic.publicHand` is the *same physical cards*. Previous `visibleSourceCopies` counted both representations. This could mark two total Gloom copies exhausted when only one was physically held and falsely veto Grand Tree's live evolution route. The revised count excludes `ownPublic.publicHand` because `ownHand` is already authoritative for this seat. After fixing the test player's `publicHand` fixture, the exact original formula failed one newly added decision (**73/74**), while the revised formula passed **74/74**; a negative control with two genuinely held Gloom still refuses Grand Tree.

**Artazon:** Like Grand Tree, this Stadium may help the opponent if handed over for no immediate actor benefit. The previous root scorer assigned Artazon +70 even with the Bench full, and could overwrite the actor's active Grand Tree. Revised Artazon root scoring requires a vacant Bench with a missing Basic development line, or an immediately removable disruptive Stadium such as Path to the Peak. Opponent suppressor removal still allowed when Bench full. The contested full-Bench case was **76/77** before and **77/77** after, with positive vacant-Bench and Stadium-counter controls.

Current branch worker blob `7a2161d6d6789537bc36129b63e87694f532bbd1`, tests blob `306740fd460ef163004a996433159a48cc6c29db`; exact source/test readback confirmed. All decisions are synthetic actor-protocol decisions, not native Store transitions or game claims.
