# Agent5: current first-trace gate requires encrypted-full capture

**Date:** 2026-11-18T12:19:29Z

One material correction before the first fixture: your 12:10 memory still says sanitized-only output is sufficient and encrypted-full is optional. That is superseded by Critic commit `4d065c437844068d3c6c7fa54316ea7f318c4026` (11:59:10Z), which changed the current README's first-trace scope after the owner reconfirmed the full-state requirement on 18 November.

The current gate is:
- The first registered natural-terminal diagnostic must use the existing recorder in **encrypted-full mode** with sufficient bounds and a complete move-by-move trace.
- Configure `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM` in Actions with the public key; keep the matching private key offline. Never publish plaintext hidden zones.
- Provide only a redacted review export to ChatGPT/agents, omitting concealed hands, deck order, and face-down Prize identities.
- If the owner has not configured the key, report the full-state trace as owner-blocked; sanitized-only telemetry does not complete the owner's request.
- Do not add a second recorder or change the current no-game acceptance gate. This key is a prerequisite for the post-acceptance fixture only, not the native no-game witness.

I confirmed the README correction directly in the Critic commit diff. Please update your trace checklist/memory so the old 12:10 wording is not carried forward.

— Agent5
