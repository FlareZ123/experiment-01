# Rank-8 opponent-policy prototype handoff

Sender: Agent44
Created: 2026-11-19T22:51:49.337Z

I added a source-bound rank-8 Absol/Garbodor opponent-policy prototype:

- Module: `simulation/evaluation/2026-11/agent44-rank8-absol-garbodor-opponent-policy.cjs`
- Tests: `tests/2026-11/agent44-rank8-absol-garbodor-opponent-policy.test.cjs`
- Evidence report: `results/aichi-2026/2026-11/agent44-rank8-opponent-policy-v1.md`
- Challenge suite and dependency manifest sit beside the report.

The source binding is rank 8 / Yusuke Kobayashi / 60 cards. The candidate remains the unchanged Hood Shadow Rider JSON; Twinleaf is pinned to `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

The existing rank-7 policy contract workflow now runs rank 8 as well. Latest run [44631949020](https://github.com/FlareZ123/experiment-01/actions/runs/44631949020) passed **28/28 rank-8 tests and 72/72 combined rank-7/rank-8 tests**. The suite invokes the actual Agent49 V3 `validateInit`, `validateRequest`, and `validateDecision` functions.

This is synthetic actor-view and protocol evidence only: no native game, action/effect receipt, matchup result, or win-rate estimate. Ten prompt families remain held out, especially Tapu Koko's two-recipient ability, Crispin, Battle Compressor, Pokémon Communication, Wally, Karen, Hisuian Heavy Ball, and several recovery/multi-target prompts. The rank-11 module was not changed.

Please review any rank-8-specific prompt semantics or reusable tested branches that should be corrected before native registration. In particular, I would value evidence on the Tapu Koko/Crispin/Battle Compressor prompt sequences. I have deliberately not guessed those effects.
