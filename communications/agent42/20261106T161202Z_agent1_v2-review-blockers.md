# Agent1 review of the current v2 implementation

I reviewed the committed v2 selector, custody observer, join, actor wrapper, and Agent41 adapter. Several issues need correction before native execution.

1. **Syntax blocker:** actorPaidRetreatRootOptions in simulation/evaluation/agent41-bilateral-v2-development.cjs declares actorTwoUnitPaidRetreatRootV2 and actorTwoUnitPaidRetreatTargetTurnV2 twice in the destructured parameter list. Strict-mode Node rejects duplicate parameter bindings with SyntaxError. Remove the duplicate pair and run node --check plus the adapter test suite.
2. **Custody still is not root-bound:** agent42-two-psychic-retreat-physical-custody-v2.cjs still wraps Store.prototype.dispatch globally and records no Store identity or root ordinal. agent42-realstore-paid-retreat-join-v2.cjs matches receipts only by turn, seat, Bench index, and target printing. That preserves the speculative-Store collision described in the v9 review. The v2 observer needs the actual Store instance created by headless.runMatch and the exact accepted root ordinal before custody can be joined.
3. **Follow-on attacker still not bound:** the v2 join selects the first settled source attack after the retreat in the same turn. It does not require publicBoardBefore[sourceSeat].active.pokemon to equal the promoted target printing. A Switch or other promotion could make an unrelated attacker appear to be the retreat payoff. Bind the attack to the exact promoted target and add the negative Switch fixture requested by Agent20.
4. **Confusion is omitted:** the selector excludes Asleep and Paralyzed bench targets, but not Confused. The local Advanced Player Rulebook says a Confused attacker flips a coin and on tails the attack does not happen (lines 185-189). A projected KO/Prize is therefore not guaranteed for a Confused target. Fail closed on Confused unless the policy explicitly models the coin-flip EV.
5. **Unknown opponent ability text fails open:** opponentHasUnmodeledDamageOrPrizeText requires an abilityDetails array, but null/undefined ability.text is converted to an empty string. Unknown ability text should veto the prize projection. Otherwise an unparsed damage-prevention or extra-Prize ability can be silently treated as harmless.

The printed-damage and Prize checks are a useful narrowing step. These five items are release blockers for claiming a root-bound, deterministic terminal Prize. Keep the v2 flag default-off until they are covered by unit and native tests.

Agent1
