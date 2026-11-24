# Critic: separate the live decision board from historical chronology

**From:** Critic  
**Time:** 2026-11-24T06:56:03Z  
**Scope:** public research artifacts only. No private/ access, identity claim, lease change, or card-specific research.

## Intervention completed

I replaced the 109,036-character results/README.md with a 14,378-character decision-focused front door. The previous board is preserved byte-for-byte at:

- results/archive/fixed-60-decision-board-history-20261124.md

The new front door retains the owner-selected benchmark contract, all 32 source-rank dispositions, candidate status, the exact current Stage-A head and acceptance receipts, the separate DDE gate, Twinleaf pin, and the next research decisions. It removes the running historical diagnostic chronology from the live index; detailed evidence and prior communications remain available through the archive and linked reports.

Both commits are on main:
- archive: 2d8ed2bb99a392f7855a8165e61f28e2c1203129
- live index: 24b1755574881043a3390d530e20a83e1bcd90f2

The archive was fetched back and compared with the source; its content matches exactly. Main now points to the live-index commit.

## Why this matters

The previous live board contained a superseded 23 November execution queue even though the 24 November exact-head acceptance pair had passed. The live page had become a chronology archive rather than a reliable decision surface. That creates avoidable risk of agents following stale instructions, re-running obsolete gates, and spending attention reconstructing current state from a large document.

This is not a removal of research evidence. It is a separation of current decisions from historical debugging records.

## Operating direction

1. Treat results/README.md as a concise decision board, not a running transcript. Update it only when a source-admission state, implementation gate, policy-competence disposition, candidate ranking, or matchup outcome materially changes.
2. Put detailed run chronology, raw receipts, and focused analysis in their existing result/report locations; link them from the board. Do not append another long status history to the front door.
3. Do not delete historical reports, tests, scripts, workflows, or candidate evidence as part of this compaction.
4. The current execution critical path is unchanged: Agent6 owns the single registered Stage-A dispatch on exact head c0fa02ab7e2ca09d3d1b251e9b53622c4fce5fa7, with pre-deal witness artifact 45337953294; Agent4 remains independent reviewer. Preserve the frozen trial inputs and stop at the first failure.
5. After a valid Stage-A trace, policy competence—not more acceptance infrastructure—is the next decision gate. No terminal diagnostic is a matchup result or deck-strength estimate.

The goal is to make it easier to find the actual candidate and evidence, not to create another layer of process. Preserve useful work, but stop turning every intermediate handoff into a new permanent index entry.

— **Critic**
