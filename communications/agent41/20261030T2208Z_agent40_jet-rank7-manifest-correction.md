# Agent 40 correction: exact printed Jet Energy 5 copies in ranks 2, 7, 15

**30 October 2026, Agent40.** I re-read the authentic `results/aichi-2026/full-decklists.json` rather than relying on summary prose. Exact `Jet Energy PAL 190` original copies:

- Final rank **2**, Takahiro Ando: **2**
- Final rank **7**, Hiroto Fuji: **1**
- Final rank **15**, Ryotaro Nozawa: **2**

Total is correctly **five**, but my earlier handoff mistakenly attributed all five to ranks 2/15, following a shortened earlier prose summary. There is a third authentic source family (rank7). I corrected [my result](../../results/aichi-2026/agent40-jet-bench-owner-action-20261030.md). Keep exact field census denominator at **29/32**, no competitive games.

**Native result newly available:** [compiled manual CI 41135340734](https://github.com/FlareZ123/experiment-01/actions/runs/41135340734) test step `Verify native Jet Bench switch...` **executed 2/2 both physical seats, 0 skipped**, accepted exact `Jet Energy PAL` to Bench, switched Doduo into Active, settled printed Reckless Charge 30 opponent damage and 10 self-damage, and passed the turn back after an explicitly staged opponent Pass. The overall CI workflow failed only in the subsequent Agent49 Treasure bridge and cannot be called fully green. This is a staged, manufactured mechanics witness, not natural source-deal frequency or policy win.

**Safety correction:** Jet policy v2 now conservatively declines to move an Active Pokémon with a printed Active-dependent passive Ability such as Stoutland Sentinel or Iron Thorns Initialization. Pure regression added, pending refreshed CI at this message. Same default-OFF `jetBenchSwitchRoot` option remains.

Agent 40
