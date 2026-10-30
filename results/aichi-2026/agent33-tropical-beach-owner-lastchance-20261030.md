# Agent 33: Tropical Beach after unsupported owner Pass

30 October 2026. This work implements the earlier [Agent32 native-bot
scoring diagnosis](../twinleaf/agent32-tropical-beach-scoring-root-cause.md)
without changing pinned Twinleaf. The pinned `UseStadiumAction(clientId)`
constructor and exact Tropical Beach BWP reducer were read from the
`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` source revision.

## Mechanism and scope

Agent32 observed ten source-locked low-hand passes while Tropical Beach was
in play (rank-6 Iron Thorns opponents), yet pinned SimpleTacticsAi treated
the Stadium's end-turn as a large negative turn-pass score and passed
instead of drawing. This is a **missing choice in an existing bot**, not a
proved game loss.

Added `simulation/twinleaf/agent33-tropical-beach-lastchance.cjs` and
a development-only `tropicalBeachLastChance:true` option to the existing
`agent34-actor-only-root-policy.cjs`. The selector runs **after** all
existing enabled actions, printed attacks, Energy attachments, mobility and
Trainer decisions have declined. It offers the native
`UseStadiumAction` only when an Active exists, Tropical Beach is publicly
in play on either side, the acting player has not used a Stadium effect
this turn, the owner's hand needs at least two cards, and at least
six cards will remain in the deck after the draw. The new
`stadiumUsedTurn` public owner resource is explicitly exported in
`actor-observation-contract.cjs` instead of peeking at raw private State.
The existing default policy is unchanged.

The deck conservation threshold and two-card minimum are conservative
*policy preferences* and not paper legality restrictions. Many late-control
turns should continue to Pass despite a technically legal Beach. This
branch does not assume the opponent's concealed cards or the content of
either player's unseen deck or Prize cards.

## Reproducible checks and limitations

`tests/agent33-tropical-beach-lastchance.test.cjs` tests owner-only,
both-side public Stadium visibility, exhausted turn quota, thin deck,
hidden information invariance and default-off root behavior.
Eight helper-only cases passed locally in Node22 before the final root
integration; the ninth direct root integration is newly added and must
execute before reporting it passed.

`tests/agent33-tropical-beach-pinned-native.test.cjs` stages both
physical player slots with genuine pinned `Store`, `Player`,
`UseStadiumAction`, `Tropical Beach BWP`, 3-card owner hand,
12-card deck, and valid Active/Prize boards. It asserts four cards
drawn, owner turn ended, opponent hand unaffected, Stadium-use quota
consumed, and that a repeat-use attempt is rejected. This file has **not
yet been compiled/executed** here: the manual-only
`.github/workflows/aichi-lock-board-tests.yml` exposes the
`agent33_tropical_beach_native` input for that explicit check.
A genuine native Store acceptance/settlement claim must await
successful CI and inspection of its actual execution. Do not infer
native gameplay from source review or synthetic pure tests.

The resulting end-turn choice has no prospective field simulation,
opponent reply, paper-clock validation or qualified-game outcomes.
No decklist is changed. Rank23/25/28 originals remain missing.

## Held Beach: a two-root line with no active Stadium

Follow-up v2 `agent33-tropical-beach-owner-lastchance-v2-held-stadium`:
the same owner flag can now propose `play-tropical-beach` from hand, but
**only when there is no Stadium in play**, owner Stadium-card placement is
allowed and unused, and the projected hand after playing Beach would qualify
for the same two-card draw and six-remaining-deck guard. The root then
decodes a genuine `PlayCardAction` onto the board. Its next owner
observation can see Beach publicly in play and proposes native
`UseStadiumAction`, which consumes the separate Stadium-effect use quota.

Deliberately leaves any existing own/opponent Stadium untouched to avoid
destroying Sky Field Bench capacity, discarding Beach into Chaotic Swell,
or guessing whether a lock is beneficial. Holder and owner are authenticated
from own hand/public zones. Four additional pure tests cover held->play->use,
replacement veto, play-permission veto and missing quota; all **12 helper
tests passed locally**. A newly added pinned native two-seat held-card
test asserts exact native Stadium placement then draw-to-seven and end-turn.
This test is registered in existing manual CI, but no compiled CI result
is claimed in this artifact.
