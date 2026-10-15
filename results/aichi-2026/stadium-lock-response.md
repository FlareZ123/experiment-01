# Opening accessibility of Stadium counterplay to Budew plus Path

**Scope:** initial 7 cards of Aichi 2026 rank 1 Shadow Rider Calyrex versus a hypothetical board in which Path to the Peak and an existing Itchy Pollen Item restriction are active. This is a **card-visibility calculation** under the 60-card source list, with six random Prize cards after the opening hand. It is not a probability of such a board state, successful turn, or a game win.

## Counted source pieces

- 14 Basic Pokémon total, including 3 Shadow Rider Calyrex V that can hold Forest Seal Stone.
- 3 Stadiums: Sky Field ×2 and Dimension Valley ×1. Each can replace the opponent’s Path to the Peak while Item play is disallowed.
- Forest Seal Stone ×1, a Pokémon Tool. Its Star Alchemy can search any Stadium still in the deck even while Path to the Peak suppresses Rule Box Pokémon Abilities. The Tool needs an attached Pokémon V and an unused VSTAR Power.

## Exact random-opening results

| Event | Probability |
| --- | ---: |
| Seven-card opening contains at least one Basic (unconditional) | 86.14093% |
| Directly has at least one of the three Stadiums, given valid opener | **30.21517%** |
| Has Stone and Shadow Rider V but no Stadium, given valid opener, before Prize risk | 2.85887% |
| All three Stadiums Prized, given no Stadium in opening | 0.08538% |
| Stone plus Shadow Rider V and at least one Stadium left in deck, no Stadium in opener | **2.85643%** |
| Either disjoint direct Stadium or Stone route, given valid opener | **33.07160%** |

## Derivation

Let N=60, H=7, B=14 Basic, S=3 Stadium, F=1 Forest Seal Stone, V=3 Shadow Rider V, and P=6 Prizes. Let C(n,k) denote combinations.

- Valid opener count: C(60,7) - C(46,7).
- Direct Stadium and valid Basic count: C(60,7) - C(46,7) - C(57,7) + C(43,7).
- Disjoint Stone plus V without Stadium count: C(56,6) - C(53,6). Stone consumes one of the seven opening slots.
- All three Stadiums are among six Prizes conditional on no Stadium in opening: C(50,3)/C(53,6).
- Divide each relevant joint count by the valid-opener count. Subtract the Stone branch’s all-Prized failure and add the disjoint branch to direct Stadium access.

## Interpretation and missing game-state dependencies

The 33% approximate opening-hand access is a low-information baseline. It excludes turn draws, mulligan bonuses, card effects played before lock, alternative search routes, Bench space, Star Alchemy already being spent, Tool denial, Stadium-play contention, and how quickly either opponent lock comes online. Path to the Peak is a Stadium effect, so Pokémon Ranger or Channeler cannot remove it by removing effects **of attacks**; they could separately remove Budew’s lingering Item restriction. One already-played Stadium or any other condition can change the exact legal action sequence.

These probabilities must **not** be interpreted as failure chances or win-rate evidence. They are a narrowly defined comparison of two immediate resource channels under a hypothetical adversarial constraint.

Source: [Aichi rank 1 exact decklist](full-decklists.json), [typed Ability scope](ability-scope-matrix.md), [Forest Seal Stone ruling](forest-seal-stone-ruling.md). Reproduce with [scripts/aichi_stadium_lock_response.cjs](../../scripts/aichi_stadium_lock_response.cjs).
