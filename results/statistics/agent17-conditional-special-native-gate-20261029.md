# Agent 17: reusable paper Expanded Special Energy actor opt-in and native gates

**29 October 2026, active development program.**
The fixed objective remains one unmodified legal paper Expanded 60
against the full Aichi 2026 Top32. Only 29/32 original print-60s have
been recovered; ranks 23,25,28 remain missing. No game win-rate
inference follows from any result below.

## Actual printed source problem

Among 29 exact original lists, 24 carry Special Energy with 118
physical copies. The existing canonical numeric actor helper
`agent3-special-energy-frontier.cjs` recognizes **38/118**
exact original source printings. Original Raichu/Electrode ranks
4 and 17 carry 12 Specials each, none recognized by that narrow
numeric function. The full source census and Basic-valid hand
probabilities are in [the vocabulary report](agent17-special-energy-vocabulary-coverage-20261029.md)
and [the exact marginal opening report](agent17-special-only-opening-exposure-20261029.md).

## Change actually implemented

The existing `simulation/twinleaf/actor-energy-payability.cjs`
now recognizes **118/118** original Special Energy copies at the
printed *attached energy unit value* level, in at least one
hypothetical eligible public recipient/prize context. It includes
two flexible units from behind-on-Prizes Counter Energy on a
verified non-GX/EX recipient, one L/P/M unit from `Unit Energy LPM
UPR`, and correctly conditional Double Dragon/Prism/Reversal.
Unknown Counter eligibility returns null, and a flexible Energy
unit cannot pay multiple colored symbols simultaneously. This
is a **symbol/readiness model only**; all further effects and
legal permissions belong to the native Store.

[agent17-public-context-special-energy.cjs](../../simulation/twinleaf/agent17-public-context-special-energy.cjs)
is a new owner-only detached-observation root planner. It uses
the existing non-greedy flexible-unit model, tries owner-visible
Active/Bench recipient attack progress, blocks guessed unknown
attached types, respects Temple and the printed conditional
eligibility of Double Dragon and Counter, and deliberately
does not plan Jet's automatic Bench switch. It integrates the
original-print public Pokémon Rule Box/Evolution profiles
authored by Agent 10, from
[agent10-original-printing-energy-flags.cjs](../../simulation/twinleaf/agent10-original-printing-energy-flags.cjs),
including original source `Alolan Raichu UNM` no-Rule-Box Stage1
and `Electrode-GX CES` GX Rule Box. Opponent hand, unknown Prize
identities, and deck contents are never consulted.

The existing common
[actor policy](../../simulation/twinleaf/agent34-actor-only-root-policy.cjs)
imports this selector behind **`AGENT17_PUBLIC_CONTEXT_SPECIAL_DEV=true`**
or the explicit `publicContextSpecialEnergy:true` opt-in.
**Default off** preserves the prior benchmark actor. Opt-in
provides both conditional attachment intent and a separately
checked printed attack cost after attachment. Root action
permission still belongs to the original native Store.
The flag has not been enabled in any competitive benchmark.

[Pure behavioral tests](../../tests/agent17-public-context-special-energy.test.cjs)
cover native enum conversion, finite flexible-unit matching,
Unit/Double Dragon/Counter/Reversal, Temple, uncertainty, both
original-source identity and default-vs-opt-in parity. Existing
[manual statistical suite](../../.github/workflows/aichi-benchmark-stats.yml)
passed [CI 40956319783](https://github.com/FlareZ123/experiment-01/actions/runs/40956319783)
before the latest public printing profile addition; a later
re-run validates the final code.

## Genuine pinned Twinleaf native Store witnesses

Pinned submodule: `vendor/twinleaf` at
`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
[Native test](../../tests/agent17-conditional-special-native.test.cjs)
creates a genuine owner turn in the pinned Store, chooses the
opt-in actor intent, dispatches a **real** `PlayCardAction`, and
checks owner's attached card and resolution prompts.

First manual native CI
[40956637948](https://github.com/FlareZ123/experiment-01/actions/runs/40956637948):
one positive real-Store Double Dragon on Regidrago V; a second
test exposed a wrong **long-name assumption** for native UPR Unit.
After looking up the actual pinned CardManager, the correct native
name is **`Unit Energy LPM UPR`**. The next existing
[manual canonical CI 40957357905](https://github.com/FlareZ123/experiment-01/actions/runs/40957357905)
passed both pinned native Store tests, and the log explicitly
listed `Unit Energy LPM UPR` among six native Unit names.
This confirms two real attachment transitions, with paper
conditional energy payability still separately modeled.

The next native development tests check physical seat B for DDE,
original Alolan Raichu with Reversal/Counter and actual published
Special-print catalog census. **Do not report these as confirmed
until the next native run finishes.** Even if successful, synthetic
native setup does not prove a real original 60 was legally dealt
or that its source bot is strong.

## What these results cannot qualify

The selected benefit may depend on future draws, opponent,
Stadiums, alternative connector uses, current opportunity
cost and intended control sequence. Current policy does not
yet model these decisions competently. In particular a mixed
Basic/Special hand normally uses an earlier Basic attachment
branch, the mandatory Jet switch is deferred, many printed
extra effects are not scored, and native source Trainer/Supporter
decision coverage is still incomplete. The opt-in mode and
physical Store checks provide a **mechanism path and regression**,
not a game performance claim.

Before broad matchup games, validate native actor action
on **both physical seats**, public conditional board states,
real starting hands, source search/gust/disruption/recursion,
pass/attack opportunities, and actual opponent reply. Preserve
legality failures and censored games. **Current status: 29/32
original sixty sources, zero competitive-qualified games, no
established fixed deck at 99.5%.**
