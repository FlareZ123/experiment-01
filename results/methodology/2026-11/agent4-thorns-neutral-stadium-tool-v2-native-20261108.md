# Agent 4: an owner-public neutral-Stadium/Tool extension for Iron Thorns versus Underworld Door

**8 November 2026. Developmental policy correction, default-off. Zero competitively qualified games.** The unchanged rank-6 original source 60 and original candidate 60s are used throughout; no field win-rate inference is supported.

## Concrete problem

The existing owner-public [v1 Iron Thorns guard](../../../simulation/twinleaf/agent4-underworld-visible-thorns-veto.cjs) correctly declined an unsafe Underworld Door proposal against visibly Active Iron Thorns ex with Initialization, but abstained whenever any Stadium was in play or a Tool was attached to the source VMAX. The abstention covered both potential Ability-changing effects and cards whose printed text has no Ability interaction. That leaves an avoidable native `UNKNOWN_POWER` risk in some otherwise recognizable states.

The [v2 opt-in classifier and reversible native wrapper](../../../simulation/twinleaf/2026-11/agent4-thorns-lock-neutral-stadium-tool-v2.cjs) recognize only exact, closed **native name-and-set labels** for a small class of Ability-neutral effects: `Tropical Beach BWP`, `Temple of Sinnoh ASR`, `Dimension Valley PHF`, `Chaotic Swell CEC`, `Float Stone PLF/BKT`, and `Air Balloon SSH`. The actor-only observation uses native `card.fullName`, which excludes collector numbers. The original physical-print provenance covers BWP 28/50, ASR 155/214, PHF 93, CEC 187, PLF 99, BKT 137 and SSH 156; the label-level guard does not claim to distinguish variants within the same name/set. The Stadium effects concern draw, Special Energy, attack cost, or Stadium replacement; the Tools concern retreat cost. For these exact printings, the observed public board can still satisfy the original v1 lock classifier. The implementation constructs a disposable filtered observation and reuses v1, leaving the actual owner view, Store, underlying proposer, and printed cards unchanged. The wrapper is reversible, handles native exceptions, and reports proposal and veto counts.

**Abstentions are intentional.** `Path to the Peak` and `Silent Lab` can suppress Iron Thorns's own Ability, while `Stealthy Hood` can protect its holder from opposing Ability effects. They are not eligible for the same inference. Unknown printing labels, mixed known/unknown Stadiums, altered source Pokémon, and absent visible opposing Initialization remain conservatively unmodified. This is a rules-and-card-text-defined whitelist, not proof of compatibility with every game effect.

## Executed checks

**Correction during integration:** the initial pure whitelist specified collector numbers that the actual native owner observation does not expose, so its apparent neutral-card positives were unreachable in real actor states. After auditing `actor-observation-contract.cjs`, Agent 4 changed the whitelist to exact native name-plus-set strings, kept the physical-print provenance explicit, and updated the pure and staged tests. The pre-correction [first native staged test run 42534021328](https://github.com/FlareZ123/experiment-01/actions/runs/42534021328) had four of five native joint fixtures pass, with its sole test failure at the expected v2 label mismatch. That failure is preserved as negative integration evidence; the corrected exact-label rerun is tracked separately.

The [seven owner-public regression tests](../../../tests/2026-11/agent4-thorns-lock-neutral-stadium-tool-v2.test.cjs) all passed in manual-only [pure CI run 42533239030](https://github.com/FlareZ123/experiment-01/actions/runs/42533239030). They cover v1 compatibility, a known neutral Stadium-plus-Tool example, each whitelisted print family, Ability-changing exclusions, unknown-print abstention, actual reversible wrapper ownership, and restoration on a thrown native error.

The [native integration runner](../../../simulation/evaluation/2026-11/agent4-thorns-neutral-v2-holdout-16.cjs) reused the exact pre-existing [rank-6 independent four-seed holdout registration](../../aichi-2026/registrations/agent4-rank6-underworld-visible-guard-holdout-16-v1-20261106.json). The seeds were previously registered, so this is an **integration regression, not an independent new holdout**. It conducted eight unguarded original-policy games and eight v2 games from the corresponding identical physical starting deals, with the original rank-6 Iron Thorns 60 against the existing rank-1 Shadow Rider reference and New Moon candidate 60s. Pinned Twinleaf revision: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; same current research code on both arms, 180 native accepted-root cap. Native [run 42533416809](https://github.com/FlareZ123/experiment-01/actions/runs/42533416809), archive [13638103445](https://github.com/FlareZ123/experiment-01/actions/runs/42533416809/artifacts/13638103445), ZIP SHA256 `772fa0b54bf1ea53d3595ffc14ab2c003fb303e2a4478a25a1136eedc2cd5651`, succeeded. The prior 35 regression tests and new seven passed, Twinleaf compiled, and all five native registration/actor-only/physical-deal gates were true.

| Measurement | Observed result |
| --- | --- |
| Native attempts | 16, eight control and eight v2 |
| Reused original random seeds | 4; both registered source/candidate physical orientations |
| Paired initial physical deal gates | 8/8 passed |
| Underworld proposals audited by v2 wrapper | 337 root opportunities; 6 actual lock vetoes |
| Newly admitted neutral-Stadium/Tool vetoes | **0 observed** |
| Native `UNKNOWN_POWER` failures in historical unguarded champion contexts | 2 |
| Same named failures in v2 treatment | 0 |
| Native finished rows | 1 guarded champion seed 701 and an unchanged seed 703 control/treatment; none paper-qualified |
| Competitive-game certifications | **0** |

The v2 guard's six genuine vetoes were **all already covered by v1**: a visibly Active Iron Thorns and an untooled VMAX with no Stadium. Therefore this sample **does not demonstrate any incremental improvement from the whitelist over v1**. It does reproduce v1's historical native failure prevention without breaking exact original holdout starts. In seed 701 champion, unguarded run failed at root 93 while v2 reached a native terminal at root 96; in seed 702 champion, unguarded run failed at root 42 while v2 reached the 180-root cap unfinished. Native terminal results do not establish legal paper gameplay, a strong opposing policy, or any matchup win rate.

## Next necessary decisive check

Stage a real pinned Store case with Active Iron Thorns ex, a functioning Shadow Rider VMAX Underworld Door, and an attached **Float Stone** or in-play **Tropical Beach**. Independently confirm the Ability remains blocked under these printed neutral effects, observe the v1 abstention versus the v2 veto at the exact same owner-visible state, and verify a valid post-veto alternative action. A mixed positive/negative panel with functioning Stealthy Hood or Path to the Peak should confirm that the new classifier does not suppress an actually available Ability. After a genuine positive joint case and end-to-end source continuation, evaluate decision quality and active attacker Energy targeting rather than counting action roots alone.

The Aichi field remains 29/32 authenticated name/count lists; ranks 23, 25 and 28 remain without exact original 60s. Neither the 99.5% aspirational target nor a selected final legal fixed 60 follows from this result.
