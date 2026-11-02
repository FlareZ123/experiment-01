# Prospective two-seat rank6 candidate Lillie-after-Pass policy: six real native interventions, zero candidate wins

**Agent 7 | 2 November 2026. Results: 16 native games from four fresh preregistered source seeds. Competitive-qualified games: 0.**

## Prospective registration and fixed design

Preregistration **[agent7-lillie-pass-rank6-prospective-20261102.json](registrations/agent7-lillie-pass-rank6-prospective-20261102.json)** was committed at `106639af` **before the treatment was run**. Four secure-uniform 32-bit source seeds: `1005903886`, `1855410067`, `2335986362`, `4153138373`; first two candidate physical seat A, last two seat B. Each source seed has the authenticated Aichi rank6 original Iron Thorns fixed 60 and both fixed candidate 60s (`champion-reference`, `new-moon-lockbreaker-v1`), for **8 distinct named native trials per arm**, **16 total games**. Candidate and opponent printings, seed, physical seats, frozen source policy options and Twinleaf pin are unchanged between control and treatment.

- **Control**: original selected `agent20-frozen-rank6-canary-v1.json` 86-option common-policy profile, SHA256 `6ff3ee325098cfc68253928a9dd5370da52c9cc64b86a4435be2b07a0d392dc6`, with prospective registered trial IDs substituted for the old four.
- **Treatment**: exactly the same original candidate actor root policy, plus one reversible owner-visible rule: when **that candidate** was about to choose `PassTurnAction`, attempt its *physically held* `Lillie's Determination M1L` if the actor-only observation finds an unspent Supporter, no observed Supporter lock and a nonempty deck. The rank6 source actor remains under exactly its original policy. The chosen Lillie must pass actual pinned Store dispatch and printed native prompt settlement. All other actor decisions and prompt handling use their original routines.

The research-owned wrapper `simulation/twinleaf/agent7-prospective-candidate-lillie-after-pass.cjs` inserts itself **inside** the canonical actor-root adapter, after the original root has chosen a Pass, using a scoped, restored CommonJS research-module export. It checks the exact live Store state identity and correct physical candidate seat. It uses existing Agent12 `chooseLillieAfterPass` and Agent24 native Lillie draw settlement. Six synthetic regression cases pass, covering both physical seats, source-exclusion, speculative clone exclusion, root proxy ordinal preservation and restoration on exceptions.

[Manual GitHub Actions run 41483117649](https://github.com/FlareZ123/experiment-01/actions/runs/41483117649) **SUCCESS**, source head `111d7e86e711848e3203af56797a90e92616646e`, pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Full [raw native paired artifact 13161380187](https://github.com/FlareZ123/experiment-01/actions/runs/41483117649/artifacts/13161380187), ZIP SHA256 `5e3bdd1555a8cc4d5f638f8ed5606874153ba453a4e2d8e41609719b16c27399`. Repeatable driver: `simulation/evaluation/agent7-rank6-lillie-prospective-paired.cjs`. Every intended trial was executed, and **8/8 exact source physical initial deals and 8/8 full initial physical deals matched** between control and treatment. Original both candidate decks remained fixed.

## Native outcomes

| Physical candidate seat | Seed | Candidate 60 | Treatment candidate Lillie roots settled | Control native outcome | Treatment native outcome |
|---|---:|---|---:|---|---|
| A | 1005903886 | Champion | 1 | Source won | Source won |
| A | 1005903886 | New Moon | 0 | Source won | Source won |
| A | 1855410067 | Champion | 0 | Source won | Source won |
| A | 1855410067 | New Moon | 1 | Action cap | Action cap |
| B | 2335986362 | Champion | 0 | Source won | Source won |
| B | 2335986362 | New Moon | 2 | Source won | Source won |
| B | 4153138373 | Champion | 1 | Action cap | Action cap |
| B | 4153138373 | New Moon | 1 | Action cap | **Source won** |

**Totals:** six candidate-owned Lillie replacements of selected Pass in five of eight actual treatment games. **All 6/6 proposed roots were accepted by the real native Store, and all 6/6 printed Lillie shuffle-and-draw effect chains were independently settled and confirmed by Agent24's physical owner-hand/deck/Supporter quota observer.** No native Lillie rejection.

Control's native engine finished with source winning in **5/8** trials and ran to the action cap in **3/8**. Treatment's native engine finished with source winning in **6/8** and reached the cap in **2/8**. The single change in terminal disposition was `6:73:B:new-moon-lockbreaker-v1`, seed `4153138373`: an early global-turn3 candidate Lillie (held five cards, deck 43, native accepted and settled to eight cards/deck 39) was followed by a **source native victory**, whereas the unchanged control ended at native action cap. There were **zero candidate native engine winners in either arm**.

Accepted Lillie turns among treatment pairs were 3, 5, 10, 49, and 62, with one pair taking Lillie twice (turns3 and5). The presence of an executable Supporter alternative therefore varies by actual physical hand, turn, prior actions and remaining deck. The control remains unchanged within all pairs.

## Terminal mechanism stratification of the original raw native rows

A second purely descriptive classification uses the actual `nativeWinnerSeat`, actual source physical seat and **remaining Prize counts**, rather than equating every engine-game-end with six Prize cards taken:

| Native disposition | Unchanged control (8) | Lillie treatment (8) |
|---|---:|---:|
| Source wins with **all six** source Prizes taken | 3 | 4 |
| Source declared winner **before** all its Prizes were taken | 2 | 2 |
| Engine reached its action cap; no native winner | 3 | 2 |
| Candidate declared native winner | 0 | 0 |

The non-Prize source victories were `6:71:A:champion-reference` (final Prize counts `[6,6]`; source used **zero attacks**) and `6:72:B:champion-reference` (final Prize counts `[3,6]`; source took three Prizes). They were identical across both policy conditions. In the former, the engine declared the source winner despite **neither side having taken any Prizes**. An opponent's loss by deck-out or having no Pokémon is compatible with the recorded facts; this summary does not establish which exact terminal predicate fired. The source's zero attacks make any interpretation as a source damage/Prize-path victory false.

This distinction shows why a solver must preserve native terminal condition and Prize-state details in its raw evaluation instead of assigning a confident matchup strength value to every native end state. A source win obtained without attacking may be legally possible, yet may be heavily dependent on a bot's failure to manage deck resources or remaining Pokémon. Those alternatives require their own native termination and paper-rule verification.

## Interpretation and limitations

This fixes a narrow **native action coverage gap**: six previously selected candidate Pass actions had a supported Lillie play, were observed in genuine same-physical-start games, and physically settled when selected. It also falsifies the unconditional heuristic that automatically spending an available Lillie after Pass must produce a better benchmark outcome. Here the native policy change yielded no candidate native wins; one pair shifted from unresolved action cap to a source native win.

**These observations do not prove causal game-strength deterioration.** Four independent source random seeds, two correlated candidate lists per seed, incomplete native paper validity, source/payment lock limitations and a weak automated opponent all limit interpretation. An action cap is an incomplete game rather than a tie, draw or victory. The native source-win count is an instrument reading, not a paper Expanded win-rate estimator. Player-specific conditional opportunities and deck access must be compared before treating the Lillie rule as superior.

The 99.5% Aichi Top32 goal remains untouched: 29 of 32 exact source lists authenticated, zero competitively qualified paper games, no demonstrated fixed 60. Future research should test whether a **state-value-aware** choice of draw Supporters avoids spending Lillie when the current hand contains strategically protected cards (UDP/DCI), or when doing so sacrifices higher-value resource chains. Precommitted source seed bank and exact full initial deals should be preserved when comparing a revised policy, with no recycling these four now-observed source seeds as held-out validation.
