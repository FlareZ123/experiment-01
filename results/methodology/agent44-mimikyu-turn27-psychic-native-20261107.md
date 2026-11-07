# Mimikyu turn-27 Copycat: known Psychic payment and native owner Bench targeting

**Agent 44 | 7 November 2026 | staged native Store regression, not a completed match.**

## Question

The source-locked turn-27 response helper previously promoted a Benched `Mimikyu GRI` whenever two Energy cards were attached, although Copycat's own printed cost is Psychic + Colorless. A Mimikyu holding only two Darkness Energy would be incorrectly treated as funded. The prior Active-vs-Bench index guard eliminated another malformed target, yet neither correction had demonstrated actor-relative placement or Latias ex's zero-cost retreat in a real pinned Store.

## Implemented guard and regression

- `simulation/twinleaf/mimikyu-source-turn27-setup.cjs` now requires **two attached Energy cards and at least one known Basic Psychic Energy** before its source-locked tactic claims Copycat ready or attempts to promote the Benched Mimikyu. This is a deliberately conservative proxy. The native attack-cost validator retains authority over Special Energy, Stadium modifiers, and all actual copied-attack payments.
- `tests/mimikyu-source-turn27-setup.test.cjs` exercises two attached Darkness Energy with a held Psychic: it chooses attachment. With no Psychic to attach, it must decline promotion. With one Psychic plus one Darkness, it permits promotion. The existing Active Mimikyu negative-Bench-index regression remains.
- The new `simulation/twinleaf/agent44-mimikyu-turn27-payment-native.cjs` and `tests/agent44-mimikyu-turn27-payment-native.test.cjs` stage the original printed Mimikyu, Latias ex and two real Basic Psychic Energy objects under both physical player seats. A real `PlayCardAction` must attach the held Psychic card to the **acting owner's Mimikyu Bench slot**, remove it from the owner's hand, preserve the original attached Psychic object, and leave the opponent's Active untouched. A subsequent real `RetreatAction` must promote that Mimikyu from Bench index 1 for no discarded Energy while Latias ex is in play. The physical cards and acting-side assignments are asserted after each accepted Store dispatch.

## Verification

The fixed upstream submodule is `vendor/twinleaf` at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The native two-seat test was added to the **existing manually dispatched** `twinleaf-smoke.yml` check 02. In [run 42344122658](https://github.com/FlareZ123/experiment-01/actions/runs/42344122658), compiled-upstream smoke **step 8 succeeded** and the **full manual workflow concluded SUCCESS with all 39 independent smoke checks passing** on head `3ec3a0a723b53f9116c8ef558f54918b3a435ae4`. The completed run's conclusion and tested commit were independently checked via GitHub Actions. No on-push CI, vendor source, fixed 60, or shared bilateral policy was changed.

## What remains unproven

The underlying Regidrago Apex Dragon declaration was **injected** as last-attack history. This verifies a subsequent owner action sequence under a constructed board; it does not replay an authentic full preceding attack or the Mysterious Treasure/Night Stretcher prompt chain. The two-seat checks confirm target and retreat semantics in this engineered state, with no Ability-locking or Tool/Stadium disruption, but do not imply the line survives every opposing board.

The conservative count guard misses legal cases where **Dimension Valley reduces a Psychic Pokémon's attack by one Colorless**, allowing Copycat with just a single Psychic. The helper also does not model arbitrary Special Energy and their possible restrictions. These deliberate coverage limits need an actor-visible, paper-safe cost evaluator before general policy use. The copied Apex/Timeless/GX settlement is separately researched in `results/twinleaf/mimikyu-apex-copycat-audit.md` and remains opt-in. There is no natural shuffled-60 match or adversarial two-sided continuation here.

**Evidence classification:** staged source-specific native mechanic and pure payment regression. **Competitively qualified games: zero.** No deck-strength or 99.5% claim follows.
