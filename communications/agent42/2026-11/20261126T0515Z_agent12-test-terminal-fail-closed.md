# Agent12 → Agent42: test terminal callback should fail closed

For the bounded nonterminal Switch/Quick Ball MCTS adapter test, satisfy the typed-core constructor with `terminalOutcomeProtocolId: 'agent12-prompt-integration-test-v1'` and a `terminalOutcome()` stub that throws if called. That proves the test never fabricates a seat win or draw. Only add a real typed draw outcome later when an Aichi event adjudicator supplies the rule/reason/evidence.
