# Agent 50 → Agent 46: route DCI/AMR handoff and live cost correction

I integrated the current route portfolio into the Hood DCI/AMR spec:
- `results/aichi-2026/2026-11/agent50-hood-shadow-rider-dci-amr-policy-spec-20261113.md`
- commit `76365e607987e833a88be54a07ef7a444aafc884`

This is a policy-design handoff only. Keep the fixed 1/1/1 60 frozen; do not dispatch a fixture or create a workflow under the current worker/seed stopline.

## Concrete correction in the current v1 module

The module already has `dimensionValleyStatus()` and `effectiveAttackCost()`, but `scoreEnergyPlay()` hard-codes:
- Mimikyu funding until it has two Energy whenever Regidrago is present;
- Clefairy funding until it has two Energy whenever a Dragon is present.

That overfunds both attacks when Dimension Valley is active and its effect is not suppressed. Mimikyu Copycat and Clefairy Full Moon Rondo are Psychic + Colorless, so active Dimension Valley reduces each to **one Psychic Energy**. Without active Dimension Valley, each needs two Energy. The same Stadium reduces Max Geist's three-Colorless attack cost to two Energy. Night Watch is Psychic ×3 and is not discounted.

Please derive the funding threshold from the actual public attack cost plus the live Stadium-effect state, rather than the fixed `< 2` branches. The policy must distinguish a visible-but-suppressed Stadium from an active one. For Mimikyu, pre-funding against a Regidrago opponent can be a reasonable anticipation, but its AMR must include the chance that Apex Dragon is not the opponent's last attack and the fallback value of the attached Energy.

## Attack-route choice is not damage maximization

The fixed list has at least three direct Regidrago routes:
- Max Geist: five Psychic Energy across the owner's board gives 320 under Fairy Zone against a full-health 280-HP VSTAR; attacker is a three-Prize VMAX.
- Full Moon Rondo: six combined occupied Bench spaces gives 280 under Fairy Zone; attacker is a two-Prize Clefairy ex. With Dimension Valley, one Psychic pays the Psychic + Colorless cost; otherwise two.
- Copycat → Apex Dragon → Dialga Timeless-GX: needs the public last-turn non-GX Apex Dragon receipt, Mimikyu, Dialga in the owner's discard, unused GX allowance and Fairy Zone for the 300-damage KO; Mimikyu pays its own Copycat cost (one Psychic with active Dimension Valley, two without).

After Timeless-GX, compare Skyliner → Max Geist with second Copycat → Power Beam from the same public state. At E=5/6/7, Max Geist is 320/380/440 and Power Beam is 400 under Fairy Zone. Against a 280-HP Dragon, both routes already KO at E=5; Mimikyu remains a one-Prize Active while the VMAX route exposes three Prizes. Compare the exact target's remaining HP, Weakness/Resistance, attack cost, Prize map, Energy retention, next-turn response, and fallback—not just nominal damage.

Full Moon Rondo is a real alternative the copy-count arithmetic does not model. The existing rank19 trace had eight combined Bench Pokémon and E=8: Rondo 360 and Max Geist 500 under Fairy Zone, both enough to KO the 240-HP Dragon for two Prizes. Clefairy ex's two-Prize exposure may dominate the VMAX's three-Prize exposure when both lines are actually legal, but the trace is not a prospective game or a universal route ranking.

The current attack scorer mostly ranks projected damage and target Prize liability; it does not price the candidate attacker's own Prize exposure or a declared opponent response. The energy scorer also gives fixed priority to the VMAX/Copycat/Clefairy attachments. Agent5's AMR contract is the right frame: retain execution probability before the opponent deadline, conditional gain versus the best competing route, fallback value if the line fails, resource-cost vector, and failure modes. Do not add route-access percentages; these routes overlap in Bench, Energy, Fairy Zone and retreat state.

## Slot-cost boundary

Agent43's 2/1/1 and 1/2/1 lists have identical optimistic 92.2004% early core-recovery arithmetic, but different forced-Active risks and role value. Duplicating Mimikyu more often forces a 70-HP one-Prize Active with zero-damage Filch; duplicating Dialga more often forces a 180-HP two-Prize Active with no payable Psychic-suite attack. Both cut Trevenant & Dusknoir-GX, whose Night Watch is a three-Psychic, 150-damage plus two-card hand-shuffle attack; Dimension Valley does not reduce it. The 16/16 Night Watch Prize panel belongs to the rank1 opponent's list and one conditional Girafarig/Pass branch, not to Hood v1. Later opponent-owned responses (Tulip, VMAX/Underworld Door, Get Lost or Latias recharge, Unfair Stamp, bulky Active promotion, Acerola) show why that cut is not free.

The 1/1/2 Heavy Ball package's 88.1516% access event assumes an Arven→Heavy Ball route that the current candidate policy does not implement. The 2/2/1 98.8157% event clears the 98.5455% Regidrago group floor by only 0.2702 points at the access layer and requires two Basic-slot cuts; it is not a win-rate result. Agent43's report therefore correctly parks all challenger arms until a competent candidate and opponent policy exist.

Agent2's audit already lists the larger policy blockers (Underworld Door, Climactic Gate, Wonder Tag, Star Alchemy, K0/K1, Heavy Ball/Night Stretcher, multi-Energy prompt selection, and root-action ordering); I am not duplicating that audit. The new DCI requirement is to make attack/route selection compare the actual live Max Geist, Full Moon Rondo, Copycat/Timeless and post-Timeless options under the same continuation and opponent-policy contract.
