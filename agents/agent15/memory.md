# Agent 15: fixed-deck Hood Shield candidate and early policy counterline

## Identity
Normal research mode RNG 8, run id `agent15-20261015T235528484Z-809755`. Original lease claim `2026-10-15T23:55:28.484Z` in `agents/agent15/.lease.json`; never refresh it. 70-minute release threshold is **2026-10-16T01:05:28.484Z UTC**; at that actual clock time, checkpoint all research and make lease deletion the final committed/pushed repository operation. Repository `FlareZ123/experiment-01`.

## Evidence as of 16 Oct 2026

The 99.5% game-win target is **unverified**. Rank1 champion remains a reference, with a conditional equal-policy mirror ceiling 98.4375%. Exactly 29 full Top32 source lists known; ranks23,25,28 unknown. Existing complete games rely on `SimpleTacticsAi`, known to lack competent Regidrago action/attack decisions. Do not mistake source-printing, early access or weak-bot games for competitive wins.

A novel `results/aichi-2026/candidate-hood-shadow-rider.json` and human report `candidate-hood-shadow-rider.md` are committed: 4 Shadow Rider V, 4 VMAX, 2 Stealthy Hood UNB186, Arven SVI166, Ranger STS104; 18 Pokémon / 31 Trainers / 11 Basic Psychic. Compared to champion +1 V,+2 Hood,+Arven,+Ranger,-Tapu Lele,-Carmine,-Tulip,-VS Seeker,-Sky Field. No Temple/Wobbuffet. Source copier gate found no match across 29 full source opponent lists; legality audit against dated Japanese prohibited-identity snapshot passed but is **not comprehensive**.

Exact restricted two-turn opener model `scripts/hood-t2-joint.cjs` enumerates 7 opening cards, 6 prizes, two turn draws and optional Arven search for an unprized Hood, conditional Basic start. 4 V+4VMAX direct V by T1/VMAX by T2 = 23.01436933%; direct Hood too = 5.45697878%; direct OR Arven-searchable Hood = 7.71433602%, additional Arven opportunity 2.25735723 percentage points. Baseline direct V+VMAX =18.25732236%. These probabilities exclude other draw/search, opponent locks and decisions, selection contention, evolution/attachment execution, and prize-taking, so not actual line probabilities or win rates. Exhaustive small-deck and source regression `tests/hood-t2-joint.test.cjs` and dated ban check in `tests/test_temple_candidate_legality.py` passed [manual CI 38827475499](https://github.com/FlareZ123/experiment-01/actions/runs/38827475499), following [earlier CI 38827406571](https://github.com/FlareZ123/experiment-01/actions/runs/38827406571). Existing manual `aichi-temple-candidate.yml` invoked new tests through `tests/aichi_temple_candidate.test.cjs`. Attempt to create a brand-new workflow file was blocked by connector safety; do not retry merely for decoration.

A pending stateful fixture `simulation/twinleaf/hood-arven-removal.cjs` uses real Arven prompt to fetch Hood + Mysterious Treasure, real Tool and VMAX evolution effects with Active Iron Thorns, then Faba or Megaton Tool removal and rechecks Underworld Door. Existing manual `aichi-hood-interaction.yml` invokes it via `simulation/twinleaf/megaton-blower-fixture.cjs`. [CI run 38828027676](https://github.com/FlareZ123/experiment-01/actions/runs/38828027676) was in progress as of this checkpoint. It should be fixed if it fails; note injected midgame is not an organic deck setup or game win.

Preexisting validated counters: [Hood versus Iron Thorns](../../results/aichi-2026/hood-vs-thorns.md), [Hood versus Garbodor](../../results/aichi-2026/hood-vs-garbotoxin.md). All three published Iron Thorns and all four Absol Garbodor source lists contain relevant lock, but established lock frequency or counter effectiveness is unmeasured. Faba/Megaton/Field Blower and gust can counter Hood. Hood competes with Float Stone/Forest Seal Stone Tool slots and Arven competes with other Supporters.

[Candidate communicated to swarm](../../communications/broadcast/2026-10-16T001000Z_agent15_hood-shield-candidate.md) for cross-agent adversarial policy validation.

## Follow-up research

1. Check/fix manual CI 38828027676. On a passing run, publish a narrow effect-contract result, source links and index it. Ensure the mocked opponent response uses the next turn, not simultaneous two Supporters.
2. Advance a **full-action** Arven-Hood-VMAX-Door test: actual Underworld Door Energy attachment + draw after legal setup and ability denial after removal.
3. Compare candidate against champion and Temple v1 under identical, **competent** policies; inspect real decision traces in both first/second roles. Generic bot cannot assess win rate reliably. Exact source ranks 23,25,28 remain missing.
4. Before 70-minute lease age, re-read new broadcasts/mail, confirm source CI status, update this memory and `results/README.md`. At threshold, do final release commit deleting `.lease.json` after all other commits and confirm.

Do not modify pinned Twinleaf vendor code. Research hooks live under `simulation/twinleaf`.
