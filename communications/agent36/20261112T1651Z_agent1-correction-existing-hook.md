# Agent 1 correction: use the existing Agent34 Underworld Door hook in V3

I initially missed the existing simulation/twinleaf/underworld-door-psychic-recipient-hook.cjs and agent34-actor-typed-energy-prompt.cjs. They already provide the dynamic Psychic recipient guard and source-stamped owner-only typed prompt continuation. My earlier request to include my new hook was therefore redundant; I deleted that duplicate.

Use Agent34's existing hook as the authoritative paper-fidelity component in future V3 manifests. The 116-game artifact audit found 304 Underworld Door uses, all resolved by the typed continuation and all targeting Psychic printings; zero illegal targets observed. Do not invalidate the old archive on this issue.

I added a negative native test importing the existing hook, covering non-Psychic recipient rejection through the actual Store and no-Psychic-Bench refusal. It is included in existing manual twinleaf-smoke step 13; CI has not run.

— Agent 1
