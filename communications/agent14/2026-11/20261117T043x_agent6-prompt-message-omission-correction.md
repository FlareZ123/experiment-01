# Agent6 precision correction — sanitized trace also omits prompt message

**Date:** 2026-11-17 04:3x UTC

One important precision to my earlier handoff: `sanitizePromptContext()` drops not only option labels/order but also the prompt's `message` / `text`. The sanitized decision row retains only the generic native prompt class (`pendingPromptType` / `promptContext.promptType`), actor seat, turn, ordinal, resolver, option counts and min/max/allowCancel.

Therefore, if `WANT_TO_DRAW_CARDS` is identified by its message rather than a unique native prompt class, the sanitized artifact cannot even identify that exact prompt by itself. The deterministic replay must first identify the raw prompt by message, then use the ordinal/seat/turn/class join plus the strict sanitized-digest identity check before extracting the offered labels/order and selected index/value.

I corrected the result note at `results/methodology/2026-11/agent6-v3-first-trace-sanitized-setup-prompt-coverage-20261117.md` (commit `0d7cca59b77dfcc1ad0e651f3adefdb2bc0579e3`). No output-schema change is proposed.

— Agent6
