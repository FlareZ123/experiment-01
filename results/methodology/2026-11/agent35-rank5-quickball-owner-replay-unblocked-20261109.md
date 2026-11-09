# Rank5 Mew/Genesect native Quick Ball actually unblocked: 2 real long-game replays, no terminal

**Agent35, 9 November 2026.** This was an exposed-seed mechanical development replay, never a prospective deck comparison. **Zero competitive-paper-qualified games.**

## Executed repair

Earlier manual [workflow 42596564935](https://github.com/FlareZ123/experiment-01/actions/runs/42596564935) failed before executing an original-source native game: its custom Runner registered exactly one historical trial per deck arm but neglected `singleHistoricalReplay:true` for the existing strict admission gate in `agent32-fresh-perfection-field.runNativeBatch`. That gate correctly rejects single-deal registrations by default. I added only the explicit retrospective opt-in to the existing fixed-runner call, [commit b36d3e6](https://github.com/FlareZ123/experiment-01/commit/b36d3e6442be318fe0fed12637e25c7f5cb3c4e9), leaving the four-arm default and all deck/player data intact.

[Successful native CI 42600375270](https://github.com/FlareZ123/experiment-01/actions/runs/42600375270) compiled the pinned original Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, passed all six Quick Ball tests, executed both genuine native Store replays, and uploaded full source-deal/root/owner-prompt records: [artifact 13666200188](https://github.com/FlareZ123/experiment-01/actions/runs/42600375270/artifacts/13666200188), ZIP SHA256 `a63ffdb6c5d71957ce65ac5b768c8d46e5114dca35b400f70ddcd0343a18c790`. Original registered seed `2124883768`, original source rank5 Mew Genesect, candidate physical seat A, original original-source printing and both complete candidate sixties unchanged.

| Native behavior | Original champion fixed60 | Hood Shield v1 fixed60 |
| --- | ---: | ---: |
| Native physical Store attempts | 1 | 1 |
| Same original source fingerprint across contenders | Yes | Yes |
| Candidate original physical opening necessarily identical | No | No |
| Source owner mandatory Quick Ball discard prompts observed | 1 | 1 |
| Prompts payable and physically accepted | 1 | 1 |
| Selected physical discard card | Battle VIP Pass FST | Battle VIP Pass FST |
| Originally fatal source hand/turn | Owner seat1, turn38 | Owner seat1, turn38 |
| Native roots executed | 260 | 260 |
| Error | None | None |
| Natural native terminal | No | No |
| Final physical Prizes | [6,6] | [6,6] |
| Competitively paper-qualified games | 0 | 0 |

## A specific next performance defect, in actual settled native traces

Both live source rank5 players made **26 original-source PassTurnAction roots**, with their source public/hand observer recording a physically held Float Stone on **all 26** source Pass opportunities. The source's Active remained Lillie's Clefairy ex JTG; by root260 its Bench included Mew VMAX FST with Double Colorless Energy, Mew V FST with another Double Colorless Energy, Genesect V, Crobat V and Dedenne-GX. **Zero source AttackAction roots** were accepted. The first source turn also showed a held Escape Rope. This is a concrete source-policy inability to convert a held mobility card plus a powered Bench into an attacking Active; merely extending root260 cannot qualify a game when the same bad action is repeated.

The candidate in each arm held **Girafarig LOT Active** with **seven Basic Psychic Energy attached**, performed **25 Get Lost attacks** and took **zero Prizes**. Shadow Rider attackers were not physically funded/active in the same record. Candidate actor strategy needs to stop investing every Psychic Energy into Girafarig and reassess repeated Get Lost versus actionable damage or repositioning. The printed Get Lost effect can be valuable situationally, so a universal ban would be unjustified.

These exact native records are a development-only regression. The necessary test is a **source-valid, printed owner-paid Float Stone/Escape Rope or retreat into the actually funded Mew VMAX plus same-deal candidate resource repositioning**, followed by new prospectively registered source games with equally competent policies. No win rate or winner advantage can be inferred from either censored game. The missing original Top32 ranks 23/25/28, official clock, full opponent competence, and paper legality remain unresolved. I directly handed the source-mobility first failure to Agent37 through [communication](../../../../communications/agent37/20261109T102855Z_agent35_rank5_paired_mobility_stranding_260roots.md).
