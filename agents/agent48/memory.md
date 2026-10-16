# Agent 48 research continuity

## Identity and scope
Claimed 2026-10-16T02:44:18.335Z, run ID `harumi-research-20261016-0244-agent48`. Normal research mode selected by actual initial random draw of 6. Research goal is one fixed legal paper Expanded 60-card deck winning 99.5% against Aichi 2026 Top 32; no qualifying win-rate evidence yet. The published rank-1 Shadow Rider list is a reference, and Hood Shield v1 / Temple v1 are fixed challenger proposals. 29/32 exact source lists published; ranks 23,25,28 missing.

## First substantive contribution: campaign diagnostic integrity
`scripts/aichi-comparison-campaign.cjs` already generated `independent-slots-v2` campaigns, with distinct RNG seeds for two physical engine slots and matching seeds across three candidate inventories, but `simulation/evaluation/aichi-campaign-execute.cjs` accepted only schema v1. In addition, it trusted a stored planDigest without validating a modified schedule. This is a serious provenance and pseudoreplication trap, separate from the older `simulation/evaluation/aichi-campaign-runner.cjs`, which already reconstructs its schedule.

I updated the bounded diagnostic to accept v1/v2; check seed protocol and full plan SHA-256; prevalidate pilot trial ID, rank, repeat, slot, candidate digest, formula-derived seed and first-turn placeholder before any engine call; and emit schema/protocol fields. The main script defaults to archival paired-slot v1 and can opt into v2 with `AICHI_DIAGNOSTIC_SEED_PROTOCOL=independent-slots-v2`.

Added `tests/aichi-campaign-seed-v2.test.cjs` (four cases), adjusted legacy test for earlier fail-closed tamper rejection; included suite in manual benchmark CI and bounded game CI; manual game workflow rank-6 diagnostic explicitly uses v2. Manual benchmark run [38842388341](https://github.com/FlareZ123/experiment-01/actions/runs/38842388341) passed.

The research report is `results/aichi-2026/agent48-independent-seed-diagnostic.md` and it is linked in `results/README.md`; broadcast `communications/broadcast/20261016T0253Z_agent48_independent-slot-diagnostics.md`. All pushed as normal Agent 48 commits.

## Pending verification
I triggered the manual `aichi-first-game.yml` workflow around 02:50 UTC after configuring v2. Multiple concurrent agents triggered the same workflow. Find the run whose head includes commit `33475d01b7edc74dbc019a98049a08f4191e3033` or later and verify six-trial artifact's `campaignSchemaVersion: 2`, `seedProtocol: independent-slots-v2`, seeds in slot A/B independently assigned. Do not interpret terminal outcomes as wins: documented generic bot policy has hidden-order information leakage, Supporter and Double Dragon attachment gaps, and unqualified strategic decision making. Real paper 99.5% remains unmet.

## Other high-value candidate work
Source-audit missing list 25 (Kazuki Kumegawa/kume) has a paywalled first-person Japanese note `https://note.com/kume_pokeca/n/n6cfd126f5774` with freely visible strategic preparation and tournament results, but full 60 list is unavailable. Rank28 Replica, social handle `@nnaacc5_uec`, reported Top32 Regidrago; exact list also unavailable. Consult existing `results/aichi-2026/rank25-source-scout.md` before duplicating. Other agents are working on rival research simultaneously; inspect new broadcasts and collaborate as useful.

## Process guidance
Use GitHub MCP via `functions.exec`: `tools.mcp__GitHub__fetch_file`, `update_file`, `create_file`, `fetch`. GitHub GraphQL and safety check errors occur intermittently; refresh and retry. Local container has no GitHub DNS. For workflow logs use GitHub Actions MCP and short tails. Do not create per-commit CI workflows. Update this memory and results after additional findings. Only voluntarily release identity after measuring >=70 minutes from original lease; release is final GitHub operation.
