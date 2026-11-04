# Agent20: Issue #25 v11 canonical VIP alters source opportunity windows under the 48-root cap

**4 November 2026. Retrospective archive comparison.** No new simulations were run. No complete paper games or competitive wins were established.

## Inputs and reproducibility

- [Original v6 mirrored study](agent1-issue25-joined-v4-v6-mirrored-policy-development-20261104.md), [manual CI 41894027367](https://github.com/FlareZ123/experiment-01/actions/runs/41894027367), artifact **13353289881**. Downloaded original ZIP SHA-256 `7f8f8ab3f95f6cc7eb17ec12d5d37ff666924216a007b934ccaf662b4e905178`, archive JSON `issue25-mirrored-v6.json` 145,149 bytes.
- [Canonical inner Battle VIP v11 study](agent16-issue25-v11-canonical-vip-first-turn-native-20261104.md), [manual CI 41907884146](https://github.com/FlareZ123/experiment-01/actions/runs/41907884146), artifact **13360683037**. Downloaded original ZIP SHA-256 `9aed76a947031e75f57ecf332e71798fc7a0106328c0e653790251ce68455379`, JSON `agent16-issue25-v11-canonical-vip-native.json` 109,420 bytes.
- Both experiments used the same registered eight original source/rank/seat/contender IDs, 48 accepted Store-root budget, and actual original paper 60 name/count decks. The v11 archive asserts **8/8** matching source and full physical initial deal fingerprints against v6 for corresponding IDs. I separately compared the exported `publicRootActions` action objects, `turnBefore`, `playerSlot`, `card`, and `actionOrdinal` for each row.
- **Six** matched rows had byte-equal 48-entry public root histories. The same old engine-error row **11:102:A:champion-reference** had 25 identical entries and was not admitted into the normal 48-root source-opportunity sample.

## The two physically identical changed source histories

| Registered source matchup | First divergent accepted Store root | Source owner action roots in v6 | Source owner action roots in v11 | Source turn exposure within cap | Changed candidate attack root |
| --- | --- | --- | --- | --- | --- |
| `6:101:B:new-moon-lockbreaker-v1`; source rank6 in seat0 | root 21 on turn1, candidate seat1 `PassTurnAction` → printed `Battle VIP Pass` `PlayCardAction` | Pass on original turn 2,4,6,8; 9 source `ResolvePromptAction` | Same four Passes on 2,4,6,8; **8** source prompt roots | Last source decision still turn8; the old v6 root47 belonged to candidate turn9, whereas v11 root47 belonged to source turn8 | none |
| `11:103:B:new-moon-lockbreaker-v1`; source rank11 in seat0 | root 13 on turn1, candidate seat1 `PassTurnAction` → printed `Battle VIP Pass` `PlayCardAction` | Darkness Energy + Pass on turn2; Pass on turns4,6,8; **10** source prompt roots | Darkness Energy + Pass on turn2; Pass on turns4,6; **8** source prompt roots | **Source turn8 no longer entered the accepted prefix**; v11 truncates during source turn6 | candidate `AttackAction` at root43 on turn5; settlement/payoff not certified |

Both new VIP roots have native accepted search/Bench confirmations in Agent16's existing report. The source player's published deck composition and full physical starting position were unchanged in each matched comparison. **A change in candidate Bench/action sequence may also change later state-dependent decisions**, so the root-count shift should not be attributed exclusively to the three additional VIP prompt acknowledgments. The available `publicRootActions` alone cannot prove the new candidate turn5 AttackAction caused damage, a Prize change, or any strategically meaningful attack effect.

## Consequence for a shared policy release

The v11 treatment **does not demonstrate any improvement in original source-owner Trainer competence**. In the changed rank11 arm, observing one fewer original-source Pass under the fixed 48-root cap is an exposure/censoring artifact, not a successful source decision. The v11 candidate owner can play an actual accepted new Item and later select an `AttackAction`, but a complete cost→target→settlement→Prize/control→opponent reply must be separately verified.

For any upcoming full bilateral comparison, use denominators by owner turn and owner-eligible decision opportunity, report who physically held the decision, and separately record game turn/phase reached when the root cap fires. Action-count differences are intrinsically confounded with prompt length and changed game trajectories. Paired sample validity also needs the **actual full physical deal fingerprints**, not equal seeds alone. Preserve the 48-root historical controls instead of retroactively reclassifying them as complete games.

Overall state remains **zero competitively qualified games, no selected final fixed 60 and no demonstrated 99.5% field win rate**.
