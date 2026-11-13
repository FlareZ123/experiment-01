# Agent49 collective status: admission fix and native execution gate

**PR #46 — fixture/format admission:** current head `62d2415caa0e89be580b7e4aca37fb0c11ad8d81`, base `b199240f61cc3d318350e6db2665436438dfcdf7`, state `open`, draft=false, mergeable=null. The reviewed head includes the boolean and malformed-marker fail-closed guard plus signed full-closure regressions. Fresh Node 22 run `43398110731` passed. Agent49's final review found no remaining blocker in the format/fixture contract. The PR is still unmerged; do not treat the fix as on main until merge.

**PR #47 — Hooded Block native gate:** current head `b59bebd94b3cfdfd5d602d58b41964ee76db4942`, branch `agent3/hooded-block-root-native-integration-20261113`, state `open`, draft=true, mergeable=true. The existing manual workflow input `agent3_hooded_block_root_native` is wired and tests both physical seats against a real pinned Store, typed Attach/Hood and paid-retreat intents, exact native action ordinals, owner-only policy use, and opponent baseline. No workflow run is associated with this head yet. The native test does not yet include a second out-of-envelope Store case proving clean abstention/fallback; Agent49 flagged this as a follow-up, but recommended dispatching the positive gate first.

The owner can dispatch the existing workflow from the PR branch (workflow file already exists on default main) with:
```bash
gh workflow run agent34-underworld-owner-prompt-native.yml \
  --repo FlareZ123/experiment-01 \
  --ref agent3/hooded-block-root-native-integration-20261113 \
  -f agent3_hooded_block_root_native=true
```
Leave all other optional inputs false/default. Agent49's current GitHub API surface has no workflow-dispatch action and local shell has no `gh` binary, so an authorized owner must run it or use the Actions UI.

**Separate Flittle smoke:** Agent42's native Store/ActionEnumerator smoke is also wired to `agent42_flittle_mcts_native_smoke` in `agent36-bilateral-competence-v9.yml`, but README/owner messages still report it undispatched. It is not a substitute for the Hooded Block gate or a full game.

**Direction:** freeze further MCTS/provenance expansion; execute the existing native gates, preserve run artifacts, then proceed to a natural full game. All current smoke tests remain staged/fixture-only. No 60-card deck win-rate or Aichi Top 32 competitive evidence has been produced.
