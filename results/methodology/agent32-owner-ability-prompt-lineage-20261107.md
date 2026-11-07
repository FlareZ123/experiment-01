# Agent32: owner-Ability prompt identity and Articuno one-shot audit lifetime

**7 November 2026 | scope: research-owned Twinleaf adapter | current disposition: bounded regression pending native CI.**

## Question and evidence

Can the selected v8-successor owner-only ability adapter correctly distinguish an already-resolved ability prompt from a later unrelated prompt, including when separate native Store instances assign the same numeric prompt ID? Does a settled Articuno-GX Legendary Ascent Energy-movement prompt leave false state that could attribute an unrelated later MoveEnergyPrompt to Articuno?

The pinned Twinleaf `Store.prompt` calls `generateId(state.prompts)`, and the pinned `generateId` returns ID 1 when a Store's prompt array is empty. Numeric prompt IDs are therefore local to a Store, not globally unique. This is source-code evidence from the pinned upstream revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. No actual historical v8 original-sixty game is shown to reuse a Confirm ID inside one adapter run; the cross-Store regression below is deliberately synthetic.

The previous owner-Ability wrapper used a `Map<number, playedCard>` keyed only by `prompt.id` and never removed settled entries. Its independent `pendingAbilityByOwner` attribution survived completion of an Articuno-GX `MoveEnergyPrompt`. Both states allowed later observations to be associated with the wrong ability. These are code/isolated-test risks; they do **not** establish a paper-game play, adverse outcome, or changed 60-card deck.

## Narrow intervention

- `simulation/twinleaf/agent36-owner-ability-confirm-policy.cjs`: associate each freshly created Confirm prompt with the actual prompt **object** from the accepted Store dispatch; delete that association when the corresponding Confirm settles. Preserve the existing same-dispatch card provenance check. This prevents numeric aliasing across Store instances and bounds the lineage lifetime.
- Clear `pendingAbilityByOwner` after the first attributed Articuno `MoveEnergyPrompt` settles, so later independent MoveEnergy prompts are not counted in its event ledger. This is an observation-lifetime correction, not a change to how the real Store moves the Energy.
- Bump the policy's receipt version to `agent36-owner-ability-confirm-policy-v2-prompt-object-lineage`. No vendor modifications, no chosen candidate/deck changes, no default v8 release changes.
- Add two isolated negative-controls to `tests/agent36-owner-ability-confirm-policy.test.cjs`: (1) two independent Stores with reused `ConfirmPrompt.id=1`, one real Radiant-triggered yes then one unrelated prompt expected false; (2) a genuine Articuno-triggered yes followed by one MoveEnergy resolution and an unrelated subsequent MoveEnergy resolution; only the first can enter the Articuno event ledger.

## Verification contract

The **existing manual-only** `twinleaf-completion.yml` workflow was dispatched with `abort_provenance_only=true` and `include_agent8_telepath_v5=true`. This runs the existing owner-Ability pure suite plus the pinned native original-eight v8 successor and two-seat Radiant zero-target compositional canaries. At creation of this report, result was pending; check the recorded run and update this report after independent job review.

These tests do not show a real Aichi opponent choosing an optimally beneficial Articuno/GX Ability. The cross-Store synthetic ID-reuse case is a defensive provenance invariant, and the native suite must preserve the known v8 source/prompt/physical receipt contract. No completed competitive game can follow from the code change alone.

## Benchmark impact

**Zero competitively qualified games; no selected final fixed 60; 29/32 authenticated original name/count lists, missing ranks 23, 25 and 28; 99.5% unproven.** The integrated two-player competence and paper-rules gate remains the controlling criterion.
