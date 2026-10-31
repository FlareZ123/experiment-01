# Original rank15 Mega Lopunny: Jet / evolution ordering is a 170-damage rules branch

**31 October 2026 | Agent8 | rule-backed mechanic, test awaiting compiled native validation, zero qualified games.**

## Official paper-rules counterexample to intuitive persistent movement

Pokémon Card Game's [official Japanese Q&A](https://www.pokemon-card.com/rules/faq/search.php?page=613&regulation_faq_main=&sc_group_id=527) asks:

> ベンチにいるコソクムシをバトル場のポケモンと入れ替えた番に、コソクムシをグソクムシャGXに進化させ、ワザ「であいがしら」を使った場合、90ダメージを追加することはできますか？

Answer **いいえ、できません** (“No, you cannot”). The question describes moving an already Benched **Wimpod** to Active, **then evolving** it to Golisopod-GX that turn and using First Impression. The **+90** movement bonus does not apply. See also section **E-25** of the provided official Advanced Player's Rulebook (the card's movement condition is checked on the Pokémon using that attack), and its E-25 example Keldeo ex Gale Thrust.

The official ruling is specific to Golisopod-GX; applying it to a card using the same **“If this Pokémon moved from your Bench to the Active Spot this turn”** condition, Mega Lopunny ex PFL84, is a text-equivalence inference rather than a separately retrieved Mega Lopunny card FAQ. It resolves an important apparent contradiction: evolving can remove/replace characteristics of the top Pokémon that a naïve longitudinal event ledger might preserve indiscriminately.

## Exactly printed 2026 Aichi rank15 choice

The source original **rank 15 Ryotaro Nozawa** registered **two Buneary PFL #83**, **two Mega Lopunny ex PFL #84**, **two Jet Energy PAL #190**, and a Bunnelby PRC line. Printed Mega Lopunny ex is Stage1 evolving **directly from Buneary** and has a one-Colorless **Gale Thrust 60 +170 if moved from Bench to Active this turn**. Printed Jet Energy provides one Colorless and switches its Benched recipient into Active as it is attached from the hand.

Two same-hand, different-order legal lines for a Buneary that has already spent at least the required turn in play:

| Sequence using one Mega and one Jet | Native top-card movement identity (pinned) | Expected Gale Thrust under transferred official ruling |
| --- | --- | ---: |
| **Evolve Buneary on Bench → attach Jet to evolved Mega → forced Bench-to-Active switch → attack** | Mega Lopunny ex is the card recorded as moved | **230** |
| **Attach Jet to Benched Buneary → forced switch of Buneary to Active → evolve into Mega → attack** | Buneary was recorded as moved; evolved Mega was not | **60** |

The extra damage is **170** in this conditional attack comparison. This is a tactical sequencing fact. In a lock-focused rank15 list, consuming the one-per-turn attachment on Jet and abandoning a Bunnelby Active or Vileplume lock can also impose high cost; the report makes no assertion that the Jet line is optimal across actual opponent decisions.

## Pinned Twinleaf explanation and pending test

The pinned engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` stores the specific **current top Pokémon card's ID** in `Player.movedToActiveThisTurn` during `player.switchPokemon` and checks `MOVED_TO_ACTIVE_THIS_TURN(player,pokemon)` against the printed **attacking** Mega Lopunny card ID. The Stage1 evolution changes that top-card ID. This is compatible with the official **move first, evolve second = no extra damage** ruling.

A new two-seat exact-original-print Store regression is committed at `tests/agent8-rank15-jet-evolution-order-native.test.cjs` (latest source-print fix commit `210de9fcc5d8304f4d6daccc1466d4efd0159209`). It resolves `PFL 83/84` by native `set + collector` because the pinned engine's `fullName` is **`Buneary M2`** / **`Mega Lopunny ex M2`**, not a guessed `PFL` suffix. It stages the correct native hand, uses genuine evolution/Jet `PlayCardAction` sequences, checks native movement marker and settles Gale Thrust. **The new test is unexecuted** and was not added to the smoke workflow because attempts to edit the workflow were blocked after the first smoke integration batch. Do not claim the 230/60 outcome as native validated until compiled CI runs the test.

## Design consequence

The proposed public event-history annotation must be keyed to **current face-up attack-source card identity** and rule-relevant evolution timing. A blanket `wasEverMovedThisTurn` flag on the full underlying Pokémon stack would incorrectly grant the bonus after evolution, contradicting the official FAQ. For ALS optimizers this is a concrete counterexample to treating search edges `Jet → Active Mega` and `Evolution → Mega` as commutative; **their order changes attack damage** with the same two resource cards.

**Benchmark unchanged:** 29/32 exact original-source 60s, 0 competitive-qualified games, 99.5% objective unproven.
