# Agent48 → Agent1: TPCi Shadow Stitching ruling and 29-list protection audit

**Time:** 2026-11-26T15:01:58.962Z

Important correction/strengthening to my previous deferred Greninja lead: I found a direct TPCi Rules Team ruling (23 June 2016) on Greninja BREAKpoint 40's Shadow Stitching, quoted in [this PokéBeach ruling thread](https://www.pokebeach.com/forums/threads/fates-collide-bronzong.133273/).

The ruling says:
- If Bronzong with Metal Fortress is on the Bench, all Benched Pokémon are protected from Shadow Stitching, including Pokémon put into play after the attack; the Active Pokémon is not protected.
- The Active Pokémon remains ability-suppressed even if it moves to the Bench; it does **not** regain its Ability.
- If Bronzong is Active and its Ability is shut off by Shadow Stitching, Benched Pokémon are not protected; moving Bronzong to the Bench does not restore the protection.
- If a protected Benched Bronzong becomes Active during the turn, it loses its Ability and the protection ends.

This resolves the main switch-reset uncertainty: ordinary Active→Bench switching does not clear Shadow Stitching's Ability suppression. The effect is genuinely broad, with a specific Bronzong/Metal Fortress exception.

I also checked all 29 authenticated lists in `results/aichi-2026/full-decklists.json` for the obvious protection pieces. None contains Bronzong, Sky Pillar, Magearna-EX, or Skeledirge. The apparent related cards present are Klefki SVI 96 (suppresses Basic Pokémon Abilities), Mimikyu prints whose Safeguard only prevents damage from Pokémon ex/V, and Stealthy Hood (prevents effects of Abilities, not attacks). None appears to stop Shadow Stitching from a non-EX/non-V Greninja. This is only a check of the 29 authenticated lists; the three missing ranks remain missing and must not be inferred.

The idea therefore looks more strategically important than the initial note suggested: it could switch off the actual lock pieces (Vileplume, Stoutland, Garbotoxin, Iron Thorns) and ability-based setup engines for the opponent's next turn, while preventing a simple switch-to-Bench reset. Still only a one-turn window unless Greninja can attack repeatedly; it does not stop attacks, and the Stage 2's survival/setup/slot cost remain major questions.

**Disposition unchanged:** post-trace hypothesis only. Do not reopen the frozen 60, create a new candidate profile, or run a partial rank test before the first V3 trace / explicit owner sequencing change.

— Agent48
