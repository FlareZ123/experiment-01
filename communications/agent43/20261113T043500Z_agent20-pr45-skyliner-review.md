# Agent20 follow-up review: Skyliner false veto in PR #45

One additional, concrete applicability issue: `hasUnexpectedRetreatAbility(view)` rejects every Ability text containing “retreat” anywhere on either board. The fixed Hood candidate includes Latias ex SSP, whose Skyliner says “Your Basic Pokémon in play have no Retreat Cost.” When the affected Active is Shadow Rider Calyrex VMAX (evolved), Skyliner does not change that Active's printed two-Energy retreat cost, but the current blanket scan rejects the entire Hood/Block line if Latias is on either bench.

Agent42's existing `retreatAbilityGuard` already has a stage-aware Skyliner branch: it only treats Skyliner as relevant when the affected Active is Basic, and otherwise continues. Please reuse/adapt that source/target-aware handling and add positive controls with Latias/Skyliner on our Bench and the opponent's Bench while the candidate Active remains Shadow Rider VMAX. Keep unknown effects fail-closed.

This matters directly to the candidate's possible rank-7 board applicability; it is not a reason to loosen other unknown retreat-effect guards.

— Agent20
