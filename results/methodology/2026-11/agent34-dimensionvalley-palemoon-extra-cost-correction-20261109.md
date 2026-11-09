# Dimension Valley reduces Pale Moon-GX's bonus threshold: pinned native mismatch and scoped correction

**Agent 34 | 9 November 2026 | exact pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` | developmental paper-fidelity finding, zero qualified paper games.**

## Concrete blocked source tactic

Agent11's [actual owner-visible original rank1 turn18 source snapshot](agent11-rank1-t16-energy-drive-eonblade-native-followthrough-20261108.md) shows a Trevenant & Dusknoir-GX SMP Active with no Energy, Dimension Valley PHF in play, an owned discarded Basic Psychic, and a second Basic Psychic in hand. Raihan EVS is owner-held and a prior own Pokémon was knocked out in the preceding opponent turn. Raihan plus the ordinary attachment could leave two Psychic on Trevenant & Dusknoir, enabling a plausible Pale Moon-GX against the opponent's Active Latias ex with three Psychic. That source continuation and its opponent reply are not yet executed; this report resolves one discrete engine-fidelity gate.

The supplied SM217 printed card says Pale Moon-GX costs [P,C] and discards all Energy from the opposing Active if there is at least **one extra Psychic** beyond the attack's cost. Dimension Valley reduces attacks of Psychic Pokémon by one Colorless; the relevant effective cost becomes **[P]**. Thus **two ordinary Basic Psychic** meet the attack and its bonus, while one meets only the basic attack. This is printed-cost reasoning, not a measured win rate.

## Exact engine fault

The [pinned card handler](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/08-sun-and-moon/set-sun-and-moon-promos/trevenant-dusknoir-gx.ts) independently hardcodes `extraEffectCost = [P,P,C]`. It does not dynamically subtract the Stadium's Colorless reduction when checking the optional bonus. Its native ordinary AttackAction still accepts the Stadium-reduced base attack, spends the once-per-game GX and schedules the delayed Knock Out; the opponent's attached Energy incorrectly remains in play.

[Manual native CI 42569524491](https://github.com/FlareZ123/experiment-01/actions/runs/42569524491), pinned at commit `7eff3f875c8e8c861b23819616a9fcd54ae70400`, proved the discrepancy in two independent player seats. The fixture stages Trevenant & Dusknoir-GX, Dimension Valley, one or two Basic Psychic and a Rotom V LOR Active with two Basic Lightning. Two one-Psychic controls passed (bonus absent); both two-Psychic expectations **failed with 2 opposing Energy remaining when paper required 0**. All 32 preceding Pale Moon effect, lifecycle and Item-caller tests passed. The job's 34/36 is an expected *negative-engine witness*, and the two failures are preserved rather than reclassified as an operational fault.

## Research-owned correction

New [opt-in reversible adapter](../../../simulation/twinleaf/pale-moon-dimension-valley-bonus.cjs) wraps only the pinned Trevenant & Dusknoir-GX card's `reduceEffect` during a scoped invocation. It first runs the original handler and retains its GX-accounting, delayed-KO, action acceptance and normal attack result. For the exact printed card, active Dimension Valley, a genuinely used Pale Moon-GX and effective provided Energy satisfying [P,P] but **not** the old [P,P,C] threshold, it invokes the engine's own `CheckProvidedEnergyEffect` and `DiscardCardsEffect` to supply the omitted opposing Energy discard. The original handler descriptor is restored through `finally`; the vendor submodule is untouched.

[Corrected manual native CI 42569998444](https://github.com/FlareZ123/experiment-01/actions/runs/42569998444), frozen code `7ed4a5727244ac47592b0554ee98fc77938edbfe`, **SUCCESS: 44/44 dedicated native tests**. In both seats:

| Dimension Valley | Attached Basic Psychic | Uncorrected opposing Energy after GX | Corrected opposing Energy | Hook count |
| --- | ---: | ---: | ---: | ---: |
| Yes | 1 | 2 | 2 | 0 |
| Yes | 2 | **2 (paper mismatch)** | **0** | 1 |
| Yes | 3 | 0 (native bonus already runs) | 0 | 0 |
| No | 2 | 2 | 2 | 0 |

The test asserts genuine Native Store `AttackAction`, spent GX, one queued delayed KO, exactly two discarded physical defender cards in the corrected two-Psychic case, original handler restoration and no correction without the Stadium. Code and test: [native fixture](../../../tests/agent34-pale-moon-gx-native-gate.test.cjs). This is a precise paper-semantics correction with separately preserved native negative and positive controls. It is **not** enabled in the shared release, and the regression is only a staged established-board experiment.

## Practical next step and boundaries

Extend Agent11's existing same-branch original rank1 source native clone with real owner-issued Raihan EVS, its native searched-card choice, the discarded Basic Psychic attachment, the held Basic Psychic normal attachment, genuine paid GX and the required opponent's next-turn continuation. Maintain the frozen original source deal, owner-only information, and opponent choice. Run the branch with and without this scoped fix, keeping the skipped native payoff distinguishable. Do not infer whether voluntarily losing Tapu Lele-GX to enable this line is strategically better until both alternatives and the subsequent Prize state are compared.

The adapter's newer revision queries the pinned `CheckAttackCostEffect` for the attack's effective cost before adding the printed one extra Psychic; this avoids a hard-coded reduced `[P]` assumption when concurrent modifiers are present. It still requires future independent tests for combined surcharges, additional reductions, Stadium neutralization, Special Energy providers, copied attacks, and unusual event ordering. **[Third existing native workflow 42570513174](https://github.com/FlareZ123/experiment-01/actions/runs/42570513174) succeeded** at head `c735f0226a7ffffc25e653887a67a91e3831e19a`, with 44/44 original and corrected stage tests green under that dynamic-cost implementation. No shared bilateral-release profile has enabled it. New cases require additional native positive and negative fixtures. Nothing here establishes a 60-card advantage, a qualified paper game, or the 99.5% field objective. The source benchmark still has 29/32 authenticated original deck inventories, with ranks 23/25/28 absent.
