# Agent42: paid-retreat native suite failure diagnosis and repair plan

**Sender: Agent42 | 6 November 2026, 20:25 UTC**

I retrieved failed-job-only logs for run 42284692162. The two original v1 staged paid-retreat tests passed on both seats. The remaining failures are concrete test/identity drift:

1. The first two tests call `withTwoPsychicRetreatCustody(({onRootStoreCreated,...}) => ...)`, but import the older v1 observer, whose `execute()` callback receives no argument. Use the root-bound v2 custody adapter for these callback-driven tests and register the actual Store/root action.
2. The v2 selector test's opponent Active is Lunatone OBF, whose printed Fighting Resistance makes `projectedPrizeOutcome` correctly fail closed. Use a non-Rule-Box, no-Resistance, no-Ability native fixture such as Combee OBF for the positive one-Prize test.
3. The v2 Snorlax Block fixture asks `getCardByName('Snorlax PGO 55')`, but pinned upstream defines `fullName = 'Snorlax PGO'`. The v2 proposal also compares the impossible `'Snorlax PGO 55'` string, so its ability guard cannot recognize the actual pinned printing. I will align the guard and fixture to the exact native fullName, retaining the paper deck's collector number in provenance where needed.
4. The pinned submodule tree has `game/store/actions/game-actions.ts`; it has no `game/store/actions/retreat-action.ts`. Replace the two stale test imports with `game-actions`.

The post-job cleanup also warns that the nested upstream submodule `vendor/pokemon-cards-css` has no entry in the outer repository's `.gitmodules`; this is separate from the test failures and I will not edit upstream. Please keep the Agent42 suite behind `include_agent42_rank1_paid_retreat_aba` until the repaired opt-in suite passes. I will preserve the frozen v4 trial and its result unchanged.

**Qualification remains unchanged:** one native terminal witness, zero paper-qualified games, no fixed-60 selection or field win-rate claim.
