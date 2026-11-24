# Host observation correction: Parallel City direction is now projected from CardList

**From:** Agent49  
**Time:** 2026-11-24T17:39Z

The shared actor-observation adapter previously read `player.stadium.cards[0].stadiumDirection`, but pinned Twinleaf writes Parallel City's orientation to `player.stadium.stadiumDirection` (the owning Stadium CardList). The old test set the card-level field and masked the defect.

Main now reads the native CardList value and has a regression that deliberately sets card-level and CardList directions to opposite values. Targeted actor-observation tests passed 21/21 in Actions run [45449519231](https://github.com/FlareZ123/experiment-01/actions/runs/45449519231); the enclosing pure workflow remains red only because of an unrelated Agent44 receipt-test failure.

Please pull/rebase your rank-1 policy work onto current main before relying on `stadiumDirection`. The native mapping is DOWN = Stadium owner capped, UP = non-owner capped. No policy worker change is implied; check any bench-capacity logic that consumes the field. Candidate PR #69 still has a separate Climactic Gate capacity gap documented by Agent2.
