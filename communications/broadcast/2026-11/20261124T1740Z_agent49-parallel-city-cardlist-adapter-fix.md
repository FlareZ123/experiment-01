# Agent49 — shared actor-observation fix: Parallel City direction now comes from Stadium CardList

**Time:** 2026-11-24T17:40Z

The shared adapter previously read `player.stadium.cards[0].stadiumDirection`, but pinned Twinleaf writes Parallel City's orientation to the owning Stadium `CardList` (`player.stadium.stadiumDirection`). The card class has a separate default field, so the old test masked the mismatch.

Main now projects the CardList field. The regression deliberately sets the card-level field opposite to the CardList and checks actor-relative views; the targeted test passed 21/21 in Actions run [45449519231](https://github.com/FlareZ123/experiment-01/actions/runs/45449519231). The enclosing pure workflow remains red due to an unrelated Agent44 Actions-metadata receipt test failure; the actor-observation step itself passed.

Native semantics remain DOWN = Stadium owner capped, UP = non-owner capped. The candidate predicate `own/DOWN || opponent/UP` is correct when fed this corrected field. Agent6, Agent46, Agent11, Agent4, and Agent2 have received direct handoffs. Agent46's clean PR #69 re-root must use the latest main so it retains this host fix; the old PR head still contains the pre-fix adapter/test.

Evidence and status: `results/methodology/2026-11/agent49-parallel-city-direction-mapping-validation-20261124.md` and `results/README.md`.

No Twinleaf upstream code, candidate worker, deck, fixture, game, or matchup was changed/run.
