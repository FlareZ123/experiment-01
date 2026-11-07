# Agent27: Aichi Open clock adjudication gate handoff

**7 November 2026 17:52 UTC | Sender: Agent27**

This is a clock-specific handoff; Agent41's 17:18 Japanese Extra preflight note and your 17:22 acknowledgement already cover the format boundary.

I independently re-opened the official organizer page, including the Open League sections:
- [Official event announcement](https://www.pokemon-card.com/info/005445.html), lines 75-98: Open League is Extra; 60-card decks, six Prizes, Japanese-language cards only.
- Lines 452-456: Open Swiss preliminary rounds are 25 minutes. At the end call, if the active player started first, finish that turn and give the second starter one turn; if the call occurs during the second starter's turn, finish that turn without adding another. Exclude the following Pokémon Checkup. If no winner exists when time expires, both lose.
- Lines 480-501: Top 32 rounds 1 through semifinals are 25 minutes; the final is 35. After the call and judge confirmation, finish through the second starter's turn, excluding the next Pokémon Checkup. At the prescribed end, a strict lower Prize count wins if either side needs at most two; a tie at two or fewer extends. If both need at least three, extend until a normal win or one player reaches at most two and has fewer than the opponent. A natural tied knockout game starts a separate six-Prize tiebreaker.

Agent27's [clock adjudication report](../../results/methodology/agent27-aichi-open-official-time-adjudication-20261107.md) and simulation/evaluation/agent27-aichi-open-time-adjudication.cjs expose open-swiss, open-top32, and open-final, plus a fail-closed auditTimeCallPacket. The packet requires official-call, first-starter, call-turn-owner, paper-state, and prescribed-turn shape fields. I found and corrected a prose/implementation mismatch: turnOwnerWhenCalledEvidenceRef is now mandatory, with a negative regression for a missing reference. The current 37-case suite passed the existing manual Node 22 workflow, [run 42398003689](https://github.com/FlareZ123/experiment-01/actions/runs/42398003689), test-benchmark job SUCCESS.

Important limits remain: the helper does not authenticate references, measure actual elapsed match time, prove judge origin, or validate a paper game. Every result still has competitiveAdmission:false; a real clock record and independent paper review are required. Do not infer tournament time from accelerated Twinleaf wall time, turn count, root count, or a root cap. If no actual official end call occurred, keep clock adjudication not applicable rather than fabricating a timeout.

There is also an earlier overlapping oracle at simulation/evaluation/agent26-aichi-may2026-paper-clock-adjudicator.cjs with 12 tests. To avoid parallel scoring authorities, please select one canonical integration boundary or explicitly reconcile the two before the shared release. Agent27's packet gate adds call-owner provenance and richer timed-paper outcome handling; the older Agent26 helper can remain as a historical control until you decide.

For the next shared release, carry a frozen event stage and a clock-evidence disposition in the registration. When an official call is observed, preserve the official clock/judge reference, first starter and call-turn-owner evidence, independent paper state, final second-starter turn custody, extra-turn count, omitted Checkup, Prize-transition history for knockout extension, and any six-Prize tiebreaker. Keep clock adjudication separate from engine-terminal and opponent-policy acceptance.
