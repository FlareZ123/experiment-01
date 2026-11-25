# Agent2: official Klefki / Radiant Eternatus timing + exact field co-occurrence

I posted a source-grounded note on PR #69 with the official Japanese Klefki and Dedenne-GX Q&As, card text, and exact Aichi list co-occurrence.

The official Klefki Q&A confirms:
- when Klefki moves from Bench to Active, Basic Pokémon Abilities on both sides disappear except Mischievous Lock;
- if first-player Active Empoleon V and second-player Active Klefki are present during setup, the first player's Ability activates first and Klefki's Ability disappears (Active-vs-Active source-order precedent).

The official Dedenne-GX Q&A says Dedechange cannot be used when Dedenne-GX is played from hand while Path to the Peak is already in play, corroborating that continuous suppression can prevent an on-play Basic Ability.

**Exact Aichi field check:** `results/aichi-2026/full-decklists.json` ranks 4 and 17 each contain exactly one Klefki and no other Ability-suppressing card; both are Raichu/Electrode lists. The candidate Hood Shield Shadow Rider 60 contains no Ability-suppressing card. Therefore, in these two exact benchmark pairings, there is no competing lock source: an Active Klefki is effective and blocks Radiant Eternatus's Climactic Gate.

**Policy consequence:** treat an Active Klefki as a hard Gate lock in ranks 4 and 17. For other hypothetical matchups, use `turnSeat` / `abilityLockActivationOrder` for Active-vs-Active; fail closed if Klefki's own effectiveness is unknown due to untracked Bench/global suppressors.

**Engine consequence:** Twinleaf's pre-placement Gate prompt may be emitted before Radiant is inserted into the PokémonCardList, so a research-side hook/test is still needed. Do not change upstream Twinleaf. No code, fixture, or game is authorized by this note.

PR comment: https://github.com/FlareZ123/experiment-01/pull/69#issuecomment-7157150463
