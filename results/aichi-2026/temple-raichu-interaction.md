# Temple of Sinnoh versus the two published Aichi Raichu Electrode lists

**Agent 14, 16 October 2026.** Evidence: exact source-list counts, exact natural-opening combinatorics, and pinned Twinleaf board and AttackAction tests. **No finished competitive match or win rate is established.** Rank 25, also classified as Raichu Electrode, still lacks a verified registered 60-card list.

## Source-specific threat

The [published Aichi card manifest](full-decklists.json) shows the following two fixed opposing builds:

| Rank | Pilot | Basic Pokémon | Energy | Stadium replacement |
| ---: | --- | ---: | --- | --- |
| 4 | Shu Hosoda | 13 | 4 Reversal Energy (PAL), 4 Counter Energy (CIN), 4 Unit Energy LPM (UPR) | 3 Sky Field (ROS) |
| 17 | Yuya Yamano | 13 | 4 Reversal Energy (PAL), 4 Counter Energy (CIN), 4 Unit Energy LPM (UPR) | 1 PokéStop (PGO) |

Both have two Alolan Raichu (UNM), whose **Electro Rain** attack has a Lightning Energy attack cost. The two lists have **zero Basic Energy**. Basic Pokémon counts are independently source-audited in the existing [opening-hand report](opening-mulligan-audit.md).

The bundled card wording for **Temple of Sinnoh (ASR 155)** makes Special Energy attached to either player’s Pokémon supply Colorless and lose their other effects. On a controlled board where Temple applies and Alolan Raichu is powered only by the listed Special Energy cards, the Lightning-type requirement cannot be paid. Stadium replacement restores normal Energy functionality, subject to the printed Energy conditions.

This is a conditional attack-cost interaction. It does not show that Temple can stay in play, prevent alternative attacks, or cause a win.

## Pinned-engine regression

[Executable research fixture](../../simulation/twinleaf/temple-raichu-board.cjs) loads the printed source identities, verifies all three four-copy Energy families at each rank, and uses the pinned Twinleaf `CheckProvidedEnergyEffect` plus the normal `AttackAction` for Alolan Raichu. It checks:

1. Unit Energy LPM provides Lightning without Temple and can pay Electro Rain's cost.
2. Under Temple, each of Unit Energy LPM, Reversal Energy and Counter Energy instead provides one Colorless.
3. Electro Rain with Unit Energy LPM is rejected by the actual AttackAction when Temple applies.
4. Replacing Temple with Sky Field or PokéStop restores Unit Energy's Lightning provision.

The action-test fixture explicitly injects an evolved attacker and known attachments. It tests attack-cost semantics on that board, not the legality or speed of reaching it during a game. [Manual CI regression](https://github.com/FlareZ123/experiment-01/actions/runs/38826565665) **passed** all assertions at pinned engine revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. This demonstrates the test's conditional mechanics within this engine revision, subject to its broader paper-rules limitations.

## Exact immediate Stadium access

The [source-validated exact enumerator](../../scripts/aichi_raichu_stadium_access.cjs) computes natural Stadium visibility, conditional on a valid opening seven containing at least one Basic Pokémon. It counts six uniformly random face-down Prize cards followed by the mandatory first-turn draw; the marginal distribution of that draw is the remaining 53-card population after the opening hand. It excludes additional draws, item searches, Supporter actions, opponent effects and prior Stadium use.

| Event conditioned on valid seven | Rank 4: 3 Sky Field | Rank 17: 1 PokéStop |
| --- | ---: | ---: |
| Stadium in initial seven | **30.07903%** | **11.03896%** |
| Stadium by mandatory turn draw | **34.03682%** | **12.71747%** |
| No Stadium by this restricted draw checkpoint | 65.96318% | 87.28253% |

Both lists have 13 Basic Pokémon, giving an opening-validity fraction `(C(60,7)-C(47,7))/C(60,7) = 0.837155949976`. For `B` Basic cards, `S` Stadiums and 7-card hands, let:

- `V = C(60,7) - C(60-B,7)` be valid-hand combinations.
- `D = C(60,7) - C(60-B,7) - C(60-S,7) + C(60-B-S,7)` be valid hands already containing a Stadium.
- `Z = C(60-S,7) - C(60-B-S,7)` be valid opening hands containing no Stadium.

The first table probability is `D/V`; the second is `(D + Z*S/53)/V`. The implementation reuses the established [opening Basic-stage index](../../scripts/aichi_opening_audit.cjs). [Seeded-shuffle independent tests](../../tests/aichi_raichu_stadium_access.test.cjs) check the exact probabilities against an independent deal simulator, without treating random samples as exact evidence.

### Interpretation for candidate evaluation

Temple v1 has a plausible state-dependent attack denial axis against **two published Raichu ranks** in addition to the known Regidrago and Iron Thorns Special Energy interactions. The benefit should be assessed against how often the challenger can have Temple active at the critical attack turn. Rank 4 has more direct replacements. Rank 17 has fewer immediate replacements but may draw or search through other effects; it carries Secret Box and Trainer's Mail, and their discard/Item opportunity costs must be represented.

A convincing opponent policy should sometimes prioritize replacing Temple over an apparently higher-card-volume line, while considering whether alternative attacks or card effects bypass the Energy requirement. Include both real starting-turn seats, clear Stadium availability, and attacks actually prevented. Avoid interpreting the 65.96%/87.28% no-natural-Stadium events as turn-lock probabilities.

**Evidence level:** printed-deck census, mathematically exact *restricted* opening visibility, passed conditional source-engine tests. Neither an optimized deck nor any field win rate is demonstrated. Rank 25 remains unobserved.
