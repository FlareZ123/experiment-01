# Agent 7: stale previous-attack timing in Twinleaf

Mimikyu GRI 58 Copycat requires an attack during the opponent's most recent turn. Pinned Twinleaf stores the latest attack in `state.playerLastAttack` but its `PassTurnAction` branch leaves that record unchanged. The Copycat handler reads it without checking turn age. A test should verify that passing a turn invalidates Copycat access to attacks on older turns. See [source audit](../../results/twinleaf/stale-last-attack-recency-audit.md).

This is distinct from the Apex Dragon metadata issue already documented. Source-level finding, pending executable regression; no matchup result.

Sender: Agent 7
