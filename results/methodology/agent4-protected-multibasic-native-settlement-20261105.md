# Agent4: protected-entry multi-Basic setup requires exact native settlement and single physical custody

**5 November 2026.** A developmental native settlement correction to Agent50's protected-entry setup proposal. It does **not** select this policy for Issue #25, validate in-turn one-shot Ability strategy, or establish a competitive result.

## Why the correction matters

The proposed `simulation/twinleaf/agent50-owner-protected-multibasic-store.cjs` retains an opening Basic with a printed “when played from hand onto Bench during your turn” Ability, selects eligible other Basics as Active and Bench, and declines a post-mulligan optional extra Bench placement. The original v1 counted nonthrowing native `Store.dispatch(ResolvePromptAction)` as accepted before checking zones. For the optional min=0 decline, unchanged physical owner zones are **also** the expected valid outcome. A silent native Store no-op could be misclassified as accepted if it never consumed the original prompt.

The revised `agent50-owner-protected-multibasic-native-store-v2-settlement` captures the **original pending native prompt object**, the **snapshot of exact selected owner physical cards**, and its original seat. It classifies a genuine settlement only when that prompt was pending before dispatch and its `result` after dispatch contains the original selected physical Cards in the original order. Native returns that remove a settled prompt remain accepted. A silent no-op, stale response or removed-without-resolution prompt causes `OWNER_PROTECTED_MULTIBASIC_UNSETTLED` and cannot increment `accepted`.

Following actual prompt settlement, initial setup additionally verifies the original first Basic moved to Active, every other selected Basic occupies exactly one owner Bench slot, all selected physical cards left the owner's hand, the chosen Active was not duplicated on Bench, the Benched Basics are not in Active, and protected trigger Basics remain in hand. For a declined min=0 bonus Bench, the original hand remains in order and all Active/Bench slots remain unchanged (a legitimate first-turn topdeck may be appended). A resolved prompt without the expected physical transfers is separately counted as `physicalVerificationFailed`. Audit fields now segregate `returnedWithoutThrow`, `settled`, `unsettled`, `physicalVerificationFailed`, `accepted`, `rejected`.

## Evidence

- Updated [protected-entry Store adapter](../../simulation/twinleaf/agent50-owner-protected-multibasic-store.cjs), commit `196f80e0ad83695b3d36c07258795a293a99fd3f`.
- [Agent4 both-seat adversarial tests](../../tests/agent4-protected-multibasic-settlement.test.cjs), commit `07989966178a5a8146ea9219ec75e0365421852c`. They cover actual min1 with two nonprotected Basics and a retained Dedenne-GX, optional min0, real settlement with prompt removal, nonthrowing silent no-op, disappearance, native-mutated answer, and defined prompt-result without physical placement or with the same Card remaining duplicated in hand. Opponent unseen-hand identities do not enter the chooser.
- Existing [Agent50 actual original rank4 source-store fixtures](../../tests/agent50-owner-protected-multibasic-store.native.test.cjs): three predeclared rank4 full source and contender 60 contexts, both physical seats represented, already calibrated source hand/support retention and exact Active/Bench zones. Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, outer fail-closed raw decoder quarantine.
- **Executed:** [existing manual Twinleaf completion CI42052688238](https://github.com/FlareZ123/experiment-01/actions/runs/42052688238), head `30f4ddc3727e4fcb3017313fcb1f05756bce5ee2`, **whole workflow SUCCESS**. The new pure both-seat controls and the real compiled rank4 protected-entry tests passed. The original Agent4 starting single Basic `v4-snapshotted-custody` test extension for mutable answer and duplicate Active/hand custody also passed in the same job. Earlier [CI42052202698](https://github.com/FlareZ123/experiment-01/actions/runs/42052202698) independently passed v4 starting-Basic controls at head `4d310777`.

No new workflow definition; the existing `twinleaf-completion.yml` abort-provenance manual route adds only two named steps.

## Release implications and limitations

The setup semantics are supported for this opt-in proposed opener. They remain a prerequisite for evaluating a real in-turn Tapu Lele-GX, Crobat V, Dedenne-GX, Eldegoss V, Radiant Eternatus or Articuno-GX trigger. Preserving the hand does not imply the policy will subsequently choose the play or that an Ability lock permits it. A separate matched original-source full-turn comparison is required to show strategic opportunity rather than a pregame-only zone witness. This correction should not silently replace the historical selected Agent50 greedy-all setup in Issue #25.

**Original Aichi source inventory:** 29 authenticated card-name/count 60s, 23/25/28 missing. **Competitively qualified games:** 0. **Selected fixed sixty:** none. **99.5% evidence:** none.
