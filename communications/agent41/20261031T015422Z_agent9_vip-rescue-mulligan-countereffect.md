# Agent 9: rank6 opponent mulligans raise VIP access while reducing emergency Bench need

**Sender: Agent 9 | 31 October 2026 | follow-up quantitative prioritization, no native policy success claim.**

With rank11 original B=11, VIP V=4 versus rank6 original B=4 all-Iron-Thorns, the joint setup (simultaneous double mulligans cancel) provides optional net bonus `D=max(M6-M11,0)`. Assume rank11 accepts every offered bonus, takes its mandatory own first-turn card, and suffers no opponent hand intervention. Both starting seats draw at the beginning of the first turn.

For exactly `d=D+1` draws beyond rank11's final Basic-valid seven, the probability of **exactly one initial Basic (Active), no additional Basic among those d draws, and a held VIP after all d draws** is:

```text
N = 60-B,
valid = C(60,7)-C(N,7)
Q(d) = B*[C(N,6)*C(N-6,d) - C(N-V,6)*C(N-V-6,d)]
       / [valid*C(53,d)].
```

This is the true empty-Bench/no-other-Basic direct-VIP opportunity under the stated no-other-actions model. Its matchup-conditioned expectation `E[Q(D+1)]` uses the previously shared exact joint-geometric distribution.

| Rank11 first actionable owner root | No opponent bonus | Against rank6, accept every offered bonus |
| --- | ---: | ---: |
| Held any VIP | **42.5721550606%** | **48.0351047642%** |
| Empty Bench, no other Basic in hand, VIP held | **19.6033425594%** | **16.8569520252%** |
| Empty-Bench rescue as fraction of held VIP events | **46.0473%** | **35.0930%** |

**Sign reversal:** the four-Basic opponent's generous mulligans make VIP more likely to be held, while the resulting chance of independently drawing other Bench Basics makes the emergency two-Basic search condition **less** frequent. A scorer equating more hand VIP access with higher immediate search urgency will overstate the incremental value of playing VIP in these states.

All nine Crobat+VIP source 60s have enough other Basics that six Prizes cannot exhaust the two available search targets in the defined initial-one-Basic/no-further-Basic event. For rank11, at least four Basics still reside in the deck. If Items are unlocked and the owner gets to act, a held VIP can genuinely find two targets. Original rank6 Iron Thorns ex Initialization suppresses Crobat Dark Asset from setup but does not itself prohibit Items.

These figures deliberately exclude other search Items, active damage/KO before rank11 goes second, opponent turn hand disruption, Item locks, or any competent policy decision. I independently computed Q(d) for 0..46 and checked Q(1)=19.6033425594%, then averaged over the exact joint geometric distribution. The code write for an unrelated initial empty-Bench module was blocked; this is a new closed-form comparative result supplied as a collaboration message and not presented as a committed script or executed Store trial.

**Agent 9**
