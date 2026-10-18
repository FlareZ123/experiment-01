# Conditional solo-Snorlax knockout threshold: preserving board Psychic Energy

**Agent 19, 18 October 2026.** Final pinned compiled manual CI: [39105719146](https://github.com/FlareZ123/experiment-01/actions/runs/39105719146) (HEAD `7431eae5e1cba3360c97880538c001cd23bfa74a`; Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; artifact `12128810931`). **Controlled constructed turn, no exact source deal, no qualified competitive win.**

## Question

In a single well-defined board configuration, does the attachment destination after escaping the solo Snorlax PGO Block Ability determine whether a ready Shadow Rider Calyrex VMAX can attack for a knockout in the same turn?

Printed references:

- [Shadow Rider Calyrex VMAX CRE 75](https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/series/swsh6/75/): Max Geist for 10 plus 30 per Psychic Energy attached to all your Pokémon; requires three Colorless Energy.
- [Snorlax PGO 55](https://www.pokemon.com/uk/pokemon-tcg/pokemon-cards/series/pgo/55/): 150 HP, Block prevents opposing Active's *retreat*.
- Supporter texts and first compiled Store comparison: [three-Supporter board transitions](snorlax-switch-supporter-comparison.md). Also compare [Switch SVI 194](https://www.pokemon.com/uk/pokemon-tcg/pokemon-cards/series/sv1/194/), a normal Item switch.

## Controlled prepared board

On game-global turn 3, the candidate's **Active Shadow Rider Calyrex V CRE** has two Basic Psychic Energy and **Float Stone BKT**. A previously evolved **Shadow Rider Calyrex VMAX CRE** occupies its Bench with three Psychic Energy attached. The opponent has one **Snorlax PGO** Active with Tool Jammer BST and **no other Pokémon in play**. The candidate holds exactly one alternative Trainer for this tested action.

These in-play card identities and counts fit as a subset of published rank-1 champion and rank-3/rank-7 Snorlax print inventories. The constructed rest-of-deck and six Prize cards are **diagnostic fillers**, not the source 60s, and there is no observed legal setup sequence from a randomly dealt start into this prepared board. Each arm dispatches the actual pinned `PlayCardAction`, settles real card prompts, then dispatches the same `AttackAction('Max Geist')`. No opponent response occurs before the attack because each arm is the candidate's own turn.

## Observed actual attack resolution

| One Trainer in hand | Psychic Energy remaining in play for Max Geist | Printed damage | Opposing solo Snorlax after attack | Our Prizes taken | Supporter used before attack |
| --- | ---: | ---: | --- | ---: | ---: |
| Cassius XY 115 | 3 | 100 | Survives with 100 damage | 0 | 1 |
| AZ PHF 91 | 3 | 100 | Survives with 100 damage | 0 | 1 |
| Bird Keeper DAA 159 | 5 | 160 | **Knocked Out** | 1 | 1 |
| Tate & Liza CES 148, switch mode | 5 | 160 | **Knocked Out** | 1 | 1 |
| Switch SVI 194 | 5 | 160 | **Knocked Out** | 1 | **0** |

The printed damage values follow `10 + 30 × (number of attached Psychic Energy)`. The *Store observations* separately show the surviving Snorlax with 100 damage in the two removal arms and no opposing Active plus one Prize taken in the three preservation arms. With no opposing Bench, each knockout arm reaches engine phase 7, representing the sole-Pokémon loss condition. Every scenario completed with **zero exception messages**, resolving required prompts. The full artifact includes actual prompt sequences and these fields.

This is an important **discrete tactical threshold**: a seemingly minor difference in where two Energy end up changes a same-turn knockout under this particular board. An Item Switch reaches the same threshold without consuming that turn's Supporter allowance. Bird Keeper additionally drew three before the attack; Tate & Liza also offers a distinct shuffle-and-draw mode in other states.

## Reproduction and falsification limits

- [Reporter](../../simulation/twinleaf/snorlax-max-geist-continuation.cjs), [asserting regression](../../tests/snorlax-max-geist-continuation.test.cjs) and existing [manual Snorlax workflow](../../.github/workflows/aichi-snorlax-retreat.yml). All are outside pinned upstream. Tests fail if knockout, energy count, prize count or pre-attack Supporter use differ.
- Earlier [CI 39105286276](https://github.com/FlareZ123/experiment-01/actions/runs/39105286276) exposed a **measurement error**: the tester checked `supporterTurn` after attack, when the game had advanced to the next turn and reset the counter. The subsequent [CI 39105548414](https://github.com/FlareZ123/experiment-01/actions/runs/39105548414) passed after snapshotting Supporter use *before* attack. Final 39105719146 passed again after changing the illustrative attached Tool from an unlisted Air Balloon to source-inventory **Float Stone**.
- A real source deal need not have the Bench VMAX evolved, charged with three Energy or available at the moment Snorlax Block traps the original Active. There is no measured prevalence for the prepared board, no opponent response to the setup, no prior-turn or known-Prize witness, no full match policy, no clock qualification and no tested 60-card substitution. This is a **conditional action-conversion proof**, not a tournament win-rate contribution.
- **Source-60 follow-up:** preserve a full 60 identity ledger in actual rank-1 vs rank-3 and rank-7 source openings, then test explicitly specified counter-slot candidates and genuine play policies. Detect the legal preconditions for a turn where changing Active enables an immediate attack, and record missed opportunities as well as positive conversions. Since the opponent is not guaranteed to remain solo Snorlax, include the next opponent decision and objective state rather than equating a switch with winning.

## Research consequence

The same card slot can produce widely different effects depending on the trapped Active's attached Energy, ready Bench status, opponent remaining Pokémon and whether the Supporter turn is needed elsewhere. When comparing Bird Keeper, Tate & Liza or Switch against existing ACE SPEC/Tool plans, optimize the frequency and **opportunity cost of reachable lethal transitions**. Graph reachability or a successful switch action alone would overstate their strength. No claim is made that any of these one-for-one substitutions improves the frozen champion or wins the full Top-32 field.
