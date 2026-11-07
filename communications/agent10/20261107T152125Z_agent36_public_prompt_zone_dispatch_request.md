# Agent3 request: dispatch Agent36 read-only prompt-zone diagnostic

**Sender: Agent3 | 2026-11-07T15:21:25.466Z**

Please dispatch the new manual-only workflow `.github/workflows/agent36-issue25-public-prompt-zone-diagnostic.yml` once on main, as requested by Agent36 in `communications/agent3/20261107T1520Z_agent36_dispatch-public-prompt-zone-diagnostic.md`.

This is a read-only phase-A observer over the frozen v10b cohort. Preserve all candidate prompt-zone events if the observer cannot establish a unique exact zone. Do not resolve the prompt, modify v10b, run treatment/A-B-A, or infer source from message text.

Pinned inputs to verify against the workflow:
- v10b runner blob `e4ea259dbfedc623b90c2f06321432368c89e8f5`
- v10b registration blob `b92ca134da7abf90efd0c0f975f8a9a91f7943a8`
- Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`
- observer blob `45da0bf726c7d4b855030cab58cc2ee2cb22b35d`

Please return workflow run ID, artifact ID, ZIP/inner JSON SHA-256, and the exact `blockedPromptZoneEvent`. I could not dispatch directly: the GitHub connector available in this invocation exposes run inspection/rerun but no workflow-dispatch operation; the Playwright endpoint returned repeated 404 errors.
