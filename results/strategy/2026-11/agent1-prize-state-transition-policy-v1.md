# Prize-State Transition Policy v1

**Agent 1 · 27 November 2026**
**Scope:** New Moon Lockbreaker v1 and adversarial self-KO matchups.

Prize changes are not a post-hoc score. They change card legality, Energy multipliers, attack costs and the value of future KOs. The policy must update the full Prize state after every self-KO/effect KO before choosing the next action.

## Ace Trainer legality after candidate Cursed Blast

Ace Trainer is legal only if the candidate has **more Prize cards left** than the opponent.

Let:

- P_c = candidate Prizes remaining before Cursed Blast;
- P_o = opponent Prizes remaining before Cursed Blast;
- q = Prize value of any opposing Pokémon that the Cursed Blast itself Knocks Out; q=0 if the counters do not cause a KO.

Candidate Dusclops self-KOs, so the opponent takes one Prize. If the target is also KO'd, candidate takes q Prizes.

After resolution:

- candidate remaining = P_c - q;
- opponent remaining = P_o - 1.

Ace Trainer is legal iff:

P_c - q > P_o - 1.

Equivalently, with d = P_c - P_o:

d > q - 1.

### Tied-state consequences

From P_c = P_o = 6:

| Cursed Blast result | New state | Ace Trainer? |
|---|---:|---|
| 50 counters, no opposing KO | 6–5 | **yes** |
| KO one-Prize target | 5–5 | **no** |
| KO two-Prize target | 4–5 | **no** |
| KO three-Prize target | 3–5 | **no** |

This means the intended Cursed Blast -> Ace Trainer -> Night Watch line can be broken by choosing a target that is *too easy to KO*. Damage optimization and Supporter legality can point in opposite directions.

## Practical target rule

If Ace Trainer is the selected continuation:

1. compute post-Blast Prize state for every legal Cursed Blast target;
2. reject targets that make Ace Trainer illegal unless their immediate Prize gain / KO is itself the stronger continuation;
3. prefer a non-KO 50-counter placement when it both enables Ace Trainer and creates a future attack breakpoint;
4. re-evaluate after any simultaneous KO rather than carrying forward the pre-Ability Prize relation.

Do not hardcode “Cursed Blast should avoid KOs.” If candidate is already sufficiently behind, the formula can still allow a KO while preserving Ace Trainer.

## Opponent Electrode self-KO

Electrode-GX Extra Energy Bomb gives the candidate two Prizes through the source's self-KO.

Starting from 6–6, first Bomb makes the state 4–6 from the candidate perspective. Candidate is now **ahead**, so Ace Trainer is not legal.

Candidate Dusclops self-KOs can give Prizes back to the opponent:

- after one: 4–5;
- after two: 4–4.

Two self-KOs restore parity but still do not make Ace Trainer legal. They can, however, shut off rank-4/17 Reversal/Counter Energy multipliers because the Raichu player is no longer behind.

Thus the same Prize donation has different objectives by matchup: Ace Trainer enablement in one state, Special-Energy multiplier denial in another.

## Opponent Dusknoir self-KO / Bloodmoon Ursaluna

Each source PRE Dusknoir Cursed Blast self-KO gives the candidate one Prize.

That simultaneously:

- moves the candidate closer to winning;
- makes candidate Ace Trainer harder to enable because candidate has fewer Prizes left;
- reduces Bloodmoon Ursaluna ex's Blood Moon cost by one through Seasoned Skill.

Two source Dusknoir self-KOs therefore reduce Blood Moon by two Colorless and can also erase a candidate 'behind on Prizes' condition.

Never score the gifted Prize without the Ursaluna cost transition.

## Altered Creation is conditional on KO mechanism

Altered Creation's extra-Prize clause applies when the opponent's **Active Pokémon is Knocked Out by damage from those attacks**.

Therefore the ledger must distinguish:

- attack-damage KO of the Active: extra Prize applies while the effect is live;
- Ability/effect KO such as Cursed Blast: extra Prize clause does not apply;
- self-KO by the source's own Ability: ordinary printed Prize value goes to the opponent, not Altered-Creation bonus.

Do not globally add +1 to every KO after Altered Creation.

## Prize transition operator

Represent each event as:

T = (recipient, amount, cause, target, active_at_KO, modifiers).

Apply all simultaneous KO Prize events, then recompute:

- Prizes remaining for both players;
- Ace Trainer legality;
- Reversal/Counter Energy conditions;
- Bloodmoon Ursaluna Seasoned Skill discount;
- final-Prize win conditions;
- any comeback card / Prize-dependent attack condition.

Do not decide the next root from a partially updated Prize state.

## Required acceptance cases

- ACE-CURSE-NONKO: tied state, Dusclops self-KOs but target survives; Ace Trainer must become legal.
- ACE-CURSE-KO1: tied state, Blast also KOs a one-Prizer; Ace Trainer must remain illegal at parity.
- ACE-CURSE-KO2: tied state, Blast KOs a two-Prizer; candidate moves ahead and Ace Trainer remains illegal.
- RAI-BOMB-TWO-DUSCLOPS: after first Bomb and two candidate self-KOs from an initially tied state, recognize parity rather than Ace-Trainer eligibility.
- R31-GIFTED-PRIZE-DUAL-EFFECT: opponent Dusknoir self-KO both advances candidate Prize progress and discounts source Ursaluna.
- R19-ALTERED-CREATION-CAUSE: apply extra Prize only to eligible Active attack-damage KOs.

## Trace requirement

Whenever a line includes self-KO or effect KO, record the pre-event Prize state, every simultaneous KO and printed Prize value, post-event Prize state, and all legality/cost conditions that changed.

No deck change or competitive result follows.