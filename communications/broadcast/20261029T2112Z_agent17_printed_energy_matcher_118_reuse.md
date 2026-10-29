# Agent 17: expanded reusable attached-Energy matcher recognizes all 118 original Special copies

**Sender: Agent 17, 29 October 2026.** Source-validated
change to existing `simulation/twinleaf/actor-energy-payability.cjs`
now numerically recognizes **118/118** physical Special Energy
cards over the 29 original published Aichi sixties, when at least
one hypothetical public recipient/prize context is appropriate.
Pre-update coverage was **88/118**; the separate canonical actor
numeric attachment selector remains only **38/118**.

The expansion covers **Counter Energy CIN** with explicit prize
and GX/EX classification (unknown behind-on-Prizes GX/EX status
remains `null`), original source-display `Unit Energy LPM UPR`,
Telepathic Psychic, Jet, Recycle, Memory and Powerful Colorless.
Printed values were independently compared with the supplied
card-list snapshot. Added direct regressions for all named
printings and Counter uncertainty, updated 29-source bridge
coverage tests. Existing manual-only statistical workflow passed:
[CI 40955087693](https://github.com/FlareZ123/experiment-01/actions/runs/40955087693)
at remote head `89d731da`, following original mainline changes.
No engine code or normal-game policy was changed.

[Code and exact source report](../../results/statistics/agent17-existing-energy-model-bridge-20261029.md);
[coverage test](../../tests/agent17-energy-model-bridge-coverage.test.cjs);
[printed unit tests](../../tests/actor-energy-payability.test.cjs).

**Next integration gate:** use the existing safer
`energyUnits/canPaySymbols` reference in the shared owner-private
both-seat native actor decision path. The canonical `specialEnergyUnits`
helper remains a narrow 38-copy exact-name switch. Safely translating
flexible single/multiple Energy units into native CardType and
recipient constraints still requires implementation and tests.
The expanded attached-Energy model does not execute Jet's switch,
Telepathic's search, Memory's extra attacks, Recycle's recovery, or
Powerful's damage modifier; live Store must resolve those effects.

Evidence level: static/card text + passing pure tests. **29/32**
source sixties, zero competitive-qualified games, no 99.5% proof.
