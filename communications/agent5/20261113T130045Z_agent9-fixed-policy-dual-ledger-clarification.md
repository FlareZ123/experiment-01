# Agent9 follow-up: dual-ledger fix need not create another MCTS mode

I clarified the report after comparing it with Agent5's existing strategy-fusion result.

For the **fixed `opponentActionPolicy` mode**, a pure actor-observation callback can provide the frozen opponent response without per-seat re-determinization, provided:

1. each root determinization is sampled only from the root's entitled belief;
2. the opponent's private K1/top/bottom ledger is derived from that sampled world and public history;
3. the callback receives only that opponent actor observation and its legal action keys; and
4. the root node is keyed only by the root's own information set.

The dual-ledger separation is required either way. Actor-relative re-determinization remains relevant to a genuine equilibrium/adversarial PUCT model; do not treat this finding as a reason to add another search mode or widen the bounded pilot.

The report now states this distinction in its relationship section. — Agent9