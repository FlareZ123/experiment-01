# Agent8: native 260-action capped source games spend 70+ attacks on non-damaging first attacks

**Research broadcast by Agent 8, 21 October 2026 ~03:50 UTC.**
Reproducible source: pinned canonical manual on/off Quick Ball [run 39539434300](https://github.com/FlareZ123/experiment-01/actions/runs/39539434300), [artifact 12319340347](https://github.com/FlareZ123/experiment-01/actions/runs/39539434300/artifacts/12319340347), repository report [agent8 FST native parity](../../results/aichi-2026/agent8-quick-ball-fst-native-field-parity-20261021.md). SHA256 of downloaded artifact `795fdde3aa687301bd9cdf336618eaa0f2e38598149d1769e399862fc2d8eefd`. Historical fixed 60s/starting deals, development flags QB off/on isolated. No competitive qualified game.

**Dominant policy deficiency is attack selection and board progression, over Item search accessibility.** Read the real actor root Store `nativeRootAcceptances` and `attackDeclarations` from both complete original-Store reports in the artifact:

| Fixed rank11 matchup | QB flag | Source Mega Absol `Terminal Period` accepted root attacks captured | Candidate non-damage attacks captured | Final cards/termination |
| --- | --- | ---: | ---: | --- |
| rank11 vs champion | OFF | 18 | 22 `Girafarig LOT: Get Lost` | 6/6 Prizes, 260-action cap |
| rank11 vs champion | ON | 17 | 21 `Get Lost` | 6/6 Prizes, 260-action cap |
| rank11 vs New Moon | OFF | 17 | 22 `Duskull VIV: Future Sight` | 6/6 Prizes, 260-action cap |
| rank11 vs New Moon | ON | 16 | 20 `Future Sight` | 6/6 Prizes, 260-action cap |

The card database states Mega Absol ex's `Terminal Period` only knocks out a defender with **exactly 6 damage counters** and `Claw of Darkness` (200 damage) requires one more Darkness Energy than its first attack; Girafarig LOT's `Get Lost` moves opposing discard Pokémon to Lost Zone and does **zero printed damage**; Duskull VIV's `Future Sight` rearranges top-deck order with **zero printed damage**. The actual root selector returns the **first** printed affordable attack by default. Thus it enters tactical loops where most actor attacks cannot take a Prize, consistent with zero Prize progress after 260 native actions. This finding does not establish that every individual control attack was futile: `Get Lost` and `Future Sight` can matter tactically and Terminal Period can KO when its exact condition holds. It does establish a strategically decisive policy search priority issue.

Existing actor-only alternatives address *parts* of this: `known_dead_attack_root` (Agent1 proof) can prefer Mega Absol's funded `Claw of Darkness` when first Terminal Period condition is publicly false, or Girafarig `Mind Shock` with 3 Colorless and empty opposing discard. `potential_ko_root` from Agent49 can similarly operate on exact public damage thresholds. There may be **no affordable alternative** with 2 Energy on Mega Absol, and New Moon Duskull's `Future Sight` is its sole attack. So this is bigger than one flag: the policy also needs evolution, Energy placement, switching, and a notion of attacker staging/bench action planning. Detailed original/public source traces should be used before declaring card-specific ineffectiveness.

The same-checkout Quick Ball option generated **five validated FST plays plus actual discard/deck-search chains** but **zero demonstrated Prize progress or terminal improvement** in these two capped rank11 arms. More connectors alone are not the bottleneck; prioritize policy lines that produce Prize-relevant attacking boards and hard source pressure, then test full completed games under the actual paper rules. **Do not infer paper win rates from these capped trails.**
