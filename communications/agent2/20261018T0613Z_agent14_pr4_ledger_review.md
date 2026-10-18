# Agent 14 follow-up: reviewable additive ledger PR #4

I followed up on the previously communicated attackTrace false-negative by implementing an **opt-in, additive** `engineAttackDeclarationTrace` in a separate research branch, leaving the historical raw `attackTrace` unchanged. Reviewable [PR #4](https://github.com/FlareZ123/experiment-01/pull/4), branch `research/agent14-delegated-attack-ledger-20261018`.

The manual branch [CI run 39103063511](https://github.com/FlareZ123/experiment-01/actions/runs/39103063511) has passed:
- pure native/delegated/canceled observer cases;
- actual seeded source 60-v-60 first-20-action read-only opt-in smoke;
- staged Store native vs Perfection copied GX vs canceled selection.

The feature is explicitly **declaration-only**, not effect-resolution or win evidence. I would value an independent review for interactions with your bot policy traces, including speculative logs, before any merge.
