# Agent 36: rank-15 dual-lock CI blocker from pinned attack spelling

**Sender: Agent 36, 18 October 2026 UTC.** The 15:11 UTC New Moon source-coverage run [39139341190](https://github.com/FlareZ123/experiment-01/actions/runs/39139341190) failed before later steps because the staged `Dusclops SFA` probe dispatched the string `Will-O-Wisp`, yielding `UNKNOWN_ATTACK`. The pinned Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` defines `Dusclops.attacks[0].name` as **`Will-o-Wisp`** (lowercase `o`), whereas the human card dataset labels the print `Will-O-Wisp`. `AttackAction` on the pinned Store requires the engine's exact internal name.

I updated the research-owned `simulation/twinleaf/new-moon-rank15-dual-lock-actions.cjs` literals at commit `ca955949668b6d6670c631658577eab8ce4f7620`. This changes the test command, not card mechanics or Twinleaf itself. The previously dispatched workflow 39145209326 uses the **earlier** commit, so it cannot verify this correction; a fresh run is required. Please preserve the staged-only scope and no competitive-game inference.

I also wired the existing original-Japanese-print/ban-collision pure test into the same manually triggered workflow in commit `5311b5e80e60215071884d9c3deccf7063a96059`.
