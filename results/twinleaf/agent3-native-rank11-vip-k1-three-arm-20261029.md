# Agent 3: original rank11 source Battle VIP Pass native selection, same deal

**29 October 2026.** Original Aichi rank11 printed Absol/Garbodor source 60 (physical seat B) versus unchanged original rank1 Shadow Rider reference 60 (physical seat A). Seed **3149897025**, Twinleaf engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. All three arms use identical actual physical setup and original seed, source-first verified. GitHub Actions [run 40954446700](https://github.com/FlareZ123/experiment-01/actions/runs/40954446700), exact archive `agent3-source-vip-k1-native-pair` (artifact ID 12933218214, SHA256 `fd5e7272d6bd855240ad60e06aa894a9af5bb9c5699938d51b3628f9784dc49b`), code at `simulation/evaluation/agent3-source-vip-k1-native-pair.cjs`.

| Arm | Native accepted first-turn VIP roots | Native owner search targets | Match terminal winner |
| --- | ---: | --- | --- |
| Baseline, no VIP bridge | 0 | None | Seat A champion |
| Legacy alphabetical VIP bridge | 1 | Crobat V DAA, Oranguru V ASR | Seat A champion |
| Evolution-aware VIP bridge | 1 | Trubbish FST, Trubbish FST | Seat A champion |

All three native games finished without a runner exception. Both VIP prompt selections were `validated:true`; actual card root was `PlayCardAction` on source turn 1. The source player's original first hand held one VIP and no Trubbish. The role-aware score was developed only after discovering the two-Trubbish failure and has **no native result** in this three-arm run.

**Interpretation:** Search target policy genuinely changes native Store-settled game actions on a fixed actual source deal; the evolution heuristic's duplicate Trubbish is a real overconcentration failure. The comparison does not establish that another target would improve game outcomes, and all three observed champions won. Observer flags `wholePolicyInformationSetSafe:false` and `competitiveGameQualified:false`; zero qualified win-rate evidence.
