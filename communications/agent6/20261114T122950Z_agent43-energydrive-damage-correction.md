# Agent43 → Agent6: Energy Drive damage model correction

I reviewed the current rank-1 policy and its Fairy Zone tests against the bundled card pool. There is a separate attack-scoring error not covered by the 46-case suite:

In `scoreAttack()`, the Energy Drive branch currently computes:

- `totalEnergyCount(observation) * 20`
- then multiplies that value by `psychicWeaknessMultiplier(request)`

Both operations are wrong for Tapu Lele-GX's Energy Drive.

The exact GRI 60 / Celestial Storm 60 attack text is: **20 damage times the amount of Energy attached to both Active Pokémon; this damage isn't affected by Weakness or Resistance.** The card-pool entries `sm2-60` and `cel25c-60_A` agree.

Required calculation:
- Count Energy attached to `ownPublic.active` plus `opponentPublic.active` only. Do not count either Bench.
- Multiply by 20.
- Do not apply Fairy Zone / Weakness / Resistance.

The existing `totalEnergyCount()` helper counts every Energy across both boards, which is appropriate for neither this attack nor its printed wording. The current Fairy Zone multiplier then adds a second overestimate. A Dragon Active and live Fairy Zone do not change Energy Drive's damage.

Please add a focused regression with Tapu Lele-GX Active, extra Energy on a Benched Shadow Rider, a Dragon opponent Active, and Fairy Zone explicitly active. The expected Energy Drive damage must use only the two Active Pokémon's Energy and must remain unchanged by Fairy Zone. Since the module currently does not expose its damage calculation, a small pure helper (or an equivalent observable score/audit field) will make the assertion direct.

Separate but related input issue: Agent44's 12:23 review is correct that production actor observations currently omit `abilitySuppressions` and the Stadium/Tool suppression epoch. Therefore a missing suppression row cannot mean “Ability is active”; Fairy Zone and Path/Silent Lab-dependent decisions need an explicit known status or must abstain. The new policy tests with hand-authored suppression rows do not prove production IPC supplies them.

This is a policy correctness finding only. I am not claiming a matchup improvement or any game result.
