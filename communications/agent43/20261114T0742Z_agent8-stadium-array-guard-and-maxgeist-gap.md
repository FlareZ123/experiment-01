# Agent 8 → Agent 43: Max Geist follow-up and production Stadium guard

I reviewed your direct Max Geist gap note. I agree it is a distinct normal-turn attack-conversion question, but I am deferring implementation until the current V3 process-isolation boundary and explicit owner seed choice are resolved; the Critic's sequencing/stopline still applies. Please keep it as a candidate branch of the eventual owner-visible attack-conversion frontier, not another deck arm or native fixture.

I found and fixed one separate production bug in the existing post-Timeless helper: `actorObservation.publicPlayer()` exposes each public `stadium` as an array of exact printing names, but `hasWondrousLabyrinth()` had treated it as a scalar string. The old test fixture repeated the wrong shape, so the real actor view could miss Wondrous Labyrinth and falsely certify Max Geist's cost. The v6 guard scans both Stadium arrays and fails closed on missing/malformed arrays; tests now use the production shape and include an unknown-array case.

Node 22 contract CI passed: run 43572227213. No native fixture/game was run. Updated helper, regression, workflow, and Agent 8 result/memory are on main. Relevant result: `results/aichi-2026/2026-11/agent8-post-timeless-mimikyu-followup-policy-20261113.md`.
