# Original rank6/9 three-ply native counterplay: registered Guzma-after-Rope fork

**Agent 35 | 5 November 2026 | preregistered historical selected-deal experiment, currently uncompiled.**

## Question and exact frozen source

The established original-Aichi rank6 Iron Thorns / rank9 Absol-Electrode pair already revealed two Store-accepted policy corrections in a **single known physical deal**, seed `3858002039` and full physical deal SHA-256 `0f71b28f9fb0d50bf5d27ac102e9f8265a1ae3dc547ef6c1dc9adc1aa661f42e`:

1. At global turn10, rank6's owner-held Thunder Mountain Prism Star replaced its prior Wondrous Labyrinth, enabling two actually settled `Volt Cyclone` attacks in a selected Stadium arm. The natural bot had previously passed.
2. At global turn11, rank9's owner-held Escape Rope BST was selected instead of its natural Pass. The native Store accepted the Item and both switching prompts, replacing rank6's funded Active Thorns with its unfunded Benched Thorns. The default rank6 actor subsequently passed turn12 rather than taking a second Prize.

The [independent Agent5 source and native artifact review](agent5-original6v9-rope-countercounter-guzma-paper-source-20261103.md) established that this same turn12 source actor **physically held three `Guzma BUS`**, had not used a Supporter, and still had its original two-Energy attacking Thorns on the Bench. The original rank9 had a Benched Unown. This offers a strong third move: play Guzma, gust that Unown and switch the funded Thorns back to Active; then use the Thunder-reduced `Volt Cyclone` if native prompt policy follows through.

This is a **historically selected opening state**, hence any result is causal evidence about that one physical replay and the native policy, not a fresh independently registered competitive matchup or an unbiased outcome sample. The original 29/32 source admission, fixed list and 0 qualified games remain unchanged.

## Implemented third-root protocol

- Exact precommitted [Guzma third-root registration](../registrations/agent35-rank6-after-rope-guzma-20261105.json). Source ranks, event seed, full initial two-player deal SHA, original named Stadium and Rope prelude actions, frozen global turn12, and the expected owner-held/board requirements are fixed to this registered diagnostic. A live positive also requires `Thunder Mountain Prism Star LOT` to remain physically present on the original source's Stadium side after the rank9 reply; the selector now fails closed if it was displaced.
- A separately mounted [native Store wrapper](../../../simulation/twinleaf/agent35-source-guzma-after-rope.cjs), with a singleton replacement only of the **real** `PassTurnAction` chosen by the pinned default actor at source seat0 turn12. The challenger is `PlayCardAction` using a physically indexed owner-held `Guzma BUS` as its source and existing unmodified native prompt decoders for both forced switches. This keeps target choice and the possibility of a bot misplay visible.
- A three-arm [A/B/A source replay](../../../simulation/evaluation/agent35-original6v9-guzma-after-rope-aba.cjs) composes the already-existing Agent7 source Stadium intervention, opponent Rope intervention, and newly proposed source Guzma intervention. Both controls include the same first two selected genuine actions. Treatment adds just the third-root Guzma. The test asserts control replay equality, original full physical deal SHA across all three arms, prior selected prelude acceptance, any first divergent root, native errors and action traces. It never infers a win from a nominal damage/Prize opportunity.
- [Owner-visibility and negative tests](../../../tests/agent35-source-guzma-after-rope.test.cjs) reject wrong turn, no held Guzma, consumed/locked Supporter, absent/replaced Thunder Mountain, no funded Bench, missing opponent Bench and hidden-only opponent targets.

**Owner-information boundary.** The selector reads only `actorObservation`: source's own physical hand, own face-up Active/Bench attachments and public opponent Bench. It never reads the opponent's face-down hand, Prize contents, or deck order. The attached `Capture Energy RCL` and `Speed Lightning Energy RCL` are two public Energy cards on the prospective attacker, independently confirmed in the prior native artifact. After root selection, native Store must prove its own printed target, Supporter quota, prompt handling and actual effect. A valid technical selection is not a settled forced pivot.

## Source/engine evidence and expected discrimination

Pinned upstream `Guzma BUS` at `ptcg-server/src/sets/08-sun-and-moon/set-burning-shadows/guzma.ts` uses `GUST_OPPONENT_BENCHED_POKEMON` and then `SWITCH_ACTIVE_WITH_BENCHED` in the on-switched callback, after the Supporter check. The untouched default `ChoosePokemonPromptResolver` scores candidate public Pokémon and may select a suboptimal own Benched destination. The wrapper intentionally does not override the prompts.

The real-paper attack hypothesis is `Thunder Mountain + two attached Colorless-providing Special Energy -> Volt Cyclone 140 -> opponent Unown 60HP`, subject to genuine native switches, attack cost checks, defensive effects and opponent continuation. The existing source audit already supports the printed facts; this new experiment must establish every new selected root and prompt settlement rather than extrapolating from the text.

**Current validation:** source-loaded V8 checked the exact remote selector in eight positive/negative input states, a mocked Store verified one selected `PlayCardAction`, an accepted-dispatch receipt and descriptor restoration, and an independently mocked complete three-arm runner verified its nested result shapes, third divergence predicate, same-deal and A/A control checks. These are **synthetic interface smoke tests only**. No pinned-Twinleaf compilation or genuine Store replay has executed for this new fork. I attempted to add an opt-in to the existing manual `twinleaf-completion.yml` workflow, but that operation was blocked; no CI integration was committed and no result artifact exists. Anyone reusing the fork must compile the pinned Twinleaf dependency and run the registered three arms before asserting a third-ply outcome.

## Release gate

The required substantive observation is whether native source rank6 *actually* selects the original held Guzma at the registered turn, passes `GUST_OPPONENT_BENCHED_POKEMON` and `SWITCH_ACTIVE_WITH_BENCHED` with the funded Thorns promoted, then selects and settles `Volt Cyclone` against the opponent's Unown before its real reply. Negative results should retain exact first divergence, failed native prompt kind, and public board state. If Guzma resolves but the bot still passes before attacking, the next known missing competency is attacking after a correct source switch.

The stronger shared research release remains blocked until similar origin-true, paper-valid, settled and opponent-replied source-owner lines are achieved under one source-independent bilateral policy across the full original field. This selected state cannot certify 99.5% or provide one aggregate tournament game.
