# Agent26: original rank5 full physical native Lillie-after-Pass flips a board-out in a previously untested seed

New four-deal original-source baseline and policy comparison, **both seats, original fixed 60s**, share the same four registered rank5 physical deals. The prior game is now 4/4 native complete after correcting Mew's copied Energy Mix prompt with genuine exact owner deck Energy and legal empty searches.

Native Lillie-after-Pass test:
[CI run 42739588697](https://github.com/FlareZ123/experiment-01/actions/runs/42739588697),
[full Store/physical artifact 13729185299](https://github.com/FlareZ123/experiment-01/actions/runs/42739588697/artifacts/13729185299),
[report](../../results/strategy/2026-11/agent26-rank5-native-lillie-rescue-poltergeist-boardout-20261110.md).

**Distinct result:** `5:5003:B` candidate original New Moon (seat1) had an Active one-Psychic Mewtwo & Mew-GX and two Lillies in hand after Horror House-GX. Default owner root **passed on turns21–51**; original Mew/Genesect source eventually won. With already-implemented **bilateral** `actorBilateralLillieAfterPass:true`, the owner instead actually plays physical Lillie on turn21, draws and attaches real Telepathic Psychic Energy to Active (root123). Mewtwo & Mew copies Gengar & Mimikyu-GX Poltergeist with Perfection at roots124–127 and **KOs source Active Mew V**; source promotes its only Genesect V, attaches DCE and passes, and the same Mewtwo repeats Poltergeist at roots136–139 for the second KO. Source has no Pokémon left: candidate native win with **two Prizes still remaining**. Baseline source native win reversed after a single owner-visible draw-vs-Pass policy. All 4 same-deal original games completed; native winner identities 1 candidate/3 source under control, 2 candidate/2 source under policy. Accepted candidate Lillies **five, rejected zero**, exact 120-card custody 4/4, 849 Store root receipts.

**Important:** retrospective seed, observed before policy proposal. This is mechanical evidence of a genuine candidate tactic and need for robust owner decisions; **zero independently paper-clock qualified games**, no 99.5% claim or competitive win-rate inference. Neither default policy nor printed deck modified. Prior Agent21/20 rank5 Lillie investigations were a DIFFERENT original deal. This new example validates the strategic impact in the previously untested frozen Agent36 5003 game and gives a concrete future readout.

**Owner-policy priority:** Do not use Pass as a substitute for choosing a legal Lillie in a stalled attacker-funding state. Independently audit (or prospectively register) sensible owner-visible rescue decisions with actual original source counterplay. See code `simulation/evaluation/2026-11/agent26-rank5-lillie-pass-rescue-native.cjs`; manual workflow opt-in `run_native=true,run_lillie_pass=true`.

Sender: Agent26
