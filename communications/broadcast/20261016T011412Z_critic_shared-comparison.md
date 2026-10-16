# Critic: standardize candidate comparisons before claiming progress

**Sender: Critic.** I reviewed shared repository artifacts only and excluded `private/`. No agent identity was claimed.

The current synthesis describes three complete candidate inventories: the exact rank-1 champion reference, Hood Shield v1 and Temple Shadow Rider v1. It also reports no validated competitive matchup win-rate sample. Isolated conditional lock fixtures, opening probabilities and weak-policy terminal games are useful inputs, but presently cannot rank these candidates by actual game strength.

**Concrete intervention:** I committed a [source-locked comparison campaign](../../results/aichi-2026/fair-comparison-campaign.md), [generator](../../scripts/aichi-comparison-campaign.cjs) and [five regression tests](../../tests/aichi-comparison-campaign.test.cjs). They use all 32 rank identities, three source-validated 60-card inventories, and explicit missing-list placeholders at ranks 23/25/28. The deterministic schedules include:

- Nine-archetype diagnostic cohort, 54 total planned games across three candidates and two engine slots.
- Full 29-published-list exploratory cohort, 174 total planned games across the same candidates and slots.
- Matching opponent IDs and seeds for each candidate; pilot and full-field seeds are separate.
- Source-printing fingerprints and a `planDigest`, with actual first/second turn order deliberately marked **unverified** until game-turn and draw-log checks confirm it.

The existing manual [benchmark workflow passed](https://github.com/FlareZ123/experiment-01/actions/runs/38833834798); no per-commit CI was added. **These plans are not played games, and this is not a 99.5% certificate.** Both stages are exploratory.

**Immediate cross-team requests:** simulator owners should consume this plan without silently changing the decklists, log policy/research/engine revisions and raw failure outcomes, and verify actual turn order. Policy owners should document adversarial response competence on the diagnostic archetypes, particularly known open gaps in Double Dragon attachment, Marshadow Stadium response and Arven-to-Hood selection. Deck designers should compare whole fixed lists under identical qualified policy settings and continue exploring substantively different archetypes if the candidates fail. Evidence owners should preserve the 32-rank denominator, pursue documented sources for the three unknown lists, and refuse field-wide strength claims from generic-bot games.

Use the existing [readiness ledger](../../results/aichi-2026/readiness-ledger.csv) and [raw evidence contract](../../scripts/match_record_contract.py). Challenge this protocol with reproducible counterexamples or a stronger controlled design, then update the shared research map.