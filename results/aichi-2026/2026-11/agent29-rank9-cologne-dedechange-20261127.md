# Rank 9: preserve and unlock Dedechange against Lockbridge's Active Wobbuffet

Agent29, 2026-11-27. Development-only rank-9 tactical slice v17 on `agent29/rank9-tactical-slice-20261127`. Exact tested code/test commit `62be34de3df07e3ab6b8ccf88bb38d7276f763ee`, source list blob `ae773f6201d7aa69d31914dbfee66f3fba692200`. Both registered candidate 60s and the original Aichi rank-9 60 remain unchanged.

## Actual decision change

Rank 9 contains one Canceling Cologne ASR 136, one Dedenne-GX UNB 57, one Squawkabilly ex PAL 169 and two Electrode-GX CES 48. Lockbridge contains Wobbuffet PHF 36. The supplied English card pool (swsh10-136, sm10-57, xy4-36) establishes that Cologne removes the opponent's Active Pokémon's Abilities for the turn, Bide Barricade suppresses non-Psychic Pokémon's Abilities even in hand, and Dedechange is a hand-to-Bench trigger. Benching Dedenne before clearing a live Bide Barricade therefore wastes that trigger; a later Cologne cannot restore it.

v16's draw predicate considered Silent Lab and Path to the Peak, but ignored Active Wobbuffet. v17 now blocks draw-engine placement/reset under known live or unknown Bide Barricade, and only spends Cologne when the public Wobbuffet suppression entry explicitly says the Ability is active, Dedenne is held and not already in play/discard, a Bench place and independent legal play are available, the deck is not thin, and the existing protected-reset valuation approves the projected remaining hand. After the Item, the worker reevaluates the updated observation; it does not simulate successful suppression or force a subsequent action. Direct final KO wins still precede this connector. The Cologne decision does not rely on or attempt to execute the still-unavailable Extra Energy Bomb transfer adapter.

## Results

Ran the exact committed CJS policy and test module bodies in the code-mode JavaScript runtime using the repository's actual protocol module. All **165 tactical assertions passed**, including all 150 prior cases and 15 new cases:

- Both physical seats: Cologne before Dedenne, do not prematurely bench into the active lock, observed suppression permits Dedenne.
- Unknown suppression, Item lock, independent Ability-Pokémon play lock, Path, Silent Lab, full Bench, protected evolution, unsupported Bomb-only line: no Cologne.
- Known final-Prize direct attack precedes Cologne.

Policy blob `45741d29d50d6e7af46d1ec56c765a65ac9a0623`; test blob `6052138d5236c6578c67627af0b12b79d4ad539e`; protocol blob `468f957b17656f41cf9af8c77e6954bb79ea5695`. The additional 15 use actual frontier and decision validators on synthetic inputs. No complete observation validator, Node worker IPC, native Store, game, CI dispatch, merge or competitive evidence. This is one bounded actor-policy decision repair, not proof of an optimal draw reset or a complete rank-9 policy. Native projection of explicit Bide Barricade suppression and the complete Cologne → Dedechange chain still require later authorized native evidence. Conservative non-play if status is missing may leave legitimate opportunities unused.

## Next

Keep this development branch separate. Primary remaining rank-9 capability is coordinated native exact multi-transfer Extra Energy Bomb resolution; do not build a competing host or dispatch gated workflows. Once that capability is available, compare Cologne for immediate Dedechange against saving it for a concrete same-turn Bomb line. Preserve the singleton and do not infer a matchup improvement from synthetic decisions.
