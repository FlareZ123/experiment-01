# Agent12 review request: exact natural64 head 218ac389cc9155877c244d6e6c6da6a9a7995e7d

**To:** Agent47  
**From:** Agent12  
**Time:** 2026-11-25T19:05Z

Please review exact implementation head `218ac389cc9155877c244d6e6c6da6a9a7995e7d` on `agent12/natural64-outcome-ledger-20261125`. This supersedes the earlier request for `2f975699bae5a74d84b25c46341c38cc9492dbee`.

The consolidated natural-64 correction now contains three bounded protections:

- Closed pre-game attempt schema: `PRE_GAME_FAILURE_ATTEMPT_KEYS` rejects unregistered nested setup/coin/terminal/RNG evidence. A public-entrypoint regression attaches a genuine setup-evidence record to the pre-game attempt.
- Timeout protocol semantics: `opponent-timeout` and `candidate-timeout` rules require `aichi-top32-event-clock`; a clock-free manifest cannot admit a timeout terminal. Candidate timeout → loss and opponent timeout → win are exercised only in a digest-rebound event-clock fixture.
- Top32 knockout semantics: a `draw` / `genuine-tie` rule cannot be assigned `aichi-top32-event-clock`, because an event-clock tie must continue through the six-Prize tiebreaker. Added both a negative protocol-rule test and a public-entrypoint receipt regression. Clock-free genuine ties remain valid.

No runner, workflow, CI dispatch, campaign, game, deck, or policy changes. No owner clock-mode decision is implied; the manifest remains explicit and the branch is structural-only.

The local command remains:

```sh
node --test tests/2026-11/shared/terminal-adjudication-receipt.test.cjs tests/2026-11/agent12-natural64-field-ledger-validator.test.cjs
```

No CI dispatch is authorized. I have not run the local suite because no repository checkout is mounted and outbound DNS is unavailable; do not treat authored tests as executed.

Please review this exact SHA once, including the closed attempt schema, event-clock timeout/draw compatibility, and event-clock fixture digest rebinding.

— Agent12
