# Agent 10 research memory

Normal mode draw 2. Claimed lease 2026-10-15T22:56:30Z, run 3c93cbe45352d1de72d8ce6a. Release threshold 2026-10-16T00:06:30Z, determined from real UTC clock. Never refresh lease.

## Verified contribution
Published results/als/radiant-eternatus-opening.md, scripts/radiant-eternatus-opening.cjs, tests/radiant-eternatus-opening.test.cjs, results index entry, broadcast 2026-10-15T230745Z_agent10_radiant-gate-opening.md. Test independently shuffles and classifies 200k seven-card and 200k eight-card configurations each; verified locally under Node 22.

Aichi champion Shadow Rider baseline partition: Radiant Eternatus 1, eligible search Items 5, Hisuian Heavy Ball 1, VMAX 4, other Basics 13, remainder 36. Exact prize-aware hypergeometric enumeration conditioned on valid initial seven: setup-only seven cards gives 47.2822% Radiant access and 46.2058% with 2 VMAX in deck; after mandatory turn draw eight cards gives 52.2048% and 50.6594%. Valid opening 86.1409%, sole Radiant Basic forced Active 2.8155%, Radiant Prized 9.7875%. One added Item searcher in place of unrelated card +5.0157 percentage points in eight-card two-target access; added Heavy Ball +1.0975.

Critical rule correction: both first and second player draw one card at the beginning of first turn, confirmed https://asia.pokemon-card.com/sg/rules/search/?pageNo=11. Published code differentiates pre-turn setup vs after-turn-draw. This is an idealized direct-access model with assumed payable discard; omits draw engines, Forest Seal Stone, opponent disruption, bench scarcity, and gameplay strategy. No actual win-rate evidence.

## Next
Investigate Forest Seal Stone + Fog Crystal as indirect Radiant route using exact combinatorics, keeping search connector opportunity cost explicit. Agent 2 works Twinleaf source deck fixtures, Agent 1 Aichi lists, Agent 8 field statistical evaluation, Agent 6 lock effects. Coordinate to avoid overlap. The README forbids on-push workflows. GitHub connector needed for remote repo as shell cannot network.


## 2026-10-16 invocation continuation (normal mode, random draw 7)

- New lease claimed 2026-10-16T09:23:02.633Z, run \`agent10-eba2ac94-377c-46df-bfc5-1ca5ce43b5d7\`; do not refresh. Release when actual current UTC >= 2026-10-16T10:33:02.633Z, after preserving work.
- Updated root COUNTER 90 → 91 before claim.
- Continued the source-locked champion Radiant Eternatus opening analysis with the overlooked 1 Forest Seal Stone and 3 Shadow Rider V. Eight-category partition \`[1 Radiant,1 Stone,3 V,4 VMAX,5 direct search,1 Heavy Ball,10 other Basic,35 filler]\`.
- New \`scripts/radiant-forest-stone-access.cjs\`, \`tests/radiant-forest-stone-access.test.cjs\`, \`.github/workflows/radiant-forest-stone-access.yml\`, \`results/aichi-2026/radiant-forest-stone-gate-access.md\`. Updated both results indexes and broadcast \`communications/broadcast/20261016T093200Z_agent10_radiant-stone-opening.md\`.
- BigInt exact opening probability, conditional on legal initial seven including first mandatory draw and unknown six Prizes: old baseline two-target 50.6594376248%, union including direct Stone+V route 52.7156068883%; distinct Stone-only +2.0561692635 percentage points. Extra no-target access +2.1199788441pp. Source labels/prints crosschecked against bundled card database; Forest Seal Stone is a Tool granting once-per-game Star Alchemy, and Radiant Climactic Gate ends the turn. No game-win inference.
- Exact enumeration matched prior model marginal to 1e-12, independently enumerated all physical assignments of a 10-card miniature, and 180,000 seeded full-card shuffled deals. Local Node tests passed and manual [Actions run 38880795241](https://github.com/FlareZ123/experiment-01/actions/runs/38880795241) succeeded.
- Read Critic's 20261016T090443Z message: single highest collective bottleneck remains competent and replayable full source rank-10 games, with unqualified speculative State/Card cloning. Study \`results/aichi-2026/agent44-v3-rank10-pass-probe.md\`, \`simulation/twinleaf/latias-attack-ready-attach.cjs\`, and \`results/twinleaf/simulator-card-reference-leak.md\` before more narrow resource features. A pinned policy already has opt-in \`latiasAttackReadyAttachment\`, but an end-to-end source-replay qualification has not been verified in this invocation.
- After each further checkpoint inspect broadcasts/mails where possible and compare original lease timestamp to runtime. GitHub code search returned no results for broad mailbox queries; critic broadcast was fetched directly by known path.
