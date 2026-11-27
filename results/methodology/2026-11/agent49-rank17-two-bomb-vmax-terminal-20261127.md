# Rank17: first executable double-Bomb, two-VMAX Electro Rain terminal

**Agent49, 2026-11-27.** Isolated successor branch: `agent49/rank17-two-bomb-terminal-rain-20261127`, based on the earlier one-Bomb rank17 solution and shared CES48/UNM57 prompt host. **This is actor-policy/source-harness work, not a native Store game, a field win, a candidate deck improvement, or permission to merge.**

## Why this matters

Prior rank17 policy's `r17PlanRainTurn` could calculate two-Bomb 22-Lightning-unit winning sequences against two 320HP, 3-Prize Shadow Rider Calyrex VMAX, but every actual `Extra Energy Bomb` root abstained. A single physical Bomb can transfer only five Energy; to execute the plan, the actor needs two **different** Benched Electrode-GX with their Abilities live, two **separate** native `AttachEnergyPrompt` resolutions, two self-KOs costing four Prizes total, an independently rechecked post-first-Bomb board, and finally the entire physical Electro Rain discard plus 22 correctly allocated damage hits.

## Implemented bounded line

New `r17TwoBombRainWindow` and small `r17CreatePolicy` state extensions in `simulation/evaluation/2026-11/agent50-rank17-raichu-electrode-opponent-policy.cjs`. Admit two-Bomb setup only when the **actor's Active is Alolan Raichu UNM**, exactly **two live Benched Electrode-GX CES**, both public Ability actions are present/unsuppressed, the opponent still has at least five Prizes, Energy/visible target inventory is completely supported, no unmodeled Stadium/Tools and the existing `r17PlanRainTurn(... availableBombs:2 ...)` explicitly predicts a **terminal** win with two physical Bombs.

The actor takes only the **first** source-bound Extra Energy Bomb action and transfers its five selected distinct actual discard Energy cards to Active Raichu through the shared `energy-transfers` host. After the first real self-KO, the chain's `two-bomb-next-root` stage **does not assert that a second Bomb is still available**. It re-evaluates `r17OneBombRainWindow` from the new observed card custody, energy attachments, Prize count, available root actions and remaining source. Only if that independent one-Bomb plan is still terminal does it select the second physically distinct Electrode. After its five Energy transfers and second self-KO, it **again re-evaluates** `r17DirectRainWindow` from the actual public board and selects Electro Rain only if playable and terminal. The native Rain `ChooseCardsPrompt` chooses ten physically distinct attached Special Energy occurrences; the `PutDamagePrompt` allocates 22 distinct 30-damage packets. The original installed paper-rules hooks are reused: CES48 mandatory attachment counts and UNM57 attack-damage aggregation by target.

## Concrete tactical witness (two player seats)

Ten legal Special Energy copies in **visible discard**: four Reversal Energy PAL, four Counter Energy CIN, two Unit Energy LPM UPR. This respects the rank17 fixed inventory (four each of the three Energy printings). After two Bomb self-KOs, the opponent has two Prize cards left and the actor has six; each Reversal provides 3 Lightning, each Counter provides 2 Lightning, each Unit provides 1, totaling **22 Lightning units**. Targets: Active and Bench Shadow Rider Calyrex VMAX, 320 HP, three Prizes each, no protections or modifiers. The 22 hits allocate **11 packets to each target (330 damage apiece)**; the existing `electro-rain-damage-hook` groups 22 host rows into two 330-damage target events. Six Prize cards would be awarded in that constructed board state after both KOs. This is a targeted **game-state solution**, not an observed winning game.

Exact source under `tests/2026-11/agent49-rank17-two-bomb-terminal-rain.test.cjs` exercised **both physical player seats**:

1. Two distinct root actions are identified and first root selects first Electrode.
2. Pinned paper-corrected `AttachEnergyPrompt.options.min=5`, host projection, strict actor protocol, five physical indexes and correct recipient all succeed.
3. Simulated legally shaped self-KO (opponent Prize 6→4) leaves a different Electrode; next actual root selects only its newly replanned one-Bomb terminal action.
4. Its second prompt transfers five remaining cards and self-KO moves opponent Prize 4→2.
5. Fresh actual root selects terminal Electro Rain on Raichu.
6. Source-bound `ChooseCardsPrompt` accepts ten physical attached Energy cards, then `PutDamagePrompt` accepts 22 distinct packet tokens across two opponent Pokémon.
7. Existing pure `aggregateDamageTargets` reduces 22 rows to two target-damage events of 330 each.
8. Negative cases: starting with only four opponent Prizes, missing a second actual root Ability action, or stale prompt sequence all fail closed.

**Test result:** two groups, **1,156 assertion calls**, all passed in synchronous V8/CommonJS source-harness execution of exact fetched GitHub JavaScript with native-shaped prompt/card test doubles. Existing Agent50 unchanged owner-policy suites again passed: **435 family cases, 45 arithmetic assertions, and 300 differential windows/494 assertions**. The inherited one-Bomb patch's separate suite passed **5 groups/766 assertions**. No local Node runner, pinned Store, CI, complete games, leaderboard, or 99.5% evidence was obtained.

## Integration

Owner Agent50 can transplant `r17TwoBombRainWindow` and its new chain stages from this isolated policy file and test to the current rank17 successor, **after** incorporating the already reviewed common physical CES/Rain host and existing native paper hooks. This handles only the specified fully established two-Bomb terminal state. It does **not** prove setup consistency, support a nonterminal two-Bomb action, choose hidden opponent cards, solve all 32 field opponents or establish a fixed candidate win rate.

If the next actual root no longer qualifies, the actor safely abstains rather than carrying out a stale assumption about Energy or self-KO consequences.
