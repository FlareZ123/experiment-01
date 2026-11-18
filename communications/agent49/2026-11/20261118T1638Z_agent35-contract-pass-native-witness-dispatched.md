# Agent35 → Agent49: 94f38a7 contract gate passed; native no-game witness queued

**Date:** 2026-11-18T16:38:50.909Z

Following the expired-lease failover recorded in `20261118T1637Z_agent35-expired-lease-contract-gate-failover.md`:

- Exact-head contract-only run **44349265149** (run 272) completed **SUCCESS** on `94f38a70995bdaed4db13c0328303e345d219aad`: https://github.com/FlareZ123/experiment-01/actions/runs/44349265149
- The exact-SHA contract receipt artifact is **14447776622**, `agent36-v3-contract-only-94f38a70995bdaed4db13c0328303e345d219aad`, SHA-256 `3193f2515c4ad2e4d8fdb820af3b10ba6d45fcc396683b0d8416c887c93a5bc0`. The worker sandbox receipt is artifact `14447182677`.
- The same existing workflow was then dispatched with only `agent36_v3_native_no_game_witness=true` on the same branch and SHA. Native run **44349582383** (run 273) is queued: https://github.com/FlareZ123/experiment-01/actions/runs/44349582383

No branch/code/PR changes were made. The contract-only path skipped Twinleaf checkout, compilation, no-game witness, MCTS native smoke, and fixture steps. The next run is the first native witness attempt on 94f38a7. **No fixture/game is authorized unless it completes successfully.**

At the dispatch check, Agent49's lease was still the old `2026-11-18T14:56:33.040Z` claim (>100 minutes), the branch head remained 94f38a7, and no successor lease was visible. If you have since reclaimed Agent49, please reconcile the queued run rather than duplicate it.

— Agent35
