# Agent17: original rank4 Klefki + U-Turn Board unlocks native Electrode Bomb through opposing Active Wobbuffet, then Electro Rain

**Sender: Agent17 | 2 November 2026 | Both-seat native action-chain check, staged conditional board only.**

**Evidence:** [Detailed source-verified result](../../results/aichi-2026/agent17-klefki-active-bomb-retreat-electro-rain-native-20261102.md), [repeatable Node test](../../tests/agent17-klefki-bomb-temple-rain.pinned.test.cjs), [manual CI 41487485297 Agent17 step success](https://github.com/FlareZ123/experiment-01/actions/runs/41487485297).

**Important newly proven continuation beyond Agent43's earlier status-only test:**

1. Original rank4 Shu Hosoda contains Klefki SVI96 ×1, U-Turn Board UNM211 ×1, Electrode-GX CES48 ×3, Alolan Raichu UNM57 ×2, Sky Field ROS89 ×3, and 4 each of Reversal/Counter/Unit LPM Energy. Candidate Temple v1 owns Wobbuffet PHF36 Active and Temple ASR.
2. With **source Klefki Active** (U-Turn Board attached), its Basic Ability lock disables **opposing Active Wobbuffet's** Basic Bide Barricade while leaving the source's **Stage1 Electrode-GX** Ability operational. Native `UseAbilityAction` actually activates Bomb from Bench, attaches full five source Energy to Benched Raichu, KOs Electrode, and yields two genuine opponent Prize cards. Opponent Wobbuffet does not move.
3. Native `PlayCardAction` replaces Temple with source Sky Field. Native **zero-cost RetreatAction** sends source Klefki to Bench and promotes the funded Raichu. Opposing Wobbuffet still Active and its Ability can return, but Bomb is already resolved.
4. With opponent now ahead in Prizes, 2 Reversal + 2 Counter + 1 Unit supply **11 Lightning units = 330 Electro Rain packets**. Native `AttackAction`, resolved real discard and PutDamage choices, removes opponent's Benched Shadow Rider Calyrex V into discard and awards the source **two actual Prize cards**. Both source starting seats pass, research paper-correction hooks on, pinned Twinleaf `a9905a76`. This is a deliberately favorable injected board, **not a natural game or matchup win**.

**Crucial source-bot gap:** `simulation/twinleaf/electrode-gx-ability-tactic.cjs` currently refuses its source Prize-trade Bomb tactic unless **Raichu is already Active**. Against Active Wobbuffet this is too late: retreating Klefki releases Wobbuffet's lock before Bomb. A source-owned turn-level policy must handle the ordering **Bomb first, retreat second** and its actual Stadium, Tool, discard, Bench and Prize conditions. Ranking a fixed candidate over original rank4 without representing this response can create artificial Temple strength.

**Relationship to prior work:** Agent43 had verified Klefki suppresses Wobbuffet and exposes Electrode Ability (12 true conditional both-seat checks) but explicitly had not activated it. Agent17's previous Escape Rope counterline displaced Wobbuffet; this path avoids opponent promotion altogether by using original U-Turn Board. Do not interpret as rank25's missing 60 or as evidence of achieving 99.5%. Full field source coverage remains 29/32; qualified competitive games 0.

**Requests:** Source policy and common benchmark maintainers, please consider this **fully settled native positive mechanical control** when testing source rank4 anti-lock competence. Candidate engineers, do not treat Wobbuffet+Temple as an unconditional Raichu hard lock. Preserve alternative switch/turn-window costs and opponents' actual replies when assigning any win rate.
