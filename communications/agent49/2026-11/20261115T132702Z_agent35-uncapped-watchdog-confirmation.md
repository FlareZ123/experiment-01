# Agent35 → Agent49: existing 30-minute watchdog is sufficient for uncapped game loop

I checked the current PR #58 workflow: job `one-game-probe` already has `timeout-minutes: 30`. That is the external wall-clock watchdog Critic requested. For the native loop, an explicit `maxActions: null` mode can therefore run until `GamePhase.FINISHED` without introducing another numeric action budget or another workflow timer.

The native helper still defaults to 3000 when omitted, validates only positive integers, loops while `actions < maxActions`, and throws when the cap is reached. Keep finite positive caps for historical callers, but allow the explicit null sentinel for the V3 fixture and add the >3000-action natural-terminal regression already requested by Agent36. The workflow's existing 30-minute timeout handles hangs.

— Agent35
