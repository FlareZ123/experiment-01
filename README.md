# Experiment 01 — Pokémon TCG fixed-60 research

Find one legal, playable English-language paper Expanded 60-card deck capable of a **99.5% field win rate** against the original Aichi Open League 2026 Japanese Extra Top 32. Establish the result through reproducible simulation, independently reviewed deck-aware policies and qualified competitive evidence.

**Start with the [fixed-60 decision board](results/README.md).** It is the authoritative live record of candidate selection, source-list admission, policy competence, execution gates and evidence. Read it before starting research or acting on older reports.

## Benchmark contract

- Use one unchanged Expanded-legal candidate against all 32 original Aichi Japanese Extra source inventories, preserving their exact card identities and counts, including Japanese-only promos. This is the owner-authorized custom cross-format challenge ([issue #59](https://github.com/FlareZ123/experiment-01/issues/59)).
- A strict international Expanded-vs-Expanded comparison is a separate secondary estimand. Keep its results separate.
- Keep source-list authentication, physical-copy certification, simulator compatibility, policy competence and competitive qualification distinct. Missing ranks are unavailable opponents, never byes or substitutes.
- Freeze one candidate policy across the field and one independently assessed opponent policy per rank under common information and compute constraints. Use the registered sampling and qualification rules in the decision board and [field-mean design comparison](results/statistics/field-mean-design-comparison-20261125.md).

## Status at 27 November 2026

| Measure | Status |
| --- | --- |
| Final fixed 60 | Unselected |
| Exact original Aichi lists | 29/32 authenticated (23, 25, 28 missing) |
| Runnable opponent-policy prototypes | 16 ranks; full-game competence unproven |
| Qualified competitive matchups | 0/32 |
| Demonstrated 99.5% field win rate | None |

This table is a dated orientation snapshot. The [live decision board](results/README.md) supersedes it.

## Execution and owner authorization

- **Stage-A:** NOT ACCEPTED; frozen pending the owner's A/B decision in [issue #72](https://github.com/FlareZ123/experiment-01/issues/72). Neither choice authorizes a game.
- **V3:** the separate registered two-game physical-seat-swap fixture requires explicit owner authorization, a configured `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM`, and contract-only plus four-cell native no-game gates on the exact current main SHA with pinned Twinleaf and runner preflight. A fixture is an engineering diagnostic; it contributes no competitive matchup evidence. MCTS integration is independent of this first trace.
- Follow the exact scope of current Critic dispositions for implementation, testing, CI and merge permissions. A local-test approval does not authorize native CI, a merge or a game. See the live board for the current disposition and receipts.

## Repository navigation

| Path | Purpose |
| --- | --- |
| [results/README.md](results/README.md) | Live decisions, all 32 ranks, candidates and current gates |
| [results/aichi-2026/](results/aichi-2026/README.md) | Aichi source lists, provenance and matchup research |
| [results/decks/](results/decks/) | Candidate deck lists |
| [results/methodology/](results/methodology/) and [results/statistics/](results/statistics/) | Evaluation methods, qualification and statistical evidence |
| [simulation/twinleaf/](simulation/twinleaf/) and [simulation/evaluation/](simulation/evaluation/) | Research adapters, policies and evaluation runners |
| [vendor/twinleaf](vendor/twinleaf) | Pinned upstream simulator submodule |
| [tests/](tests/) and [.github/workflows/](.github/workflows/) | Contract tests and existing manual CI entry points |
| [communications/](communications/) | Agent coordination and review dispositions |
| [agents/](agents/) and [resources/](resources/) | Agent work and research resources |

## Research rules

- Name the decision each task can change: implementation gate, source-list admission, policy competence or fixed-60 candidate ranking. Prefer decision-changing evidence to additional infrastructure or duplicate reports.
- Preserve original sources, failed trials, raw ledgers, matched deals and provenance. Update the live board when a decision materially changes; link atomic reports rather than duplicating them.
- Keep research hooks under `simulation/twinleaf/`; preserve the pinned upstream submodule and use existing manually dispatched workflows. Do not introduce per-commit CI, alternate harnesses or redundant workflows.
- Keep policy inputs actor-visible. The owner approved public seed/hash reproducibility; actual hidden-zone contents remain private. Public witness artifacts must use explicit allowlists with approved digests and aggregate statuses. Keep raw actor inputs, full-state traces and private diagnostic payloads encrypted or offline; see the [full-state trace guide](simulation/twinleaf/2026-11/agent45/full-state-trace.md). Never publish a private key or plaintext hidden-zone trace.
- Add new files under monthly or agent/topic namespaces in oversized directories (`results/aichi-2026/`, `tests/`, `simulation/twinleaf/`); use the current monthly broadcast namespace under `communications/broadcast/`. Preserve historical paths and use a complete, non-truncated Git tree inventory for oversized-directory discovery.
- Report fixtures, contract tests, no-game witnesses and competitive results according to their actual evidence class. Never infer a best deck or field win rate from unqualified terminals, selected deals, prompt mocks, action-capped games or incomplete fields.

## History

The previous root README is preserved verbatim in [the 27 November archive](results/archive/root-readme-history-20261127.md). Its relative links work in the [original root-path snapshot](https://github.com/FlareZ123/experiment-01/blob/4c6538639773e5e462bcf51f6d3831586ec7ff76/README.md). Historical instructions and receipts are retained as evidence; current authorization comes from the live decision board and owner/Critic dispositions.
