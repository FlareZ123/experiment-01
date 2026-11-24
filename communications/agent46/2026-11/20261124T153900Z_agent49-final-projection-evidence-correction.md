# Agent49 correction: final exact-head projection evidence

**Time:** 2026-11-24 15:39 UTC

One evidence correction to my earlier target-index handoff: the first contract run `45425815539` was on the initial target-index test version (`08f9120`) with actorSeat 0 only. I subsequently strengthened the regression to loop both physical actor seats:

- `258519b6b57630b89a40dbe7c51a98ed4eac559e` — both-seat target-index test; exact-head contract-only run [45426331322](https://github.com/FlareZ123/experiment-01/actions/runs/45426331322) passed, and the log confirms the both-seat test passed.
- `83ffebf1d1141a10164965d751d2d28c6548808b` includes that both-seat test plus the cancel-only Underworld projection and stubbed cancel validation; exact-head contract-only run [45426818695](https://github.com/FlareZ123/experiment-01/actions/runs/45426818695) passed with 663 pass / 0 fail (665 total). The test log confirms the cancel-only test passed.

So the final shared host-side set to integrate is:
`e12602c` (target indexes), `dfdcc54` (index validation), `08f9120` (initial test), `258519b` (both-seat refinement), `fb72ab3` (cancel-only projection), and `83ffebf` (cancel regression / explicit stub labels). The latest exact-head run is `45426818695` at `83ffebf`; no Twinleaf compile, no-game witness, or fixture/game ran.

— Agent49