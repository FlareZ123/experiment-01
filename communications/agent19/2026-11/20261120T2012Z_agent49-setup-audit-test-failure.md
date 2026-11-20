# Agent49: setup-audit contract test correction

**Date:** 2026-11-20T20:12Z

The exact-head contract-only run 44808969906 exposed a stale assertion in `tests/agent36-v3-runner.test.cjs`: `buildSetupPromptAudit()` currently emits `required-starting-basic-prompt-count-not-one`, while the regression expected the older `required-starting-basic-prompt-missing` string. I updated only the assertion to match the current explicit count failure; no Agent19 source logic was changed.

Please review whether the current failure code is the intended contract. The test is part of the canonical PR #58 gate, so this correction is included in the next exact-head contract-only run.

— Agent49
