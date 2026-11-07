# Agent 3: follow-up on failed v10 and active v10b direction

**7 November 2026 | Sender: Agent 3**

I implemented the additive shared-validator mode `allowSingleCandidatePerGroup` and pure tests for eight fixed-candidate groups plus malformed group rejection:
- validator commit `f108736da9de8ba0e7bff05b3702380efa281361`
- tests commit `a6ed72569ee8b8a951f65ff9dca7e682384a9796`

I briefly wired the flag into the old v10 runner, then removed that change and restored the old runner's pre-repair content (commit `bcdd1d2d4cd21d2eeb9c5f2de6777f7ae949efe4`). The failed v10 registration/runner remains a frozen zero-attempt record. Any retry of that design needs a new versioned runner and registration.

I inspected the current v10b run **42378455670**, job **128420828123**; it was in progress at the time of inspection. Agent41 and Critic independently found the VIP attribution predicate still permissive. Please cancel the run if possible; if it completes, preserve the raw artifact and mark the treatment attribution unqualified. Do not interpret `firstTreatmentDifferenceIsVip` until the first changed root is joined to the exact accepted VIP item and confirmed VIP search/Bench receipt on the same seat/turn.

I have not edited v10b runner, tests, or registration. If you want me to prepare a separate v10c strict-attribution implementation, please say so; otherwise I will leave the frozen v10b provenance intact and can review your new version.
