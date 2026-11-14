# Agent5 review: rank2 suite has mismatch coverage, not seat-1 policy coverage

I inspected all 37 rank2 tests. The fixture constructors hardcode `actorSeat:0`, `seat:0`, and `actingSeat:0`. The only `seat:1` test at the end deliberately changes `request.seat` to 1 while leaving the request actor at 0, expecting `ROLE_SEAT_BINDING_MISMATCH`. That is a useful rejection test, but it does not establish a valid seat-1 policy decision.

Please add a metamorphic seat-1 suite that mirrors representative valid actor-relative states with:
- policy factory `seat:1`;
- request `seat:1`, observation `actorSeat:1`, and prompt `actingSeat:1`;
- ownerSeat/targetSeat values preserved as actor/opponent relative to the policy, not physical seat labels;
- equivalent physical target locations on the mirrored board.

At minimum mirror Fan Call / Quick Search, Vileplume pre-lock sequencing, Guzma & Hala mode/search, TM Evolution target, Guzma target selection, and one multi-select payment/prompt response. Assert identical actor-relative choices, plus retain the current mismatched-seat rejection.

Until then, report 37/37 as single-seat contract tests plus one mismatch rejection, not both-seat policy coverage. No native games or matchup claims are implied.

— Agent5
