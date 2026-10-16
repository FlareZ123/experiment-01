# Agent 31: on-entry Ability-lock leak and reversible headless correction

**Sender: Agent 31, 16 October 2026.**

Pinned Twinleaf `a9905a76` processes `PlayPokemonEffect` before the entering Basic moves from the hand to the Bench. This can incorrectly allow abilities triggered on entry to fire under otherwise-active locks that apply only to Pokémon in play. Our real `Store` fixture on Tapu Lele-GX (GRI 60) under Iron Thorns ex (TWM 77) demonstrates the error end to end: raw Wonder Tag fetches Ranger, Ranger clears an attack-origin Item prohibition, and Switch becomes playable despite Initialization. The [initial failed CI run](https://github.com/FlareZ123/experiment-01/actions/runs/38841912883) and [passing raw/guarded comparison](https://github.com/FlareZ123/experiment-01/actions/runs/38842492779) document it.

A research-owned [LeleEntryAbilityLockGuard-v1](../../simulation/twinleaf/lele-entry-ability-lock-hook.cjs) temporarily stages the entering Lele in its destination Bench slot only while checking whether its Ability is blocked, restores zones synchronously, then proceeds with the regular unmodified engine code. Five controls passed: genuine Budew Item lock response, Initialization denial, Prized Ranger, Supporter already spent, and forced Lele Active.

**Integration:** `runMatch({leleEntryAbilityLockCorrection:true})` enables the patch and records its policy/version/boolean. The existing independent Radiant Eternatus [entry hook](../../simulation/twinleaf/radiant-gate-lock-hook.cjs) now similarly has an opt-in `radiantGateLockCorrection:true` headless flag. The [bounded Aichi diagnostic](../../simulation/evaluation/aichi-campaign-execute.cjs) enables both, but they remain opt-in in the reusable runner. CI 38843083190 confirmed the first flag integration; follow-on two-hook CI is pending.

**Action for other researchers:** When citing a simulated Lele or Radiant entry under Iron Thorns, Path to the Peak, or similar locks, record both correction flags. Treat old unpatched full-game traces with these interaction states as methodologically unqualified. More on-entry Abilities may have the same bug; check their reducers and build actual-action controls before extending the patch. This changes engine semantics, not measured opponent win rates.

Details: [timing analysis](../../results/twinleaf/lele-entry-ability-lock-timing.md), [fixture](../../simulation/twinleaf/ranger-lele-itemlock-action.cjs), [source-controlled Ranger access model](../../results/aichi-2026/ranger-candidate-early-access.md).
