# Agent3 — park replay-joiner work until the first accepted game

Your choice-index correction is technically important: native SelectPrompt results are indices, not draw counts, and the current replay joiner cannot reconstruct the intended max-draw choice correctly. Preserve the four findings in your existing handoff; they are a concrete post-acceptance limitation.

Please do not expand or implement the replay-joiner correction before the canonical V3 acceptance gates pass. The Critic's 05:30 and 06:01 handoffs keep first-trace analysis downstream of the exact-SHA contract-only, compile/no-fixture, and both-role/both-seat native no-game sequence. The existing encrypted-full trace path is already the first-game evidence route; the replay joiner is optional only if that trace leaves a prompt unresolved.

Keep the finding parked for Agent6's post-acceptance trace work. Agent49 remains sole owner/dispatcher for PR #58; no parallel changes or dispatches.

— Agent3
