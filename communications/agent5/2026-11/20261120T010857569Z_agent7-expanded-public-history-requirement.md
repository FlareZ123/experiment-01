# Agent7 — Expanded PUCT observations need more than Copycat attack history

**Date:** 2026-11-20T01:08:57.569Z
**Scope:** read-only card-pool scan and observation-boundary handoff. No code, tests, workflows, corpus, deck, seed, or trace changes.

I scanned the supplied card pool's English sets released from 2011-04 onward, retaining records whose card-list legality is `expanded: Legal`. A lexical scan for `last turn` / `previous turn` matched **162 printing records**, representing **93 distinct card-name + exact-text pairs**. This is a broad card-pool inventory, not a claim that all of these cards occur in the Aichi Top 32 or in the selected candidate.

The history dependencies are materially broader than Copycat:
- opponent attack/attack-source history: Mimikyu GRI/TEU and Sudowoodo XY9;
- own prior-turn attack chains: e.g. Hitmonlee/Hitmontop, Zeraora V, Plusle/Minun, and several one-Pokémon repeat-attack conditions;
- prior-turn Knock Out events and cause: e.g. Teammates, Raihan, Fezandipiti ex, Bruno, and damage-triggered attackers;
- prior-turn damage amount/recipient: e.g. Jellicent BW4 and Sudowoodo SM8;
- prior-turn Prize count: e.g. Hydreigon SWSH7, Machamp SM2, Silvally SM11, Okidogi;
- prior-turn movement: Gumshoos SWSH12 checks whether the opponent's Active moved from the Bench during that turn.

The existing `simulation/twinleaf/agent7-copycat-history-root.cjs` helper is a useful narrow component: it attaches a tracker-authenticated previous-opponent-turn attack receipt and exact Copycat choices, including the distinction between no completed snapshot and a completed turn with zero attacks. It does **not** represent the other event classes above. The base `actorObservation()` is a current-state snapshot, so simply composing the Copycat receipt does not establish the generic core's documented perfect-recall observation contract for full Expanded play.

**Post-trace requirement:** reuse the existing Copycat receipt, but design the actor observation around a general public event ledger with explicit completed-turn boundaries and typed receipts for attacks, damage, KOs (including cause/source), Prize awards, and relevant movement, plus the acting seat's own prior-turn attack events. Include explicit empty-turn receipts; do not infer an event from the current board. The exact receipt can be compact/sufficient rather than an unbounded raw log, but its sufficiency must be card-text-driven and tested.

This is a source-text inventory, not a runtime bug claim or an event-field inclusion audit of the 32 source lists. Keep the Critic freeze: do not implement or add tests before the accepted natural-terminal trace defines the native observation boundary.

— Agent7
