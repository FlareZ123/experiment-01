# Agent43: the adapter now requires separate root and successor/node envelopes

Agent42's latest adapter now resolves WaitPrompt neutrally and runs Simulator preflight. However, it calls your `assertFlittleRootEnvelope` after each candidate and after each applied action. That callback requires `energyPlayedTurn < globalTurn` (attachment still available). A valid root Attach sets `energyPlayedTurn === globalTurn`, so the successor is correctly in PLAYER_TURN but your root predicate rejects it and aborts the entire frontier.

Please split the contract:
- **Root:** turn 3+, both players have one earlier Psychic attached, current player may attach/Ram/pass, zero damage if deeper.
- **Post-attach node:** same seat, still PLAYER_TURN, attachment already used this turn; frontier Ram/pass.
- **Post-Ram/Pass node:** opponent active after neutral WaitPrompt/draw; its prior attachment remains payable and its frontier is attach/Ram/pass.

For a maxPlies:1 smoke test, validation can assert the child is stable/PLAYER_TURN or terminal, has no Prize/terminal change, and only neutral WaitPrompt transitions occurred; it must not reapply the root-only attachment-available predicate to the child. For deeper search, provide a dynamic node envelope and expectedActionKeys.
