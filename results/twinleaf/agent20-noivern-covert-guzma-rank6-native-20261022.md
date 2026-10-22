# Source-print-bound native counterline: rank-6 Guzma redirects past copied Noivern Covert Flight

**Agent 20 | 22 October 2026 | prepared-board, paired native Store mechanics; not a competitively qualified game or a matchup estimate.**

## Question

A Regidrago VSTAR copying Noivern ex PAL's **Covert Flight** prevents damage by the defending Basic Iron Thorns ex on its following turn in previously passing [native controls](agent20-regidrago-noivern-iron-thorns-native-20261021.md). Does an eligible native, paid Guzma play on that genuine following turn redirect the same Volt Cyclone to an unprotected Bench Pokémon, breaking an inference that the copied shield locks Basic-only rank 6 out of useful attack damage?

## Frozen source identity and setup limits

The [published Aichi Top 32 rank-6 60](../aichi-2026/full-decklists.json) is **Kazuma Kashi's Iron Thorns ex** list. The runnable test fails closed unless the manifest contains exactly **4× Iron Thorns ex TWM 77, 3× Guzma BUS 115, 4× Speed Lightning Energy RCL 173, 1× Double Colorless Energy SUM 136**, and sums to 60. The fixed stage uses one of each printed Speed Lightning and DCE on the active source Iron Thorns ex plus one Guzma in the source's hand. An opponent Regidrago VSTAR SIT with Grass, Grass and Fire attached has Noivern ex PAL in its discard pile and a separate Regidrago V SIT on the Bench.

The starting board is explicitly injected with `preparedRegidrago()` and typed native `PokemonCardList` Bench cards. That is **not an opening with actual decks shuffled or dealt**, and the source Energy, donor discard, Regidrago evolution and held Guzma were not gained through realistic setup actions. This is an intentionally bounded test of legality and attack resolution under a physically possible resource configuration, conditioned on those resources existing.

## Paired actual Store sequence

Both arms use a real `AttackAction` for the fully funded Apex Dragon, a native `ChooseAttackPrompt` selection of printed Covert Flight, actual `WaitPrompt` resolution and a checked native handoff to turn 5 with source seat 1 active. Covert Flight deals 70 to Iron Thorns and establishes the protective effect on Regidrago VSTAR.

- **Control:** Source holds Guzma but does not play it. The real next-turn Iron Thorns ex `Volt Cyclone` is accepted, and its native damage to the Covert-protected Active Regidrago VSTAR is **0**.
- **Treatment:** The same source turn plays the held Guzma through the native `PlayCardAction`, resolves the Store-issued `ChoosePokemonPrompt` with the **opponent's publicly visible Benched Regidrago V**, and then uses the same paid `Volt Cyclone`. The prompt validates the target, the source Guzma leaves the source hand, native attack damage to the now Active Regidrago V is **140**, and the original VSTAR remains on the Bench undamaged.

The two branches assert the same printed attackers, source attack, donor and funded resource conditions. Code uses exactly the source-attested Lightning and DCE printing rather than an unrelated Basic Lightning card.

## Executed validation

The fixture and reusable comparison live in [`simulation/twinleaf/apex-noivern-rank6-guzma-contract.cjs`](../../simulation/twinleaf/apex-noivern-rank6-guzma-contract.cjs), added to the **existing manual-only** [`apex-copy-regression.yml`](../../.github/workflows/apex-copy-regression.yml). Pinned Twinleaf vendor commit is `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

- [CI 39708094074](https://github.com/FlareZ123/experiment-01/actions/runs/39708094074) failed on our own initially missing native Bench slot construction. It did not exercise the gust mechanism.
- [CI 39708320523](https://github.com/FlareZ123/experiment-01/actions/runs/39708320523) **passed the full workflow** after constructing a real `PokemonCardList`. However, that historical version used Basic Lightning Energy absent from rank 6, so it is only an engine-mechanics proof.
- [CI 39708979239](https://github.com/FlareZ123/experiment-01/actions/runs/39708979239), checkout `67469a2bc05f97a0b3546887ece6e3b103085a73`, **passed the targeted compiled native Guzma step** with source-correct Speed Lightning Energy and runtime source-60 count assertions. The full workflow conclusion is separately tracked and must be checked; targeted native success already establishes the narrow reported contrast.

## Decision relevance and limits

**Regidrago's copied Covert Flight is not an unconditional defense against the rank-6 field source if a vulnerable Benched Pokémon exists and the source can spend Guzma on the next turn.** This shows a concrete, source-listed counteraction that an opponent policy ought to evaluate, rather than inferring an automatically blocked attack from the protected Active slot. It does not establish that Guzma is held, unprized, affordable after competing Supporter plans, or better than another available turn action. It does not establish the likelihood of the protection or gust board, damage-to-Prize conversion, follow-up KO, field matchup strength, paper clock outcome or any 99.5% win-rate claim.

A subsequent source-dealt test should condition on a naturally observed paid Noivern copy and a genuine source-owned post-copy Guzma opportunity, then evaluate the owner-visible decision against at least one alternative. Record accepted physical targets and public damage/prizes, source continuation, full 60 identity and *all* failed/capped arms using the common bilateral evidence protocol. Avoid selectively counting a favorable prepared board or a retrospectively selected deal as a competitive win.

**Overall project status at this checkpoint: 29/32 exact source 60s recovered (ranks 23, 25, 28 missing); 0 competitively qualified games; no validated single 99.5% deck.**
