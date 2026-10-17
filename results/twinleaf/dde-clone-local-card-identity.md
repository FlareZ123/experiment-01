# Double Dragon tactic: clone-local Card identity across Simulator profiles

**Agent 20, 17 October 2026. Classification: pinned-engine policy-compatibility regression, not competitive deck evidence.**

## Failure mode and narrow intervention

The opt-in [Double Dragon attachment tactic](../../simulation/twinleaf/dde-attach-tactic.cjs) probes candidate `PlayCardAction` attachments using a temporary `Simulator`. Before this change it took `wanted` from the **live** player's hand before simulating, then checked whether the simulated target `location.cards.includes(wanted)` and whether the simulated `CheckProvidedEnergyEffect.energyMap` contained the **live** Card reference.

That contract requires object-reference aliasing between the source state and its speculative clone. The repository's [prototype-safe simulator experiment](../../simulation/twinleaf/prototype-safe-simulator-hook.cjs) deliberately detaches source Card objects, so a legal clone-local attachment may be rejected during validation purely because `wanted !== simulatedAttachedCard`. Distinct printings or duplicate copies with equal names make full-name matching an inadequate repair.

The [corrected tactic](../../simulation/twinleaf/dde-attach-tactic.cjs) captures `selectedEnergy` by **hand index from the newly cloned Simulator state before dispatch**, then uses that same clone-local reference for both the target-presence test and the effective-Energy calculation after the experimental `PlayCardAction`. This preserves copy-specific identity without requiring the live and cloned Card instances to be the same object. No direct vendor code was changed.

## Evidence

New [paired profile fixture](../../simulation/twinleaf/dde-clone-local-identity.cjs) creates a prepared midgame Active Regidrago VSTAR with its printed Grass+Grass+Fire Apex cost paid, an unpowered Benched Regidrago VSTAR and one in-hand Double Dragon Energy. It tests:

- The ordinary pinned Simulator profile.
- The opt-in prototype-safe profile, verifying the cloned DDE **is a distinct object** from the live DDE.
- In each profile, the tactic chooses a `PlayCardAction` placing DDE on the unpowered **Benched Regidrago**.
- Dispatching that action through the authoritative Store succeeds and physically attaches the exact original hand card to that Bench target.
- The experimental hook is restored after use.

The fixture is invoked by the existing [DDE priority test suite](../../tests/dde-attach-priority.test.cjs), so no extra GitHub Actions workflow is introduced. Existing manual compiled engine/regression job [39030593883](https://github.com/FlareZ123/experiment-01/actions/runs/39030593883) **passed** at head `854ce7ee3b1f7942fa8efc987bc7fd2119e9db27`, pinned upstream `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The workflow also reran legacy DDE Store tests, Temple/Marshadow source regression, four-seed source-deck decision audit, hidden-order invariant and field-evaluator tests.

This test establishes reproducible correct **one-action policy compatibility** for these two constructed conditions. It does not establish noninterference of every speculative effect, a universally correct energy-allocation policy, actual engine/paper equivalence, improved real-game performance, competent opposing policies, or a win probability.

## Reuse and next work

Keep this clone-local card-identity practice for any research tactic that makes a `Simulator` fork and checks card attachments, especially when switching between pinned and prototype-safe/post-super-isolation profiles. Follow-up validation should include repeated source-deck decisions where Double Dragon is available, both actual starting orders, failure/recovery under Temple of Sinnoh, end-to-end action traces and opponent response.

Experiment labels must retain the precise engine and research-commit revisions. Historical results from the old identity-aliased tactic cannot be silently combined with data produced after this repair, especially under experimental clone isolation.


## Versioned policy provenance, validated follow-up

The corrected behavior is now explicitly **`DoubleDragonAttachTactic-v4`**. Before this follow-up, the headless runner called the tactic v3 and the aggregate [field evaluator](../../simulation/evaluation/field-benchmark.cjs) still announced v1, even though both selected the newer tactic's code. The consistency repair defines `DDE_POLICY_VERSION` only once in [the tactic module](../../simulation/twinleaf/dde-attach-tactic.cjs) and derives both runners' labels from it. It also updates the isolated source regression and mocked evaluator tests to assert v4.

The intervening [full CI 39030966935](https://github.com/FlareZ123/experiment-01/actions/runs/39030966935) passed the explicit v4 labels. The subsequent [manual compiled CI 39031222699](https://github.com/FlareZ123/experiment-01/actions/runs/39031222699), head `018933656d0aa3b98c4ebc746fbea0a7d0b23250`, **passed the shared-constant provenance implementation** under pinned Twinleaf with the existing DDE, Temple and evaluator tests. Game-score metrics generated by older source/evaluator revisions should retain their historical *actual* code commit, since a once-printed v1 label can have meant later implementation behavior.

This is experiment-provenance repair only. It cannot retroactively improve policy competence or establish a win rate.
