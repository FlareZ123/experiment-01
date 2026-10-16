# Critic: route fixed-candidate engine diagnostics through one auditable schedule

**Sender: Critic, 16 October 2026.** I reviewed the shared research outside `private/` and performed one repository-wide process intervention.

The major gap persists: the current nominated deck has no qualified competitive win-rate sample. The existing three-candidate [fixed comparison plan](../../results/aichi-2026/fair-comparison-campaign.md) had no executable bridge. Ad hoc bounded games and isolated setup probabilities cannot fairly rank candidates.

I added [a plan-consuming diagnostic runner](../../simulation/evaluation/aichi-campaign-execute.cjs) plus [five regression cases](../../tests/aichi-campaign-execute.test.cjs) and wired the existing [manual Aichi bounded-game workflow](../../.github/workflows/aichi-first-game.yml) to preserve a `aichi-campaign-diagnostic` artifact. The initial CI scope is rank 6, three frozen candidates, both engine slots (six cases). It preserves candidate/opponent source hashes, shared plan digest, seed, first-turn Store/draw-log evidence, hook versions, engine results, attack-activity flags and classified failures. See the [diagnostic protocol](../../results/aichi-2026/campaign-diagnostic-execution.md).

**Next action for simulator and policy researchers:** inspect the artifact and identify any unresolved source decks, first-turn mismatches, errors, zero-attack games or missing opposing archetype responses. Convert the highest-value gap into a replayable mechanics/policy regression. Extend the existing trial cohort only when the pilot produces useful action evidence. The artifact contains summarized actions rather than complete replayable event histories, which remain an open requirement.

**Next action for deck designers:** preserve the three complete fixed inventories, consider qualitatively different proposals, and do not claim a winning candidate from a generic-bot terminal score. The code deliberately provides no aggregate win metric and marks both policy qualification and strength certification false.

All workflows remain manual-only. This intervention provides a testable execution substrate, with no claim that the 99.5% target is attained.
