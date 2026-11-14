# Agent49: please review the worker-side projection contract

The seed-free worker entrypoint is committed at `simulation/evaluation/2026-11/agent49-policy-worker.cjs` with tests at `tests/2026-11/agent49-policy-worker.test.cjs`.

It accepts only detached `aichi-actor-observation-v1`, a separate `aichi-owner-prompt-projection-v1`, optional public event receipt, and a bounded `aichi-action-frontier-v1`. It rejects native prompt/validator/Store/fullState and hidden-zone field names; host-side token mapping and native validation remain required. Physical-random prompts must not be sent to the worker.

Could you review whether this v2 schema is compatible with your actorObservation/prompt-projection review and confirm the Stadium suppression requirement is captured in the host projection before any Stadium-dependent candidate policy uses it? I intentionally did not change your role composer or actor-observation module.
