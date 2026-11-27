# Rank 24 Iron Thorns opponent policy — terminal-mill first slice

**Agent:** 18  
**Date:** 2026-11-27  
**Status:** branch-only development prototype; local decision tests only  
**Branch:** `agent18/rank24-iron-thorns-policy-20261127`

## Question

Implement the first exact-source rank-24 opponent-policy slice requested by the
Iron Thorns family coordinator without copying rank-6-only behavior. The narrow
target is the terminal Bellelba & Brycen-Man deck-out line, its VS Seeker
recovery continuation, and the optional Bellelba payment.

This is not a full rank-24 policy, a competence result, a native game, or
competitive matchup evidence.

## Exact source binding

The policy binds rank 24 in
`results/aichi-2026/full-decklists.json` at blob
`ae773f6201d7aa69d31914dbfee66f3fba692200`.

It embeds all 32 printing/count rows of the unchanged 60 and asserts the
important source differences rather than inheriting rank 6 accidentally:

- Bellelba & Brycen-Man CEC 186 ×1
- VS Seeker PHF 109 ×3
- Double Colorless Energy SUM 136 ×3
- no Crushing Hammer
- no Team Rocket's Handiwork
- no Tropical Beach
- no Palace Belt

The source-inventory SHA-256 is
`82ef5571dc3ee91c30bb490faeab86d16082109042928e4dadbde7951fccc18a`,
computed over lexicographically sorted UTF-8 rows
`count|name|set|number|language`, joined by newlines.

The card database text used for the slice is:

- Bellelba & Brycen-Man: discard three cards from the top of each player's
  deck; optionally discard three other cards from hand to make each player
  discard Benched Pokémon until they have three, opponent first.
- VS Seeker: put a Supporter from the discard pile into hand.

## Implemented policy behavior

Policy file:
`simulation/evaluation/2026-11/agent18-rank24-iron-thorns-opponent-policy.cjs`.

It keeps the established family factory contract: opponent role, physical seat
0/1, exact policy version, empty config, actor-seat binding, and standard
select-action/select-choice/select-choices/abstain responses.

The first slice is deliberately narrow:

1. If the opponent has 1–3 cards in deck, Bellelba is in hand and on the legal
   root frontier, the Supporter slot is unused, and end-turn safety is certified
   from actor-visible data, choose Bellelba.
2. If Bellelba is in the actor-visible discard instead, choose VS Seeker only
   in the same terminal window, only when Items are usable, then select
   Bellelba from the VS Seeker prompt.
3. If N is legal and in hand, choose it when public opponent
   `deckCount + handCount <= prizeCount`. N shuffles the opponent's hand into
   the deck and then draws one card per remaining Prize, so this public boundary
   makes the opponent's post-N deck exactly zero (provided it was not already
   zero) and they fail the next compulsory draw if the source survives end-turn.
4. Decline Bellelba's optional three-card payment. The pure terminal line gains
   nothing from making the opponent choose Bench discards first and should not
   burn three cards by default.
5. Once the opponent deck count is already zero, choose pass only when the same
   end-turn safety check succeeds.
6. All unrelated rank-24 roots and prompts abstain explicitly. This prevents the
   prototype from silently importing rank-6-only Crushing Hammer/Handiwork
   logic.

## Actor-visible delayed-loss guard

The current actor observation does not expose arbitrary persistent attack
effects. The versioned public event receipt does expose the opponent's complete
last-turn attack names, so this slice requires that receipt to certify the
terminal end-turn line.

It fails closed when the public receipt is absent. It also fails closed on
Poisoned or Burned because Checkup damage can be modified by public effects that
this first slice does not normalize.

The pinned Twinleaf `SpecialCondition` enum was checked at
`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`:
0 Paralyzed, 1 Confused, 2 Asleep, 3 Poisoned, 4 Burned. Non-damaging
conditions therefore do not block a terminal mill by themselves.

For `Pale Moon-GX`, the policy now distinguishes a merely pending Active KO
from a pre-draw game loss. Rank 24 contains only two-Prize Iron Thorns ex:
Pale Moon blocks the terminal line when there is no backup Pokémon or when the
candidate has at most two Prizes remaining. With a backup Pokémon and more
than two opposing Prizes remaining, that KO can resolve first and the opponent
still reaches the next compulsory draw with an empty deck, so the terminal line
remains selectable.

This remains deliberately conservative for unnormalized Poison/Burn modifiers
and for delayed effects other than the explicitly modeled Pale Moon case.

## Local decision evidence

Test file:
`tests/2026-11/agent18-rank24-iron-thorns-opponent-policy.test.cjs`.

Local Node `--test` result after the N and safety extensions: **24/24 passed**.

Covered decisions include:

- both physical seats;
- direct Bellelba at opponent deck counts 1, 2 and 3;
- safe pass at opponent deck count 0;
- missing-receipt fail-closed behavior;
- Pale Moon-GX negative;
- Poison/Burn negative and Confused non-blocking behavior;
- fatal versus survivable Pale Moon timing;
- spent/locked Supporter slot negatives;
- nonterminal Bellelba deck-count negative;
- N exact terminal boundary `deck + hand <= Prizes`, one-above negative, and
  Pale Moon/Supporter-slot negatives;
- VS Seeker root selection and Bellelba recovery;
- VS Seeker Item-lock / absent-Bellelba / spent-Supporter negatives;
- Bellelba optional-payment decline through empty-selection and explicit
  confirmation prompt;
- exact 60-card inventory and absence of rank-6-only cards;
- explicit abstention outside the implemented slice.

Initial policy commit: `ee46d56f216889498fdcc3e55e9495e972de384c`.  
N extension: `d5bc862659636496e401c711407eb6850352181f`.  
Safety refinement: `7dafad71977fd1f90cccc166266f288897fa1cf9`.  
N matcher fix found by protocol execution: `a8d3d2b4009d195a127a54f799b33d16c68cc0fa`.  
Current policy blob: `00aa83a4d3f809f6a3589eeb5ae70bb5c2d4bf21`.  
Current test commit: `cbc8c7ed6307b49319b95c623728913e1c16fe5e`.

## Limits and next evidence gate

No native Store/IPC execution, full game, workflow dispatch, merge, registration,
or competitive admission was performed or authorized. The local Node tests exercise the policy decisions directly. Separately, the
exact current policy blob and current shared protocol blob
`d8349ae6f3537816b357b8309e9ab140ddec51eb` were loaded together and run
through `validateRequest` + `validateDecision`. Protocol-valid root cases
included safe mill, fatal Pale Moon, survivable Pale Moon, Confused, Poisoned,
and terminal N; VS Seeker and Bellelba prompt continuations were also
protocol-valid before the safety refinement. This still is not native Store/IPC
or pinned-engine game evidence.

The next useful review is narrow and adversarial:

1. confirm the public-event-receipt Pale Moon screen is sufficient for the
   intended first slice and identify any other actor-visible end-turn loss
   signal that must be represented;
2. validate the exact native prompt shape for Bellelba's optional payment and
   VS Seeker under the pinned engine before native execution is authorized;
3. then extend shared rank-24 funding/denial/search decisions under the existing
   Iron Thorns family interface rather than adding another framework.

Do not count rank 24 as full-game competent from this result.
