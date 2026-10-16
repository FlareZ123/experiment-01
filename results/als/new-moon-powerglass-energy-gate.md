# New Moon Powerglass energy gate: eleventh required Prize role

**Agent 27, 16 October 2026.** This extends the [10-role initial Prize feasibility analysis](new-moon-prize-feasibility.md) with the **Basic Psychic Energy** needed by the source pilot's prescribed Powerglass-after-Horror-House acceleration line. It remains a static initial-Prize feasibility test, not evidence of competitive wins or actual two-turn execution.

## Source and necessary resource

The recovered [52nd-place New Moon Perfection inventory](new-moon-perfection-source-60.json) holds exactly **three Basic Psychic Energy** and **three Telepathic Psychic Energy**. [Pokémon's printed Powerglass text](https://www.pokemon.com/uk/pokemon-tcg/pokemon-cards/series/sv6pt5/97/) permits an end-of-turn attachment **only from Basic Energy in the discard pile** to its Active holder. The [official Telepathic Psychic Energy entry](https://asia.pokemon-card.com/sg/card-search/detail/25058/) categorizes the latter card as **Special Energy**. Thus a physically accessible Basic Psychic Energy is a necessary extra role for the specific Powerglass acceleration branch. A Telepathic Psychic Energy cannot replace it in the Powerglass effect.

This role is added alongside the original four non-Basic roles (Dusclops, Ace Trainer, Path to the Peak, Powerglass, all at two copies) and six Basic roles, with two Hisuian Heavy Ball rescues modeled optimistically. All counts come from the same source 60. The entire comparison conditions on a legal initial seven and a later six-card Prize deal.

| Event, conditional on valid opener | Earlier 10-role audit | With Basic Energy role |
| --- | ---: | ---: |
| Insufficient unprized Heavy Balls for stranded Basic roles | 1.090438727% | 1.090438727% |
| At least one fully Prized required non-Basic role | 3.403086778% | 3.461906421% |
| Union of structural capacity failures | 4.484944319% | **4.543724187%** |
| Complement: all named roles Prize-feasible | 95.515055681% | **95.456275813%** |

Exact enhanced union: **155146286885 / 3414518146676**. The extra Basic-Energy role adds **0.058779867 percentage points** of accepted opening configurations blocked in the revised union, accounting for overlap.

## Validation and limits

Run `python -m scripts.new_moon_prize_audit` for both model versions. The source-locked entry point passes `require_powerglass_basic_energy=True` to the same [exact Prize-card enumerator](../../scripts/combo_prize_feasibility.py), and the independent [regression](../../tests/test_combo_prize_feasibility.py) checks both source fractions while retaining miniature physical hand-and-Prize enumeration and the previous Agent 3 dual-singleton cross-check.

Even the 95.456% structural feasibility figure is only an **optimistic upper bound on the availability of this precise pre-Prize-taking resource configuration**. Having the Basic Energy outside Prizes does not put it into the discard, attach it, create the other two Energy attachments, or ensure a legal Night Watch attack. Search, bench, evolution timing, status and opposing Item/Ability locks are unmodeled. Alternative play lines, later Prize-taking and different strategies can succeed when this particular sequence fails. Therefore this figure is **not a deck win-rate ceiling**.
