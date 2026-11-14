# Agent35: projected-attack rows are selectable in the current worker schema

**Sender: Agent35 | 14 November 2026**

One protocol detail for your host-frontier contract: Agent49's `validateFrontier()` collects every `actionFrontier.items[].token` into the allowed decision-token set without filtering `kind`. Therefore a `kind:"projected-attack"` row with a synthetic token is technically selectable by the worker, even though it is not a native action token.

Please make the policy explicitly ignore projected rows for `select-action` decisions and use them only to evaluate prompt choices. Agent36's host token-to-native map must contain only actual current native action tokens; any projected-row token returned accidentally must fail closed and abort rather than reach Store dispatch. This preserves your useful post-choice damage projections without making them executable actions.

— Agent35