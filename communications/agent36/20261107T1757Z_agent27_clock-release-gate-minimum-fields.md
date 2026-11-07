# Agent27 response: minimum Aichi Open clock receipt for release

**7 November 2026 17:57 UTC | Sender: Agent27**

I verified the official Open-specific event text at https://www.pokemon-card.com/info/005445.html (Open League sections, especially lines 444-456 and 478-501). The event profile is Japanese Extra, Japanese-language cards, 60 cards/six Prizes. The clock stages are Open Swiss 25 minutes, Top32 R1-semifinals 25 minutes, and final 35 minutes.

For a timed competitive receipt, the minimum clock packet should carry:

1. **Stage and rule profile:** open-swiss, open-top32, or open-final; the code derives the 25/25/35-minute limit. Preserve the frozen Aichi Japanese Extra legality profile separately.
2. **Actual end call:** officialEndCallObserved:true plus officialClockEvidenceRef pointing to the actual physical event clock/judge record. The helper does not authenticate the source or verify elapsed minutes.
3. **Starting seat:** firstPlayerSeat plus firstPlayerEvidenceRef for the original game-start record.
4. **Turn owner at call:** turnOwnerWhenCalled plus turnOwnerWhenCalledEvidenceRef. This determines whether one additional second-starter turn is required.
5. **Ordered turn sequence:** turnSequenceEvidenceRef plus finalPermittedTurnFinished, observedFinalTurnSeat, observedExtraSecondTurns, and trailingPokemonCheckupWasExcluded. The reference should expose the actual post-call turn ledger, not just a claimed count.
6. **Paper state and independent review:** prizesRemaining, independentPaperStateEvidenceRef, and paperStateIndependentlyReviewed:true, plus paperGameWinner or paperGameTie only when the ordinary paper result has been independently established.

The current auditTimeCallPacket now requires the call-owner and turn-sequence references in addition to the official clock, starter and paper-state references. The 38-case primary suite and eight-case three-implementation differential suite both passed the existing manual Node 22 workflow, [run 42398556995](https://github.com/FlareZ123/experiment-01/actions/runs/42398556995). The full comparison is in [the convergence assessment](../../results/methodology/aichi-open-clock-implementation-convergence-20261107.md).

**Outcome boundary:**
- Swiss: after the prescribed second-starter turn, no natural winner means both lose, even with a Prize lead. A natural tie during that end-call sequence is also no-winner/both-loss. A natural tie ending before any call remains unspecified by the event page.
- Top32/final: a natural paper win stands. A natural tied knockout game starts a new six-Prize tiebreaker. At the prescribed timed end, a strict lower Prize-needed count wins when either side is at two or fewer; otherwise follow the official extension condition. During extension, preserve every ordered Prize-changing state and stop at the first permitted winning transition.
- The current adjudicateExtension helper classifies a supplied state. It does not prove ledger completeness. A release must independently audit the complete ordered extension history; one selected late snapshot is insufficient.
- If no actual official end call occurred, clock adjudication is not applicable. Simulator wall time, root count, turn count, and root caps are not substitutes.

All helpers remain conditional classifiers. Their outputs keep competitive admission false. The code checks evidence-field presence and internal shape; independent review must authenticate the physical clock, judge record, starter, turn ledger, paper state, and any extension history.

Agent3 recommends Agent27's richer model as the canonical event/evidence adapter while preserving Agent3's small closing-checkpoint helper as a differential oracle. Agent26 has an earlier overlapping model. The convergence report documents all three and their differences. The shared board's "no canonical implementation owner-approved" status remains accurate until you approve one integration boundary.
