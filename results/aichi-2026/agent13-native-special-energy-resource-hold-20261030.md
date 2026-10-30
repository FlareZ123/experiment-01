# Legal but unproductive Special Energy: owner-only native hold control

**30 October 2026 | Agent 13 | preregistered staged native two-seat control; no competitive games**

## Research question

The [29 Oct Agent 5 same-root experiment](../twinleaf/agent5-attack-special-priority-native-20261029.md) proves the native Store can attach Double Dragon Energy to an unfunded Regidrago V on the Bench and then use the already-funded Active Gnaw attack. The original first-return action chooser instead attacks immediately. This demonstrates a *positive* attach-before-attack opportunity, while leaving an open failure mode: always attaching before attacking could waste strategically protected Energy.

We preregistered the companion negative-control at [the frozen 30 Oct registration](registrations/agent13-staged-special-energy-resource-hold-20261030.md) **before implementation or CI execution**.

## Fixed same-state native experiment

Both physical owner seats 0 and 1 are tested separately. The underlying pinned Twinleaf Stage uses the original Agent 5 `stage(seat)`: turn 2, Venonat MEW Active with one Psychic Energy SVE, Regidrago V SIT on Bench 1, third Double Dragon Energy ROS in hand, Pidgey MEW opposing Active, six Prizes per player, nonempty decks. The sole new stage condition adds **two physical Double Dragon Energy ROS cards already attached to the Bench Regidrago**.

For each seat:

1. Construct two independent genuine Stores and assert identical detached owner-visible `actorObservation` input.
2. The existing `chooseActorRootIntent` with optional public Special Energy branch selects Venonat's `Gnaw` attack. Independent `choosePublicContextSpecialEnergy` returns `null` because an extra Double Dragon does not reduce either Pokémon's printed attack-cost deficit.
3. **Hold route:** the Store settles `Gnaw` and genuine animation `WaitPrompt` transitions, ends the owner's attack root and leaves the third Double Dragon in hand. The Bench Regidrago retains two.
4. **Spend route, same starting physical state:** direct genuine `PlayCardAction` attaches that third Double Dragon to Bench 1; the actual Store consumes the hand card, places a third Energy on the intended Regidrago, allows further turn actions, and produces `confirmed-public-effect`. The same `Gnaw` attack is then selected and settled. Both branches deal identical positive opponent Active damage.

The native test asserts every fact, including actual attached physical cards and no residual prompts, in both seat orientations.

## Validation

- Test source: `simulation/twinleaf/agent13-staged-energy-hold-native.cjs`, reusing the actual pinned Agent 5 native setup, root observer, public energy-payability chooser and Store action interfaces.
- Existing **manual** `twinleaf-smoke.yml` now executes this as a separate step immediately after `agent13-native-plan-attestation-smoke.cjs`. No new workflow, altered vendor dependency, or expanded game schedule.
- [Native CI 40982510134](https://github.com/FlareZ123/experiment-01/actions/runs/40982510134), checkout `d59823e`: compilation, source identity attestation, and **both-seat legal-but-unproductive Special Energy hold** steps marked **SUCCESS**. The overall workflow may remain red because the later, separate Canceling Cologne sudden-death regression was already failing on prior CI 40981602324 and 40981982259; do not report this workflow as a complete success unless that separate defect is resolved.

## Interpretation

The combined positive and negative controls establish that **action-order arbitration needs a state-dependent resource gate**. The native Store can execute an extra Special Energy attachment in both controls; the chosen action should depend on actual printed attack progress and the resource's future value. Here the optional public-printed chooser sensibly preserves a redundant third Double Dragon rather than burning it by an unconditional attach-first rule. No claim is made that holding is always optimal: future hand resets, Prize threats, opposing Energy removal and other missing context can reverse the strategic preference.

This remains a staged artificial board, without a natural registered source deal, autonomous opponent counterplay, a 60-card game, or the actual Aichi event clock. **29/32 exact opposing original lists; zero qualified games; no validated 99.5% candidate.**
