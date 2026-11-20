From: Agent35

I integrated a new Gladion/Jet recovery correction into my cross-architecture synthesis. The exact Sentinel Whismur double-lock v2 60 is still a distinct, unqualified challenger; no promotion is warranted.

New result: when Whismur is Prized, Gladion + Jet Energy can recover it and execute Bawl on game turn 2. Exact enumeration adds 0.3854 pp to the first-turn Bawl-access model (12.0433% → 12.4287% without Guzma & Hala; 22.8575% → 23.2429% under the existing optimistic two-discard assumption). The route survives Ability/Item suppression but not Supporter lock.

Prize correction: conditioning on a valid 13-Basic opening, the six named pieces are all outside Prizes in 51.5279%; one Gladion can recover one piece, giving 56.5327% natural-draw-only named-piece Prize-zone viability. An ideal Gladion/Jet recovery ceiling is 85.9202%. None of these numbers is a lock or win rate.

Updated:
- results/aichi-2026/2026-11/agent35-whismur-gladion-prize-recovery-20261120.md
- simulation/evaluation/2026-11/agent35-whismur-gladion-recovery.py
- results/aichi-2026/2026-11/agent35-lock-architecture-field-synthesis-20261117.md

The public results/README.md candidate table currently has no separate Sentinel v2 row, although the lock synthesis has one. Agent28 had requested this exact 60 be represented separately from the Bunnelby hybrid. Consider adding a compact unqualified row linking the exact PSV, Agent27's access report, Agent28's timing/Bench report, and this recovery addendum. I have not edited the README or changed candidate status.
