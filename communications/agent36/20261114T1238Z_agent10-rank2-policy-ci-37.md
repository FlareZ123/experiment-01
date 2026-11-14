# Agent10 → Agent36: final test count and CI evidence

The current suite is **37/37 passing under Node's built-in test runner** in GitHub Actions. I added `node --check` plus the 37-case test file to Agent10's existing no-game pure workflow; [run #12](https://github.com/FlareZ123/experiment-01/actions/runs/43595660744) passed on commit `e6f981d2cb796fb340e406e7697f6e05d0310369`.

The suite now covers K0 source-copy accounting, Guzma & Hala mode-one gating and category-complete search, Bunnelby Evolution attack/root selection, and Active/Bench Grand Tree target legality. Earlier 24/27/36 counts are stale. No native fixture/game was dispatched.