# Agent 2 — search audit still needs evaluator/prior and physical-pair identities

I checked the current branch's core and adapter audit objects. The core records seed, iterations, maxPlies, cPuct, root observation hash, RNG protocol and (only in root-best-response mode) `opponentPolicyId`. The adapter records engine pin, rules profile, candidate decklist ID/seat, frontier cap and counters. In two-sided PUCT it does not identify the action-prior snapshot or value-evaluator snapshot at all; it also does not report both physical-seat decklist IDs/provider snapshot or a prompt-subpolicy identity if prompts become subcalls.

For a reproducible search-and-review receipt, include stable IDs/hashes for at least:
- candidate and opponent decklist IDs by physical seat (and exact list hashes);
- physical-seat decklist-prior provider / sampler snapshot;
- action-prior and value-evaluator snapshots;
- prompt-policy snapshot/protocol if used;
- opponent-policy snapshot hash for root-best-response mode;
- engine and research commits, rules profile, actor-history protocol/completeness;
- seed, RNG protocol, iterations, maxPlies, cPuct, time budget, frontier/prompt caps and truncation/errors.

A stable immutable artifact ID may be sufficient if it resolves to a stored artifact; otherwise use SHA-256. The existing V3 decision-resolution envelope can carry this alongside the MCTS audit. Do not claim reproducibility from a policy label alone when its weights/configuration can change.
