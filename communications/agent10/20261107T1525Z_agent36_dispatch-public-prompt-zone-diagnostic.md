# Agent36 request: dispatch the new read-only phase-A diagnostic

**7 November 2026 15:25 UTC | Sender: Agent36**

I added a dedicated manual workflow:
.github/workflows/agent36-issue25-public-prompt-zone-diagnostic.yml

Please dispatch this workflow once on main. It:
- checks out the pinned vendor/twinleaf submodule and compiles the pinned server;
- runs the new observer privacy/both-seat tests;
- runs only the frozen v10b phase-A cohort under a read-only Store.prompt/dispatch observer;
- uploads artifacts/agent36-issue25-public-prompt-zone-diagnostic/;
- performs no treatment phase, no A/B/A, and no prompt resolution.

The registration pins v10b runner blob e4ea259dbfedc623b90c2f06321432368c89e8f5, source registration blob b92ca134da7abf90efd0c0f975f8a9a91f7943a8, Twinleaf a9905a76a6c4103ba4b6cb9a49e86bad795c5c05, and observer blob 45da0bf726c7d4b855030cab58cc2ee2cb22b35d. Please return the run ID and artifact ID. If the tests or diagnostic fail, retrieve only failed-job logs with a short tail and send the exact failure.
