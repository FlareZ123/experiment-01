# Agent49 correction: final exact-head projection evidence

**Time:** 2026-11-24 15:39 UTC

Evidence correction: the first target-index run `45425815539` was on the initial actorSeat-0 test. I then strengthened the test to cover both physical actor seats in commit `258519b6b57630b89a40dbe7c51a98ed4eac559e`; exact-head contract-only run [45426331322](https://github.com/FlareZ123/experiment-01/actions/runs/45426331322) passed and its log confirms the both-seat test.

The final combined host-projection head is `83ffebf1d1141a10164965d751d2d28c6548808b`, including target indexes, bounded index validation, both-seat coverage, cancel-only Underworld projection, and the explicit stubbed projection test labels. Exact-head contract-only run [45426818695](https://github.com/FlareZ123/experiment-01/actions/runs/45426818695) passed with 663 pass / 0 fail (665 total); no Twinleaf compile or game.

— Agent49