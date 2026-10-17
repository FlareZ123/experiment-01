# Regidrago: high-damage attack payload and Energy tradeoff

**Agent 2, 17 October 2026.** Card text, rulebook and source inventory analysis; no qualified wins.

## Verified printings and field

The 29 exact [published Aichi 2026 Top-32 lists](../aichi-2026/full-decklists.json) include nine Regidrago inventories. Three use Mega Dragonite ex ASC 152 (ranks **14,20,32**), five use Koraidon ex TEF 120 (ranks **10,12,18,21,27**), and one uses neither. The rank23 and rank28 Regidrago lists are unknown.

When copied by Regidrago VSTAR's paid Apex Dragon, Mega Dragonite ex's `Ryuno Glide` has **330** base damage and says **discard two Energy from this Pokémon**. Koraidon's `Kaiser Tackle` deals **280** and inflicts **60 self-damage**, without discarding Energy. An unprotected Shadow Rider Calyrex VMAX has 320 HP; 330 nominal damage reaches that threshold, while 280 alone does not. A normal 280-HP Regidrago VSTAR is in range of both attacks. Damage modifiers, walls, Rules Boxes and Prize modifiers remain state-dependent.

Advanced Player's Rulebook v3.4, section II C-01, says one Ignition Energy providing three Energy can satisfy an effect discarding three Energy. Double Dragon Energy ROS provides **two units of any type** on a Dragon Pokémon. Thus discarding **one attached Double Dragon Energy** is a plausible rules-consistent payment for `Ryuno Glide`'s discard-two-Energy text; the printed text says Energy, rather than Energy cards. Independent pinned-engine verification is needed.

If Regidrago has its GGF basics plus an extra Double Dragon Energy, spending the DDE would preserve its GGF Apex Dragon payment. If it holds only GGF basics, discarding two Basic Energy normally prevents another immediate Apex Dragon without acceleration. Koraidon's recoil trades survivability for preserving those Energy attachments. Whether immediate 330 damage is worth the payment depends on exact Prize and board state.

A [first-person Aichi 2026 79th-place account](https://note.com/nt07/n/n12ac10ce06b9) dated 12 May 2026 explicitly describes selecting Mega Dragonite over Koraidon to avoid the latter's 60 recoil in Regidrago mirrors. This is external qualitative pilot judgment, outside the 32-opponent benchmark.

## Test scope

[Engine probe](../../simulation/twinleaf/apex-mega-dragonite-energy-discard.cjs) uses a synthetic established paid Regidrago board, puts Mega Dragonite in discard and physically dispatches the copied attack. It records after-resolution Energy and checks available prompts against a single DDE or two Basic attachments. Pinned source inspection at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` shows Mega Dragonite's `reduceEffect` invokes `DISCARD_X_ENERGY_FROM_THIS_POKEMON(...,2)`. The helper makes a `ChooseEnergyPrompt` with two Colorless requirements. Its validator calls `StateUtils.checkExactEnergy`; this expands the Double Dragon `[ANY,ANY]` provision to **two** Energy units. Therefore, *under these inspected source semantics*, one DDE is a legal exact payment. The source card `set='ASC',setNumber='152'` currently has the inconsistent printed `fullName='Mega Dragonite ex M2a'`, so the probe resolves it by exact set+number instead of assuming the name suffix. The runtime copied-attack effect and actual discard still require compiled CI verification.

The probe is opt-in under existing manual `aichi-attack-pass-score.yml` flag `mega_energy_probe`; its result has **not yet been observed**.

A staged printed-attack interaction cannot qualify any game. No change to the nominated 60-card candidate is justified by this analysis alone.
