# Review-gated Twinleaf synchronization: candidate 16-commit upstream update

**Agent 2, 19 October 2026 UTC. Evidence class: real GitHub Actions compatibility build, source-level change review and unmerged draft PR. No game-strength inference.**

## Starting problem

The pinned submodule in `vendor/twinleaf` was `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Its upstream GitHub repository `twinleafgg/twinleafgg` currently points `main` to `d89efe580127a05aff8b0456fd2ad587edbbee2d`, **16 commits ahead**, with zero behind at the 19 October comparison. The project had 110 specialized manual GitHub Actions workflows, but no workflow named or discoverable as a scheduled upstream revision-check and review process. Unannounced updates would invalidate reproducibility of already collected engine evidence.

## Persistent remedy

[Review upstream Twinleaf revisions](../../.github/workflows/twinleaf-reviewed-upstream.yml) supports one **weekly Monday 05:13 UTC** schedule and manual `workflow_dispatch`. It never triggers on a commit.

- A `validate-upstream` job with **read-only GitHub token** checks out the exact pinned gitlink, fetches current upstream `main`, and exits cheaply if unchanged.
- When upstream differs, validation detaches at the candidate upstream SHA, executes `npm ci`, compiles `ptcg-server`, runs pinned research-adapter/Store boundary tests and a bounded headless smoke game. A failing build or test prevents any update branch.
- A separate `propose-reviewed-pin` job with narrowly scoped write and pull-request permissions checks out **current main**, verifies its currently pinned SHA is the same as the validated baseline, fetches the **exact validated** upstream commit by SHA, then proposes a one-gitlink commit on branch `automation/twinleaf-reviewed-upstream` through `peter-evans/create-pull-request@v8`. It does **not** execute the newly fetched engine with a write token.
- The publishing action does not merge or silently move `main`. When repository policy denies Actions-created PRs, it may still publish a tested branch. The workflow checks that remote branch exists and emits a manual PR handoff, preserving the required reviewer decision.

The workflow intentionally uses `git submodule update --init --depth=1 vendor/twinleaf` as a separate command because `actions/checkout@v4` with `submodules:true` performs nested recursive authentication cleanup and fails on an upstream nested gitlink without a corresponding `.gitmodules` entry. The repository's established manual smoke workflow also uses targeted submodule initialization.

## Actual reproducible verification

1. Initial manual [run 39329576827](https://github.com/FlareZ123/experiment-01/actions/runs/39329576827) **failed before compile** at standard checkout recursion: `No url found for submodule path 'vendor/twinleaf/vendor/pokemon-cards-css' in .gitmodules`. The workflow was corrected to use targeted submodule initialization.
2. Corrected manual [run 39329699546](https://github.com/FlareZ123/experiment-01/actions/runs/39329699546) completed **validation successfully**: candidate `d89efe58` fetched, dependencies installed, server compiled, four original adapter/Store tests and headless smoke passed. Its publisher **pushed** the expected one-gitlink review branch, then failed when the GitHub Actions token was denied permission to **create a pull request**. This was an authorization restriction on the final PR API call rather than a build failure.
3. A separately authorized GitHub connector opened [draft PR #9](https://github.com/FlareZ123/experiment-01/pull/9) on that reviewed branch. The PR's actual diff was checked: **one changed gitlink**, no submodule source copied into the research repository. An [explicit compatibility review comment](https://github.com/FlareZ123/experiment-01/pull/9) identifies altered reducers for self-KO, evolution Stage/LV.X checks, Stadium removal and prevented Pokémon moves.
4. After adding a branch-verification fallback for restricted GitHub Actions PR settings, [run 39330210250](https://github.com/FlareZ123/experiment-01/actions/runs/39330210250) **PASSED both jobs**. It kept the proposal in draft state. The only upstream pin change remains inside the unmerged proposal.

## Review and interpretation

The relevant upstream code differences are verified by comparing old/new source trees: `SelfKnockOutEffect` added to `game-effect.ts`, an explicit evolved-stage and LV.X check replacing a previously always-truthy stage expression, Stadium removal factored into `REMOVE_STADIUM_CARD_LIST`, and Pokémon/attachment move sequencing altered in `prefabs.ts`. These source changes warrant expanded Store effect checks. They do not establish that every update is correctly modeled in paper Expanded; the upstream also contains additions from pre-Black & White sets that must not be silently treated as event-legal.

The PR remains **draft and unmerged**. The committed project baseline remains `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Every past experiment must continue to cite that pinned engine version. The comparison provides **zero competitively qualified new games** and no verified 99.5% win rate.

### Remaining follow-up

Reviewers should compare old/new source-level rule reducers and enforce a sufficiently broad simulation regression suite on the exact proposed SHA before choosing whether to merge. If rejected, preserve the compatible working pin. The scheduled check is limited to one weekly run with a 25-minute validation timeout; its existence is not a license for arbitrary high-cost sampling.
