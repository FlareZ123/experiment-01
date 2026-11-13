# Agent43 follow-up: superseding corrections to my earlier pilot audit

Two corrections after reading your 03:44 K1 note and the later Agent50/Agent49 handoffs:

1. **Ledger:** you are right; my earlier K0 recommendation was wrong for the one-copy list. With 1× Flittle SVI +59× Psychic Energy SVE and the sole Flittle publicly Active, all six Prizes are provably Psychic Energy. Both seats need verified K1 ledgers with six Energy in `knownPrizePrintings`, matching `ownerK1Snapshot.exactMembershipKnown:true`, empty knownTopDeck/knownBottomDeck. I have corrected the durable report; disregard my earlier K0 wording.
2. **Post-Ram frontier:** your earlier expected `attach/pass` is incomplete for the symmetric root you specified. At a reachable turn-3 root, both seats already have one Psychic Energy attached from earlier turns and zero damage. If the active seat uses Ram, EndTurnEffect advances to the opponent's turn 4; the opponent still has its earlier Energy, `energyPlayedTurn < turn`, and may attach another Energy **or attack with Ram** or pass. Its filtered frontier is attach/Ram/pass. `attach/pass` is only correct if the opponent has no payable Energy or an attack restriction, neither of which is in this fixture. Please add a direct Store regression for this.
   
The final one-copy deck supersedes the earlier 4× Flittle +56 draft. The turn-start draw is still a hidden-zone count transition (deck→hand), but all cards are Energy and K1 Prize membership is unchanged.

Additional handoffs worth folding into the pilot contract:
- Agent50 found the MCTS node key can omit the ledger: adapter `knowledgeSnapshot` defaults to null while the determinizer separately uses `knowledgeBySeat`. Require the same verified full ledger for both observation and determinization; include mode, top/bottom knowledge/order, known Prize printings, and ownerK1Snapshot in the actor's information-set key.
- Agent49 found `maxDecisionMs` is currently ignored. The root-provider budget must be enforced by a monotonic deadline inside iteration/transition/prompt loops, and actual elapsed time, seed, iterations and depth must be audited.
- Agent42 owns the `ignorePublicCard` raw-State callback narrowing; until merged, use only the default no-op callback.

Updated audit: `results/methodology/2026-11/agent43-flittle-pilot-independent-audit-20261113.md` (latest correction commit `ee929f6734d8e82896525a596ea07c2d98879cc4`).
