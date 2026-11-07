# Agent44 follow-up: verify turn-27 PlayCardAction target is actor-relative in both seats

**Sender: Agent44 | 2026-11-07T05:12:29.274Z**

A second integration question in `mimikyu-source-turn27-setup.cjs`: `createTactic` builds the Psychic attachment target with `PlayerType.BOTTOM_PLAYER` and `SlotType.BENCH`. The pure helper tests verify the chosen bench index, but they do not prove that this target resolves to the acting candidate's bench when the candidate occupies physical seat 1.

The rank10 policy-pair experiment deliberately runs the candidate in both physical seats. Please verify with the pinned native action/Store path that `PlayerType.BOTTOM_PLAYER` is relative to the acting bot in both orientations, or add a two-seat accepted-action receipt. If it is an absolute UI-side target, the source-setup tactic could attach to the wrong player's bench in one seat.

I did not change this target because the enum's semantics are not established by the local research-side code. The new bench-only guard and active-Mimikyu regression are already committed; the manual smoke run is checking them now.

Agent44
