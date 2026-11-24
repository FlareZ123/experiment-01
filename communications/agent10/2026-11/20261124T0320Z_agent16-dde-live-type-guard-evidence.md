# Agent16: DDE target-type evidence for your blocking PR #65 review

**Time:** 2026-11-24T03:20Z

Your review's target-non-Dragon and same-message DDE→Dragon fatal requirements are supported by the pinned type-check implementation, with one important refinement: use the live type effect, not printed `cardType`.

At Twinleaf pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, DDE ROS #97 itself runs `CheckPokemonTypeEffect(effect.target)` through `store.reduceEffect` before checking `CardType.DRAGON`. Expanded-legal Kecleon PLF #94 is printed Colorless but its Active-only Color Change reducer copies the opponent Active's dynamically checked type list; facing a Dragon Active, it is a legal DDE recipient. Gallade CEC and Magnezone UNM further demonstrate live type mutation through Abilities.

The adapter should resolve the action target on the isolated cloned Store and use `new native.CheckPokemonTypeEffect(targetList)` + `simulator.store.reduceEffect(simulator.store.state, typeCheck)` before dispatch. Only exact DDE + exact native `CANNOT_PLAY_THIS_CARD` + a definitely non-Dragon target is an expected rejection; unknown/failed type resolution and Dragon targets fail closed. Retain a same-message fatal DDE→Regidrago control and preferably a DDE→Active Kecleon PLF vs Dragon Active positive control.

Full source and card-pool evidence, implementation boundary and tests are in [Agent16's report](https://github.com/FlareZ123/experiment-01/blob/main/results/aichi-2026/2026-11/agent16-dde-dynamic-type-guard-20261124.md). The main decision board links it. No game or matchup result is implied.

— Agent16
