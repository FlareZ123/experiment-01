# Pinned Twinleaf Thorton breaks attached Energy custody and permits illegal evolved targets

**Agent 12 | 3 November 2026 | actual pinned Twinleaf Store, reversible paper research hook, both physical player seats | zero source-dealt or competitively qualified games**

## Severity and decision

The registered Agent5 [ADP / Thorton / Regidrago v2 fixed sixty](candidates/agent5-adp-thorton-regidrago-60-v2.json) relies on **Thorton LOR167** to exchange a surviving Active Arceus & Dialga & Palkia-GX for a discard-pile Regidrago V while retaining the former's attached Double Dragon Energy and the turn that the recipient entered play. It may also use Thorton in reverse from original Active Regidrago V to Active ADP. The pinned Twinleaf native implementation **does not preserve even a single attached Double Dragon Energy when a Basic Active is swapped**. It also lets a player replace the **Basic card at the base of an evolved Regidrago VSTAR** instead of rejecting the evolved target. Both failures reproduce under genuine native `PlayCardAction`, `ChoosePokemonPrompt`, and `ChooseCardsPrompt`, on **both physical seats**.

This establishes a **hard experiment admission blocker**: do not interpret unhooked Twinleaf results involving the Thorton-based ADP→Regidrago pipeline as evidence about the paper-legal payoff or matchup win rate. The underlying paper-card line remains a valid research hypothesis. The bug is in the native experimental implementation.

## Exact source of the two defects

Pinned Twinleaf gitlink SHA: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The unmodified upstream class at `ptcg-server/src/sets/09-sword-and-shield/set-lost-origin/thorton.ts` implements the printed Thorton and its two sequential prompts. It uses these operations, in this order:

```text
MOVE_CARDS(store, state, targetList, player.discard, {
  cards: [targetList.cards[0]], sourceCard: this
});
MOVE_CARDS(store, state, player.discard, targetList, {
  cards: [card], sourceCard: this
});
```

The pinned native generic `MoveCardsEffect` reducer at `ptcg-server/src/game/store/effect-reducers/game-effect.ts` has a board cleanup that acts immediately after the **outgoing Basic leaves the slot**, because `source.getPokemons().length === 0`. It sends any orphan attached cards/energies to discard, clears the Energy cache and resets `damage`, `pokemonPlayedTurn` and other board-state attributes. Returning an incoming Basic afterward cannot recover those resources. This exact failure mechanism matters: a mere fix to the Thorton attack-selection policy or to its printed card data cannot repair it.

The original Thorton implementation also has a malformed target-exclusion loop:

```text
if (card.stage !== Stage.BASIC) {
  blocked.push();
}
```

There is no CardTarget passed to `blocked.push`, so an evolved Pokémon remains selectable. Its `canPlay` predicate also uses `c instanceof PokemonCard && Stage.BASIC`, failing to compare the card's actual `stage` value. These produce a native false legal opportunity distinct from the resource-loss bug. The engine's generic Supporter bookkeeping **does** move the spent Thorton from the Supporter zone to discard in the observed legal swap; it was not a demonstrated defect.

Under the provided *Advanced Player's Rulebook* D-19, Thorton's explicit in-play substitution retains attached cards, damage, effects and turns in play. The stage restriction is printed on Thorton itself. This is the paper-fidelity criterion.

## Physical native receipts

A [small genuine Store probe](../../simulation/twinleaf/agent12-thorton-regv-active-native.cjs) stages actual printed `Regidrago V SIT` in Active with one actual `Double Dragon Energy ROS`, actual `Arceus & Dialga & Palkia GX CEC` in discard, real `Thorton LOR` in hand, and an otherwise isolated constructed board with original `damage=60` and `pokemonPlayedTurn=1` at native turn 3. The source card zone and prompt owners are observed before and after the actual native dispatched Trainer, targeted board slot and discard donor. Each setup repeats with `state.players` in opposite order, preserving the source owner identity.

The unhooked Basic-to-Basic swap in both seats puts ADP Active and Regidrago V in discard. **It also puts attached Double Dragon Energy in discard, leaves Active ADP without Energy, erases the original damage and resets the Pokémon-played turn**. With a second evolved-target setup containing Active Regidrago VSTAR and a legal separate Bench Basic, the raw Thorton prompts allow the evolved Active target, move its underlying Regidrago V to discard, leave a Regidrago VSTAR in the former slot and insert ADP in an impossible stack. This is a confirmed native state, not a hypothesized problem.

The initial raw receipt without nonzero damage already passed in both seats as a negative-control result in [CI 41586690551](https://github.com/FlareZ123/experiment-01/actions/runs/41586690551). Updated nonzero-damage/history and prompt-recovery assertions have their separate CI receipt, below.

## Minimal reversible research-owned correction

The [opt-in adapter](../../simulation/twinleaf/agent12-thorton-paper-swap-hook.cjs) `withPaperThortonSwap(execute)` wraps a synchronous Store experiment, temporary-patches the **pinned Thorton class only** plus guarded Thorton-specific prompt results on `Store.prototype.dispatch`, and restores the exact original property descriptors in `finally`. No upstream submodule file is edited, no exported gameplay policy is implicitly patched.

The correction:
1. Requires one genuine **Basic Pokémon in the owner's discard**, a genuine **Basic in play** and an unused Supporter. The in-play target prompt lists only actual Basic board slots.
2. For an actual Thorton donor choice, checks the selected physical Basic belongs to the owner's discard. In the prompt-dispatch guard, validates Thorton-specific owner choices **before** the engine consumes the prompt, so a rejected evolved target can be reselected as a legal Basic.
3. On a valid choice, **inserts the incoming Basic into the same board slot before removing the outgoing Basic**. The in-play board slot therefore never has zero Pokémon between the two native `MOVE_CARDS` operations, avoiding the generic orphan cleanup. No fabricated Energy or histories are inserted. Normal native Supporter accounting remains in control.

This implementation is limited to the pinned revision and needs revalidation after any upstream update. It is a **research hook**, not a complete paper rules engine. The [native test](../../tests/agent12-thorton-regv-active-native.test.cjs) checks raw and corrected outcomes for both physical seats, keeps all physical card references, and confirms the same target prompt survives a rejected evolved choice. It also checks recovery by choosing the separate legal Basic Bench after rejection.

### Verification status

- [CI 41586690551](https://github.com/FlareZ123/experiment-01/actions/runs/41586690551): **SUCCESS** on both-seat initial raw-versus-guarded Basic Energy preservation and initial invalid evolved-target veto. Pinned engine compiled and full pre-existing Bellelba/Sidney test suite passed. This earlier revision's rejection happened inside the prompt callback and did not preserve the prompt for retry, prompting a stronger pre-dispatch hook.
- **Post-correction CI:** Latest default-off manual native workflow runs include the tighter pre-dispatch rejection, actual `60` preexisting damage, `pokemonPlayedTurn=1`, and rejecting an evolved target then reselecting a legal Basic Bench in the same Store. The stronger [CI 41587296526](https://github.com/FlareZ123/experiment-01/actions/runs/41587296526) completed SUCCESS with genuine nonzero damage (60), inherited `pokemonPlayedTurn=1`, and pre-dispatch evolved-target rejection preserving the pending prompt. [CI 41587934178](https://github.com/FlareZ123/experiment-01/actions/runs/41587934178) subsequently completed SUCCESS on the **same-prompt recovery**: after rejected evolved Active choice, the owner selects its actual Benched Regidrago V, receives ADP from discard, spends Thorton, and leaves the evolved Active untouched. A later set of assertions also checks Special Condition custody and same-turn evolution legality; those require their own green CI receipt.
- All tests create a constructed in-memory native board, not a naturally shuffled source-owned full-60 game. They do not verify the complete evolved Regidrago-Apex follow-through, opponent answer, Prize-taking, full gameplay policy, or whole-event win rate.

## Final native CI: physical turn history also creates a false-positive T2 evolution

**[CI 41588331846](https://github.com/FlareZ123/experiment-01/actions/runs/41588331846), SUCCESS**, pinned head `8a6b401d66b8822e521821219c9612f59b104b45`, compiled the same pinned engine and passed **16 Thorton native tests** (10 Active-swap/invalid-retry and Special Condition cases, six reverse-swap/evolution cases). It additionally passed the older Bellelba, Sidney, Team Skull Grunt and Lillie source-owned test families. The new test source lives at [`tests/agent12-thorton-adp-regv-evolution-native.test.cjs`](../../tests/agent12-thorton-adp-regv-evolution-native.test.cjs) with the independent [native Store receipt generator](../../simulation/twinleaf/agent12-thorton-adp-regv-evolution-native.cjs).

This verifies **both directions** of the original ADP/Thorton/Regidrago swap on two physical seats using actual Store actions and Pokémon printings:

| Constructed Native Store case | Unhooked pinned native | Paper-hooked native |
| --- | --- | --- |
| T1 RegV → Thorton → ADP, source has DDE, 60 damage, played turn1, Poisoned | RegV discarded; **DDE discarded**, 0 damage, played turn0, Special Condition cleared | RegV discarded; **DDE attached**, damage60, played turn1, Poisoned retained |
| T2 ADP → Thorton → RegV, ADP played on earlier turn1; immediately play genuine VSTAR from hand on native turn3 | RegV VSTAR evolves, **without DDE**, damage0, erroneous played turn0 until evolution | RegV VSTAR evolves, **with DDE**, damage40, proper inherited turn1 until evolution |
| T2 ADP → Thorton → RegV, ADP itself entered play this same native turn3; attempt genuine VSTAR evolution | **Illegally permits VSTAR evolution** because original played turn was reset to zero | **Rejects same-turn evolution** with `POKEMON_CANT_EVOLVE_THIS_TURN`, retains VSTAR in hand |
| Active evolved RegVSTAR selected as Thorton target (a separate Bench Basic is available) | **Accepts evolved Active**, creates invalid evolution stack | Rejects target before prompt consumption; owner can select legal Bench Basic using same prompt |

The same-turn VSTAR permission is a **second-order rules violation** caused by reset of board `pokemonPlayedTurn`. It shows why a native simulator may generate *both* false negatives (lost Energy) and false positives (premature evolution) for the same Supporter. The exact printed Thorton turn inheritance is strategically substantive, and native results should not be interpreted without checking it. The hook's preservation of actual Poisoned status was also verified in both seats. These experiments remain constructed native boards, no source-owned full-60 deal, no opponent interaction, and zero qualified games.

## Implication for the 2026 Aichi field program

This defect has direct causal scope for the ADP v2 setup line, particularly the already quantified [first-Thorton Gear access](agent12-adp-turnone-gear-strict-twoturn-exact-20261103.md) and [Regidrago starting Active / third-donor substitution](agent12-adp-regv-active-thorton-donor-conservation-20261103.md). Those **mathematical physical setup opportunities are paper-model quantities**; they should not be automatically downgraded because the pinned unmodified engine incorrectly discards DDE. To rank the deck through native experiments, integrate the research-owned Thorton hook only after verifying that actor-root-available actions can actually use it, then run authentic source-owned physical deals, the intervening opponent turn, subsequent Thorton and natural evolution, and side-by-side unhooked negative controls.

The full benchmark remains **29/32 authenticated original opponent inventories** (ranks 23,25,28 missing), **zero competitively qualified original games** and **no justified 99.5% field win rate**.
