# Guzma root-to-prompt target continuity gap

**Agent 43, 29 October 2026.** Static code-path audit and deterministic pure regression. This is a policy mismatch witness, separate from actual native rejection or competitive outcomes.

## Reproducible cause

The held-Guzma root selector in `simulation/twinleaf/agent2-held-guzma-mobility-frontier.cjs` returns `{kind:'play-held-guzma-mobility',handIndex,benchIndex,anticipatedMissing}`. It only proposes the scarce Supporter when a publicly invested Bench Pokémon has a shorter Basic Energy path to an eligible damaging attack than the stranded Active. Thus its chosen **benchIndex is part of the intended tactical effect**.

The canonical actor decoder in `simulation/twinleaf/agent34-actor-only-root-policy.cjs` records the root intent, yet its `PlayCardAction` for Guzma uses the generic BOARD target and does not pass the chosen Bench index into the subsequent native `ChoosePokemonPrompt`. The separate chooser in `simulation/twinleaf/agent8-actor-only-choose-pokemon.cjs` has the owner-visible menu and the native eligibility validator, but `chooseActorPokemon()` always picks the first offered physical Pokémon. It has no earlier root intent or planned recipient.

The added [deterministic pure test](../../tests/agent8-actor-only-choose-pokemon.test.cjs) constructs two owner Bench targets: uninvested Crobat V at Bench 0 and invested Oranguru V at Bench 1. The earlier root wants Bench 1; the neutral prompt policy returns menu choice 0. Both individual steps can be locally valid while the combined strategic line fails. This is a **synthetic policy contract counterexample**. It does not claim a specific live Guzma chose the wrong target.

As a separate positive control, the [archived source T9 Guzma replay](../aichi-2026/agent43-sourcefirst-t9-guzma-native-positive-negative-20261029.md) accepted two native choice prompts and performed both original-Store switches on one historical source deal, with physical ID receipts from [compiled CI 40957862570](https://github.com/FlareZ123/experiment-01/actions/runs/40957862570). It happened to promote the first occupied own Bench Pokémon, Oranguru V, and the source still made zero settled attacks before losing. This does not establish generic target fidelity.

## Integration requirement

A robust both-seat actor must carry the owner-authorized root intent across a **real Store-accepted Guzma PlayCardAction** to the correct subsequent own-Bench native prompt, anchored by owner seat and physical game identity. It should match `benchIndex` against the **currently native-validated** owner-visible prompt menu, resolve with the actual physical Pokémon object, and record both expected and actual physical recipient IDs/slots. If the target becomes unavailable, the policy should record the exception and conservatively delegate. The opposing Bench gust target is a separate consequential decision requiring its own plan and evidence.

Simply accepting a Supporter card action does not certify that its intended two-step tactical effect occurred. The root/prompt contract is a qualification prerequisite for meaningful both-seat opponent-pressure evidence.

**Unresolved:** no general target-handoff bridge has been enabled or native-qualified. 29/32 exact original opponent 60s, zero competitively qualified games, no demonstrated 99.5% winner.
