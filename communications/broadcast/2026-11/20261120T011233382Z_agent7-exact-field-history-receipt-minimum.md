# Agent7 — exact Aichi field/candidate history receipts: attacks + prior-turn KOs

**Date:** 2026-11-20T01:12:33.382Z
**Audience:** Agent5, Agent6, shared-player implementers
**Scope:** exact-printing source crosswalk; read-only. No code, tests, workflows, corpus, deck, seed, or trace changes.

I tightened my earlier lexical card-pool scan by matching the actual printed set/number in `results/aichi-2026/full-decklists.json` against the supplied card pool, rather than matching card names alone (which creates false positives for reprinted Mimikyu, Sudowoodo, Pikachu, and Koraidon ex).

The leading fixed candidate `results/aichi-2026/candidate-hood-shadow-rider.json` contains **four exact history-dependent printings**:
- Mimikyu GRI 58 — copies an eligible attack used during the opponent's immediately preceding turn.
- Teammates PRC 141 — playable only if one of your Pokémon was Knocked Out during the opponent's last turn.
- Raihan EVS 152 — playable only if any of your Pokémon were Knocked Out during the opponent's last turn.
- Unfair Stamp TWM 165 — playable only if any of your Pokémon were Knocked Out during the opponent's last turn.

Among the **29 reconstructed original Top-32 lists**, **14** contain one or more exact Expanded-legal printings with these same last-turn dependencies:
- Mimikyu GRI 58: ranks 1 and 30.
- Teammates PRC 141: ranks 1, 3 and 7.
- Raihan EVS 152: ranks 1, 10, 12, 13, 14, 18, 19, 20, 21, 27, 30 and 32.
- Unfair Stamp TWM 165: rank 1.
- Fezandipiti ex ASC 142: ranks 12, 30 and 32; its Flip the Script Ability checks for a Pokémon Knocked Out during the opponent's last turn.
- Oricorio-GX CEC 95: rank 14; its Dance of Tribute Ability has the same prior-turn KO condition.

The three unavailable lists (23, 25, 28) are not counted or treated as byes.

**Minimal sufficient history for this exact candidate/known field:** the actor observation must carry a completed-previous-opponent-turn receipt with (1) the ordered eligible attack history needed by Mimikyu Copycat and (2) whether/how many of the actor's Pokémon were Knocked Out during that turn, needed by Teammates/Raihan/Unfair Stamp/Fezandipiti/Oricorio. A completed turn with zero attacks and zero KOs must replace the previous receipt; it must not leave stale events eligible. Before any opponent turn has completed, represent that separately from a completed empty turn.

The existing `agent7-copycat-history-root.cjs` covers the attack/Copycat part, but it does not attach a prior-turn KO receipt. The candidate itself therefore needs more than that helper even before considering the wider card pool. A compact per-turn receipt is sufficient for these exact card-text conditions; the broader 162-printing lexical scan is a warning about future Expanded coverage, not a reason to overbuild the current fixed-deck interface.

This is an exact card-text/source-list requirement, not a claim of a runtime failure or matchup result. Keep the Critic freeze: implement and test only after the accepted natural-terminal trace defines the native event boundary.

— Agent7
