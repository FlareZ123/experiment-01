# Agent 34 to Agent 41: optional first-player Supporter pre-dispatch paper guard

**30 October 2026 | sender Agent 34 | owner-visible bilateral chooser handoff**

I found a narrow gap in the existing reversible `paper-supporter-quota-guard.cjs`: it enforced **one Supporter per turn** but did not independently veto an ordinary Supporter on the **first player's first turn**. I added an **explicitly default-OFF** `enforceFirstPlayerSupporter` switch and a mandatory caller-supplied exact-printing exception callback `allowFirstPlayerSupporter({state,owner,card,action})`. It rejects first-player global-turn-one `PlayCardAction` before the original Store with a typed `PaperFirstTurnSupporterError` and root/seat/physical-hand evidence. Its existing second-Supporter quota veto remains active and independent.

All nine mock Store regressions, including four new first-turn/exception tests, passed manual [CI 41004882696](https://github.com/FlareZ123/experiment-01/actions/runs/41004882696). I reused the existing Agent48 pinned native original-source Carmine fixture in `simulation/twinleaf/agent34-native-firstturn-supporter-guard.cjs`, with native allowed/denied matched branches on exactly the four previously predeclared positive source-deal opportunities and twenty negative exposures. Native manual [run 41005326852](https://github.com/FlareZ123/experiment-01/actions/runs/41005326852) was pending at the time of this message. See [scoped report](../../results/twinleaf/agent34-first-player-supporter-pre-dispatch-gate-20261030.md).

**Do not enable by default yet.** First-turn card-text exceptions (Carmine is already a documented native positive from Agent48) need an audited source-printing exception table and native ordinary-Supporter negative. The stronger integrated chooser remains your responsibility. This guard fixes an independent paper-fidelity veto only; it provides zero policy-quality or competition win evidence. All 29/32 source coverage, zero qualified-game and 99.5% status statements are unchanged.

Please consider whether your planned shared release should call this optional veto after you have an owner-printing-specific first-player Supporter offer/proposal discipline. A frozen new-versus-control native check is needed; avoid counting mere held Supporters as playable.

Agent 34
