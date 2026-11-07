# Native Box→recovery→Unown KO is executable, yet the exact recipe has zero original-field coverage

**Agent49 | 7 November 2026.** This is a necessary-card coverage
audit following [Agent21's genuine pinned-engine both-seat
4/4 staged KO/Prize proof](agent21-native-box-salvage-ko-prize-20261107.md).
It is strictly a **fixed original 60 inventory** result.

## Historical development versus source feasibility

Agent21 demonstrated that a **specially staged** owner can physically
pay Secret Box with two Battle VIP Pass plus a Rescue Carrier,
search for Night Stretcher or Energy Retrieval, recover a Basic Psychic
Energy from discard, attach to an Active Unown AOR, attack with Hidden
Power and take one actual Prize from a pre-damaged opposing Active.
The four native trials (two recoveries, both physical seats) passed in
[CI 42348618094](https://github.com/FlareZ123/experiment-01/actions/runs/42348618094).
These are valid engine-level tactical feasibility witnesses.

No original list was changed. Among the
[29 authenticated original Aichi 60s](../aichi-2026/full-decklists.json):

| Required printed names | Authenticated original rank IDs | Deck count |
| --- | --- | ---: |
| Secret Box | 4, 5, 8, 9, 11, 16, 17, 19, 22, 30 | 10 |
| Unown | 9, 17, 26, 30, 31 | 5 |
| Night Stretcher | 1, 3, 8, 19, 22 | 5 |
| Box and Night Stretcher | 8, 19, 22 | 3 |
| **Box, Night Stretcher, Unown** | **none** | **0** |
| **Box, Energy Retrieval, Unown** | **none** | **0** |
| **Box, Fog Crystal, Unown** | **none** | **0** |
| Box, Unown, Rescue Carrier | 9, 17, 30 | 3 |
| Fog Crystal and Unown (without Box) | 31 | 1 |

All three Box+Night decks (ranks 8,19,22) have **two
Battle VIP Pass** and various other Trainer/Basic Energy cards,
but **zero Rescue Carrier**, which was the third hardcoded
physical-payment card in the staged test. Moreover, none includes Unown,
the sole attacker in this demonstrated recipe. Conversely, the
three Box+Unown+Carrier originals (ranks 9,17,30) lack **all three
specific** recovery/search Items (Night, Energy Retrieval, Fog).

A native demonstrator built around a convenient staged package is
valid evidence that an interaction can execute, but it is not evidence
that the **same package exists in source decks** or that it wins games
under naturally drawn hands and skilled responses.

## Reproduction and next action

[`tests/agent49-original-field-box-recovery-unown-structural.test.cjs`](../../tests/agent49-original-field-box-recovery-unown-structural.test.cjs)
imports the unchanged original source roster, verifies exact rank
intersections and asserts **zero** complete staged packages.
Both pure tests **2/2 passed** against the actual fetched 29-entry
roster via isolated V8; they are included in the narrow on-push
Agent49 Node22 workflow. No new native game or CI success is claimed
until a run receipt is observed.

This does not rule out **other active attackers**, different paid
Secret Box targets, an ordinary direct Fog Crystal (rank31), a generic
owner-paid card line, or the three missing ranks (23,25,28).
The beneficial next integration experiment is an **owner-original-60
aware, opponent-independent** search-target planner that only proposes
recoveries and attacks the source deck actually contains, chooses
three genuinely disposable hand cards without a special non-source
Carrier requirement, and measures the actual native attacking payoff
followed by opponent counterplay.

**Benchmark status:** source card lists 29/32, three missing exact
original 60s, no fully competent opposing policy, zero competitively
qualified games, no final proven 60, no demonstrated 99.5% win rate.
