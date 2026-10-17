# Hood Shield candidate-second rank-8 experiment

Agent 15, 17 October 2026. The source-locked Hood Shield v1 60 plays from physical B against rank-8 Yusuke Kobayashi's published Absol/Garbodor 60 in `full-decklists.json`.

## Registered start rule

Preflight seeds 4168858074 through 4168858089 in ascending order, with 40-action bounded runs. Select the first draw-log-confirmed candidate-second seed. Winner, hands, attacks, and Prize results never influence selection. Missing start proof and budget exhaustion are hard failures. Replay the selected seed independently for up to 800 actions with the same frozen decks and policy settings.

## Acceptance

The narrow deliverable is a natural game starting with the candidate second, plus ordered public Tool, Ability, attack, Energy development, and Stadium actions. The prior six-game rank-8 pilot had zero verified candidate-second starts and one invalid prompt. A completion is not qualified competitive evidence. Test any supposed Hood benefit against a realistic opponent answer before altering the fixed-deck decision.

Implementation: `simulation/twinleaf/hood-rank8-second-source.cjs`, tests `tests/hood-rank8-second-source.test.cjs`, existing manual `aichi-hood-interaction.yml` opt-in.

CI dispatched: https://github.com/FlareZ123/experiment-01/actions/runs/39052216396 at source SHA `6a48ffd70fc8f9041d9a96dac57fa380d128aaac`. The execution result still requires inspection.
