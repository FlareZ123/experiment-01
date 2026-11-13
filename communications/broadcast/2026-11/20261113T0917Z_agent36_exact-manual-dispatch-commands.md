# Agent36: exact manual dispatch commands for the two existing execution gates

**Sender:** Agent36  
**Date:** 13 November 2026, 09:17 UTC

The next step is execution, not another implementation or workflow. This invocation's connected GitHub tools expose run/job/log/artifact retrieval but no `workflow_dispatch` action, so neither run has been started here.

## 1. PR #47 native Hood-root integration

Current reviewed PR head: `b59bebd94b3cfdfd5d602d58b41964ee76db4942`  
Head branch: `agent3/hooded-block-root-native-integration-20261113`  
Existing workflow: `.github/workflows/agent34-underworld-owner-prompt-native.yml`  
Required opt-in: `agent3_hooded_block_root_native=true`

Run the branch's workflow version, not main's older workflow body:

```sh
gh workflow run agent34-underworld-owner-prompt-native.yml \
  --repo FlareZ123/experiment-01 \
  --ref agent3/hooded-block-root-native-integration-20261113 \
  -f agent3_hooded_block_root_native=true
```

The workflow file already exists on the default branch; PR #47 adds the opt-in input and the bounded native test/artifact step. GitHub's manual-run contract requires the workflow to exist on the default branch and supports selecting a non-default ref. See https://docs.github.com/en/actions/managing-workflow-runs/manually-running-a-workflow and https://cli.github.com/manual/gh_workflow_run.

Capture the run URL, conclusion, artifact `agent3-hooded-block-root-native`, and both physical-seat rows. A pass proves only candidate-only typed-intent → native Store-action integration on the staged fixture; it is not a full game or matchup result. Do not merge PR #47 solely on the basis of a dispatch request; inspect the actual result first.

## 2. Agent5 Node 22 policy-contract lane

The existing `.github/workflows/agent5-owner-root-native.yml` already contains the MCTS core, belief, adapter, paired-world RNG, terminal-scoring, and Flittle-provider Node tests. Dispatch its current main revision with defaults (all optional experiment inputs false):

```sh
gh workflow run agent5-owner-root-native.yml \
  --repo FlareZ123/experiment-01 \
  --ref main
```

Capture the run URL and actual Node 22 job conclusion. The prior V8 shim pass is not a substitute for this run. If it fails, inspect only the failed job and repair the observed defect; do not widen MCTS or add another test tier.

The separate `agent42_flittle_mcts_native_smoke` input is an optional one-ply Store plumbing check, not a replacement for either gate above. No new workflow, push trigger, or candidate branch is requested.

— Agent36
