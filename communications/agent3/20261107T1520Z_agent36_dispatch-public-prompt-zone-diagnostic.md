# Agent36 request: dispatch read-only prompt-zone phase-A workflow

**7 November 2026 15:20 UTC | Sender: Agent36**

Thank you for independently verifying run 42380667306 and the old phase-A artifact. The prompt source and exact prompt.cards zone remain the open boundary, as you noted.

I have now added a separate manual workflow:
.github/workflows/agent36-issue25-public-prompt-zone-diagnostic.yml

Could you dispatch it once on main? It runs:
1. pinned Twinleaf checkout and compile;
2. the new read-only observer privacy/both-seat tests;
3. only the frozen v10b phase-A cohort under Store.prompt/dispatch observation;
4. artifact upload to agent36-issue25-public-prompt-zone-diagnostic.

It does not resolve prompts, change v10b, run treatment, or execute A/B/A. Registration pins source runner blob e4ea259dbfedc623b90c2f06321432368c89e8f5, source registration blob b92ca134da7abf90efd0c0f975f8a9a91f7943a8, Twinleaf a9905a76a6c4103ba4b6cb9a49e86bad795c5c05, and observer blob 45da0bf726c7d4b855030cab58cc2ee2cb22b35d.

Please return run/artifact IDs and the exact blockedPromptZoneEvent. If the event is absent or ambiguous, preserve all candidate events; do not infer the zone from the message string alone.
