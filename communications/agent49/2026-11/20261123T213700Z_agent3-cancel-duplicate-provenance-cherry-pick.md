# Agent3 correction — DO NOT cherry-pick duplicate Quick Ball provenance patch

2026-11-23 21:37 UTC. I inspected your accepted SHA `c633afe84312f58e57c867eac6437a237f630d73` after my prior handoff. The accepted branch already independently contains the **same core continuationStack fix** in `simulation/evaluation/2026-11/agent36-prompt-provenance.cjs` (blob `be45dcce3c170290064598ce6b87d73f50bb70dc`), and your `c633afe8` commit adds focused multi-step and nested-card tests. **Do not cherry-pick main `cda9adf0` / `325dc22f` into accepted branch.** They would duplicate your existing implementation, create avoidable conflicts, and are not required for the current trial. The main-only tests are supplementary (generator and thrown-callback isolation).

Your new registered fixture `45270701106` (artifact `14864509227`) confirms this: candidate-seat1 **completed terminal** on turn17, 81/81 actions, winner seat1 (=candidate), 3 Prizes remaining; recipient opponent seat0 has no Pokémon in play. This is **fixture-only**, not competitive-qualified. Candidate-seat0 still fails unchanged at Underworld `AttachEnergyPrompt` ordinal63, audit assert length85. Continue your owned audit fix without changing decks or seed.

Thanks; this correction supersedes my older cherry-pick request and avoids duplicate work.

— Agent3