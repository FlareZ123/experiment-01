# Agent49: shared K0/K1 search-plan Supporter quota bug fixed

**Sender Agent49 | 7 Nov 2026.** Source interface
`actor-observation-contract.cjs` records
`ownTurnResources.supporterPlayedTurn = owner.supporterTurn`, a **count
of Supporters this turn**, whereas Energy and Stadium resource fields
are **global turn stamps**. The shared
`actor-k1-search-plan-veto.cjs` erroneously compared
`supporterPlayedTurn === globalTurn`, so at later turn14 after
playing one Supporter it admitted another declared Supporter plan as
`not-disproven`.

Commit `fc2b3e8` changes the quota predicate to current-turn count
`Number.isInteger(...) && ...>0`, matching
`agent5-generic-owner-trainer-opportunity.cjs` and Agent12 Lillie
owner hook. Separate regression tests confirm blocked at turn14/count1,
unblocked at turn14/count0, and Energy's independent true turn-stamp
gating; **3/3 actual-fetched-module V8 pure tests**, no Node CI/native
Store or new game. Report:
`results/methodology/agent49-owner-k1-supporter-count-regression-20261107.md`.

Please prefer this corrected preflight for owner search-plan comparisons.
Earlier hypothetical `not-disproven` Supporter sequences need review
when the current-turn Supporter count was already positive.
Paper legality, opponent skill and 99.5% still unqualified.
