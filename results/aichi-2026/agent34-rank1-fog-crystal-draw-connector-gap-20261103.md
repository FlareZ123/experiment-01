# Rank-1 Shadow Rider: missing Fog Crystal owner root biases Underworld decisions

**Agent 34 | 3 November 2026 | source-card-text and pure owner-policy counterexample; no simulated game-performance claim.**

## Printed facts

The authenticated original rank-1 Aichi Shadow Rider printed 60 contains **11 Basic Psychic Energy (MEE 13)** and **4 Fog Crystal (CRE 140)**. This is directly taken from `results/aichi-2026/full-decklists.json` and checked against the user's supplied full card-list ZIP `cards/en/swsh6.json`. The same card source states:

- `Shadow Rider Calyrex VMAX CRE 75` **Underworld Door:** once per turn, attach a Psychic Energy from hand to a Benched Psychic Pokémon. If that happens, draw two cards.
- Its printed **Max Geist:** requires three Colorless Energy, does 10 plus 30 for every Psychic Energy attached to all of the player's Pokémon.
- `Fog Crystal CRE 140` can search the deck for a Psychic Energy card or a Basic Psychic Pokémon, reveal it, put it into hand, and shuffle. It is an Item.

These are printed source facts; later card effects, lock status, tournament legality, prizes and type-changing effects must still be evaluated individually.

## Pure owner-policy counterexample

`simulation/twinleaf/agent34-actor-only-root-policy.cjs` contains no Fog Crystal case or item-to-Psychic retrieval adapter. With active original-source VMAX holding exactly **two** Basic Psychic, another eligible Benched VMAX, an owner hand holding only `Fog Crystal CRE`, owner ordinary Energy still unspent, no public Item lock, unspent Underworld source marker, and no other viable proposal, calling `chooseActorRootIntent` returns:

```json
{"kind":"pass","reason":"no-supported-owner-visible-root"}
```

This is checked in the **actual project policy code**, independent of any synthetic card effect or fake win rate, by `tests/agent34-rank1-fog-crystal-recovery-gap.test.cjs`. The same Active with a held Basic Psychic and no available Underworld source produces a typed Basic Psychic attachment, as a control. Opponent concealed hand/deck/Prize getters in a separate test throw if read, confirming this minimal distinction needs only owner/public information. Regression CI [41670734878](https://github.com/FlareZ123/experiment-01/actions/runs/41670734878) **PASS**, pinned exact Twinleaf native compile and unrelated Underworld tests PASS too.

The counterexample is a **paper-plausible search opportunity**, not a claim that every historical Pass held a usable Fog Crystal. The owner might have no Psychic in deck or could face Item lock despite the crafted example's absent blocker. A complete real game source qualification must observe physical held Fog, public locks and available deck search targets with appropriate information provenance.

## Correct conditional two-card-draw comparison

For an owner with Active VMAX at two Psychic, one held Psychic, unused ordinary attachment, and an actual unspent playable Underworld:

- **Manual first:** attach to Active, paying the printed three-Colorless Max Geist cost now, without spending the Underworld once-per-source Ability. This guarantees Energy *cost*, subject to other attack prohibitions.
- **Underworld first:** attach the held Psychic to an eligible Psychic Bench, draw two. When those cards include a Basic Psychic, manual attach to Active and attack. When they contain a usable Fog Crystal and a deck-remaining Psychic, play Fog Crystal and search Energy before the unused manual attachment. Other search/draw connectors can add further pathways. If all fail, Active remains underpowered for the current attack.

With a uniform remaining deck of `D` cards containing `K` Psychic Energy and `F` Fog Crystal, the probability of at least one Psychic or Fog within the two raw draws is:

`1 - ((D - K - F) * (D - K - F - 1)) / (D * (D - 1))`, subject to `D >= 2` and `0 <= K+F <= D`.

Examples:

| Hypothetical deck `D` | Psychic `K` | Fog `F` | Direct Psychic in 2 draws | Psychic or Fog in 2 draws |
| ---: | ---: | ---: | ---: | ---: |
| 30 | 5 | 2 | 31.03% | 41.84% |
| 30 | 5 | 4 | 31.03% | 51.72% |
| 20 | 3 | 2 | 28.42% | 44.74% |

The last column describes drawn card types, not successful paper legal attacks. Fog's branch requires a live Psychic remaining in deck and an Item play/valid target under actual rules. An Underworld-first successful branch may receive extra Bench Energy and card advantage while still attacking; a failed branch may forfeit an immediate attack. Exact posterior K/F information changes after a K1 deck search, Prize knowledge and previous actions.

## Consequence for common opponent and deck evaluation

Our [fresh 32-pair native last-Psychic Active-funding study](agent34-rank1-heldout-active-funding-native-20261103.md) found one real same-turn Active manual attachment enabling attack and **three extra** original-source AttackActions overall, without an increase in native source terminals. The root policy's lack of Fog search may be responsible for some apparent treatment advantages. This is a **missing connector/policy fidelity** problem, not evidence that the single human paper optimal choice has been established.

The distinct broad [Bench-recipient printed-attack-gap heuristic](agent34-rank1-heldout-psychic-recipient-negative-20261103.md) had a negative native outcome profile and remains disabled. Both proposals remain **default OFF**. Shared policy steward Agent23 and generic Trainer-opportunity researcher Agent29 received direct reproducible evidence. Before integrating, require paper-valid owner search, exact resources, opponent response and matched ongoing opportunities. The Aichi field still lacks full 60s for ranks 23/25/28 and has zero qualified competitive-paper game wins.
