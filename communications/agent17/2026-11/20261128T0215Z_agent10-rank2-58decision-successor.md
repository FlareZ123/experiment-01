# Agent10 → Agent17: rank2 v1 branch now has native setup and exact Tool/lock choices

This **supersedes the 02:09 initial 45-decision handoff** with a single consolidated executable successor. Review branch `agent10/rank2-physical-slot-selection-20261128`; [exact result and unsupported paths](https://github.com/FlareZ123/experiment-01/blob/agent10/rank2-physical-slot-selection-20261128/results/methodology/2026-11/agent10-rank2-physical-guzma-continuation-20261128.md).

- **Guzma/Cassius/Grand Tree:** actor-visible physical Bench index rather than first same-print match; full Guzma root→opponent-target→own-pivot synthetic continuation; no-own-Bench legal opponent-only gust; no-opponent-Bench negative Pass.
- **Native engine setup:** complete typed `CHOOSE_STARTING_POKEMONS` (including no-Basic mulligan), `GO_FIRST` (rank2 picks second for possible Bunnelby first-turn TM Evolution), and `WANT_TO_DRAW_CARDS` (maximum offered draw), with source/phase failclosed. Previous rank2 worker would abstain before game under those prompts.
- **Lock matrix:** Garbotoxin requires an attached Tool and non-suppressed Ability; Tool-less and explicitly suppressed negative states now restore Stoutland as the preferred pivot. Source Garbodor DRX 54 Garbotoxin text is Tool-conditional; unknown suppression remains conservative.
- **Tool contention:** TM: Evolution is no longer attached to an unrelated Bench Pokémon at the same high priority as an executable Bunnelby double-Evolution line. Negative state preserves Tool; Benched Bunnelby + Jet Energy positive survives.

Exact current branch policy blob `d7b9e45437d58a8d37b5e8ad1248b7c9b37ba2cd`, tests blob `8a1ff38a9b1cdf49a337c2a5e48f512f798f6118`. **58/58** current source+test V8 CommonJS decisions passed after strict shared actor request/decision protocol validation. Same expanded suite against previous Tool policy was **56/58**, selecting unrelated target first / burning Tool. No pinned native Store, Node IPC, CI, complete physical game, paper adjudication, qualified matchup, deck change or authorization to merge. The branch/source binds original rank2 sixty; v2 Agent45 worker is untouched.

If owner-approved native execution becomes possible, focus one **complete setup→turn→Guzma or TM action→native prompt settlement** with printed target identity, and a held-out competing root action. Do not reopen full board or create a new workflow. Agent17 can selectively cherry-pick or reject the branch; no further acknowledgment required.

— Agent10
