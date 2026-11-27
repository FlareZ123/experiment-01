# Original Aichi rank20: paper-energy Celestial Roar without an owner-orphan attachment prompt

**27 November 2026 — executable, pinned native Store development result. No qualified game/win-rate samples.**

## Concrete problem and remedy

The pinned Regidrago V SIT135 native *Celestial Roar* reducer can (i) exclude Special Energy even though the printed attack says **Energy cards**, and (ii) lose a physical card when a live temporary list is mutated mid-iteration. The earlier research-owned paper hook repaired both by offering \`AttachEnergyPrompt\`, but the present V3 actor prompt projector supports that native prompt only for **Shadow Rider Calyrex VMAX Underworld Door**; this makes the older Celestial hook incompatible with the active host's owner-prompt surface.

The **source-specific answer** is a prompt-free reversible reducer patch, [\`agent47-celestial-roar-deterministic-hook-v2.cjs\`](https://github.com/FlareZ123/experiment-01/blob/agent47/celestial-roar-promptfree-paper-hook-20261127/simulation/twinleaf/agent47-celestial-roar-deterministic-hook-v2.cjs). It uses pinned native \`WAS_ATTACK_USED\`, \`CardList\`, \`EnergyCard\`, and \`MOVE_CARDS\`: move the physical top three to a temporary list, snapshot those objects, move each Basic or known rank20-legal **Double Dragon Energy ROS** directly to the single mandatory Active Regidrago destination, discard each non-Energy, and finish without a prompt. It fails closed on other unverified restricted Special Energy and restores the original prototype after a synchronous execution, including on exception. No upstream Twinleaf file is altered.

## Native execution and coverage

<https://github.com/FlareZ123/experiment-01/actions/runs/46076861293>

- **Status:** GitHub Actions workflow **success**; job ID \`140766525465\`; UTC 2026-11-27T22:30:53Z, test step completed.
- **Revisions:** research head \`62bca224362f05ec08c73c8b73be72e8ee534bec\`; pinned Twinleaf \`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05\`; Node 22; workflow \`.github/workflows/agent47-actor-hand-discard.yml\`, opt-in boolean \`celestial_deterministic_native=true\`, one run.
- **Pure tests:** 5/5 passed, including Basic + Double Dragon on the top three, physical discard, zero prompts, reducer fallback/restoration, and fail-closed unknown Special.
- **Actual native Store tests:** **6/6 passed**, on the exact original Aichi rank20 60 staged and checked before each attack; both physical seats \`0,1\` × three deliberately fixed top-three cases:
  1. \`[Double Dragon Energy, Quick Ball, Mysterious Treasure]\`;
  2. \`[Double Dragon Energy, Grass Energy, Quick Ball]\`;
  3. \`[Grass Energy, Quick Ball, Mysterious Treasure]\`.
- **Every native assertion:** one intercepted and settled real \`AttackAction('Celestial Roar')\`; all expected top-three Energy physically attached to Regidrago and other cards in discard; no pending \`AttachEnergyPrompt\`; 60 distinct source physical-card IDs in ordinary player zones; no missing or duplicate physical cards. Test: [\`agent47-celestial-roar-deterministic-hook-v2.native.test.cjs\`](https://github.com/FlareZ123/experiment-01/blob/agent47/celestial-roar-promptfree-paper-hook-20261127/tests/2026-11/agent47-celestial-roar-deterministic-hook-v2.native.test.cjs).
- No game, paired competitor comparison, model-policy tournament, V3 host episode, or 99.5% progress number was produced. The six cases are **mechanism regressions**, not six wins. The engine-pinned prompt-free native path is established only within those staged samples.

## Integration boundary / next action

An approved V3 native runner may opt into \`withDeterministicCelestialRoar(() => runMatch(...))\` **only if** the surrounding run is synchronous, serial, and source/candidate scoped. For an asynchronous or parallel native runner, implement controlled hook installation/restoration before admitting data; do not let a global class-prototype patch cross unrelated games. Run a *real projected actor* Celestial Roar turn and the root→copy→mandatory Energy continuation on the same pinned engine and verify source physical 60 after **every** settled root. The independent rank20 \`Apex Dragon → Ryuno Glide\` token selector lives on [this other experimental branch](https://github.com/FlareZ123/experiment-01/tree/agent47/rank20-ryuno-terminal-slice-20261127).

A paper-correct source effect alone does not establish a competent opponent, a completed game, competitive matchup validity, or the single fixed best-60 objective.

## Follow-up: serial asynchronous owner wrapper

A second pinned compile/native workflow [46077267602](https://github.com/FlareZ123/experiment-01/actions/runs/46077267602) on branch head `dc5f9c2a5b79891ef42c9a88628db63a38ed3dfe` **passed** after extending the module with a one-game, exclusive, exception-safe `installDeterministicCelestialRoar` and `withDeterministicCelestialRoarAsync` wrapper. Pure scope, interleaving, exception/restoration tests increased to **7/7**, while the same six actual pinned native source-60 conservation arms remained **6/6**. This makes the hook usable across awaited owner decisions **only serially**; the async wrapper itself was tested locally, not as a complete live policy-host game. Competitive samples remain zero.
