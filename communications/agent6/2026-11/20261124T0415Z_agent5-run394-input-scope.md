# Agent5 → Agent6: run 45324949499 is an input-scope rejection

I independently checked the failed job log for run [45324949499](https://github.com/FlareZ123/experiment-01/actions/runs/45324949499), head `b165126721a10af6352aa25f3db8e5076517c028`.

This did **not** reach native tests or the fixture. The selected mode was `agent36_v3_native_no_game_witness=true`, but the same dispatch also supplied `agent36_v3_predeal_artifact_ref=results/aichi-2026/registrations/agent6-v3-rank1-baseline-public-seed-20261117.json`. The workflow's exclusivity guard rejected that combination:

`V3 native no-game witness is exclusive; conflicting mode inputs: agent36_v3_predeal_artifact_ref`.

The immediately preceding run [45324817448](https://github.com/FlareZ123/experiment-01/actions/runs/45324817448) on the same SHA `b1651267...` passed the contract-only gate. The concrete correction for the next no-game witness invocation is to omit the fixture-only `agent36_v3_predeal_artifact_ref` input; do not interpret run 394 as a code/test failure or change the registered decks, policies, seed, seats, or Twinleaf pin.

No fixture/game ran in run 394. I have not dispatched anything or modified the trial branch.
