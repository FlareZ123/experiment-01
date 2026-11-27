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
3. Decline Bellelba's optional three-card payment. The pure terminal line gains
   nothing from making the opponent choose Bench discards first and should not
   burn three cards by default.
4. Once the opponent deck count is already zero, choose pass only when the same
   end-turn safety check succeeds.
5. All unrelated rank-24 roots and prompts abstain explicitly. This prevents the
   prototype from silently importing rank-6-only Crushing Hammer/Handiwork
   logic.

## Actor-visible delayed-loss guard

The current actor observation does not expose arbitrary persistent attack
effects. The versioned public event receipt does expose the opponent's complete
last-turn attack names, so this slice requires that receipt to certify the
terminal end-turn line.

It fails closed when:

- the public receipt is absent;
- the prior opponent attack history contains `Pale Moon-GX`; or
- the Active Pokémon has any Special Condition.

The Special-Condition rule is intentionally conservative because the current
view does not encode every Checkup interaction needed to prove exact lethality.
This first slice therefore sacrifices some legal terminal opportunities rather
than claim a guaranteed win from incomplete public information.

## Local decision evidence

Test file:
`tests/2026-11/agent18-rank24-iron-thorns-opponent-policy.test.cjs`.

Local Node `--test` result: **20/20 passed**.

Covered decisions include:

- both physical seats;
- direct Bellelba at opponent deck counts 1, 2 and 3;
- safe pass at opponent deck count 0;
- missing-receipt fail-closed behavior;
- Pale Moon-GX negative;
- Special-Condition negative;
- spent/locked Supporter slot negatives;
- nonterminal deck-count negative;
- VS Seeker root selection and Bellelba recovery;
- VS Seeker Item-lock / absent-Bellelba / spent-Supporter negatives;
- Bellelba optional-payment decline through empty-selection and explicit
  confirmation prompt;
- exact 60-card inventory and absence of rank-6-only cards;
- explicit abstention outside the implemented slice.

Policy commit: `ee46d56f216889498fdcc3e55e9495e972de384c`.  
Test commit: `d1ff6dcb860ea7194c26dea95559e848b12e0c29`.

## Limits and next evidence gate

No native Store/IPC execution, full game, workflow dispatch, merge, registration,
or competitive admission was performed or authorized. The local tests exercise
the policy decisions directly; they are not a substitute for the shared worker
protocol or pinned Twinleaf.

The next useful review is narrow and adversarial:

1. confirm the public-event-receipt Pale Moon screen is sufficient for the
   intended first slice and identify any other actor-visible end-turn loss
   signal that must be represented;
2. validate the exact native prompt shape for Bellelba's optional payment and
   VS Seeker under the pinned engine before native execution is authorized;
3. then extend shared rank-24 funding/denial/search decisions under the existing
   Iron Thorns family interface rather than adding another framework.

Do not count rank 24 as full-game competent from this result.
