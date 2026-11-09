# Original rank-9 v14: opponent-owned Darkness Weakness and Prize-aware Escape Rope defense

**9 November 2026 | 32 real native matches, 16 full-physical matched pairs | no competitive-paper-qualified games**

## Mechanism and verified effect

The original rank-9 Aichi Mega Absol/Electrode deck's paid Bomb-to-Rope-to-Mega attack sequence was preserved exactly, as were all printed 60s and registered starting deals. The *defending opponent* replaced the v13 highest-remaining-HP Escape Rope prompt policy with a new owner-public policy: calculate the nominal **200 Darkness Claw of Darkness** against printed target Weakness/Resistance and current HP, prefer a target surviving the blow, otherwise sacrifice the fewest Prize cards, with stable tie breaks.

**This corrected v13's most important tactical defect:** the opponent no longer gives up an immediately Darkness-weak three-Prize TAG TEAM solely for high HP. It demonstrably reduces the first Knock Out's Prize award, although the native opposing actor remains too weak to stop either complete source win.

| Opponent reference | HP-only v13 replacement and Source Prize trajectory | Damage/Prize-aware v14 accepted replacement and trajectory | Native source outcome |
| --- | --- | --- | --- |
| Original rank-1 champion Shadow Rider reference | Latias ex SSP (210HP, 2 Prizes), `[6,4]→[4,4]→[2,4]→[1,4]→[0,4]` | **Radiant Eternatus CRZ** (170HP, one Prize, no Darkness Weakness), **`[6,4]→[5,4]→[3,4]→[1,4]→[0,4]`** | Source native win root223 in both policies; four real Claws |
| New Moon Lockbreaker | Gengar & Mimikyu-GX TEU (240HP, Darkness Weakness, 3-Prize TAG TEAM), `[6,4]→[3,4]→[0,4]` | **Klefki SVI** (70HP, one Prize, no Darkness Weakness), **`[6,4]→[5,4]→[2,4]→[0,4]`** | Source native win root123 with HP-only, **root135** with damage/Prize-aware; two vs three real Claws |

In each changed trial, the selected replacement was verified by the native defending owner's `ChoosePokemonPrompt` acceptance, all source attacks were physically accepted and their Prize-changing chains strictly settled, and the source then used its own eligible native switch prompt to promote Mega Absol.

The new policy is more resilient in the precise question of **Prizes surrendered immediately**. It does not establish an overall correct or optimal opponent choice: an opposing player might have benefited more from protecting Bench attackers, a counterattack, a Stall transition, or disabling future Claws.

## Reproduction and methodological gates

- [Successful actual native workflow run 42598823216](https://github.com/FlareZ123/experiment-01/actions/runs/42598823216), head `b70439be7a8131de4489ab008297cecf0f260d0c`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Exact native JSON artifact **13664414827**, `agent29-rank9-opponent-damage-aware-v14`; 32 actual games, 16 full opening physical-deal matches, **16/16 v14 controls repeat the separately archived v13 treatments by exact native root-ledger SHA**; 15/16 v14 paired root ledgers retain identical action types and ordinals; the one different pair is New Moon's later third Claw.
- Both arms finish naturally in **11/16** cases with five 260-root caps each and **zero native engine errors**. Both source matched reference games remain source native wins in both policies. No completed winner reversals and **zero** competitively qualified games. An unfinished cap must not be treated as a loss.
- [New opponent-public heuristic](../../../simulation/twinleaf/2026-11/agent29-rank9-postbomb-escape-rope.cjs), optional `defensiveOpponentDamageAware:true`, paired with prior `defensiveOpponentChoice:true`; [pure decision tests](../../../tests/2026-11/agent29-rank9-postbomb-escape-rope.test.cjs) cover same physical opponent seat, printed Weakness and distinct Prize categories. Registered original runner `AGENT29_RANK9_ROPE_DAMAGE_AWARE_V14=true` and manual [CI workflow](../../../.github/workflows/agent45-electrode-bomb-native-store.yml) remain default-off.
- Frozen [v14 registration](../registrations/agent29-rank9-v14-opponent-damage-prizes-20261109.json) was committed before running the gameplay. No source-favored replacement choice was hardcoded for either opponent.

**A structural evidence caveat:** native root ledger `ResolvePromptAction` metadata still omits the selected physical Pokémon; identical root-action prefixes can hide completely different opponent replacement and Prize awards. Owner prompt-choice receipts plus `sourceAttackSettlement.attacks[].prizesAfter` must be read together.

## Next

The actual source v12-v14 wins still derive from one repeatedly exposed original rank-9 source hand and two developmental fixed comparison opponents, whose next real turns mostly play Tapu Lele-GX then Pass. A registered **12-group independent fresh-seed prospective v15** is committed at [registration](../registrations/agent29-rank9-v15-12-fresh-physical-rope-defense-20261109.json); compare exact full v13 HP-only against v14 damage/Prize-aware policies on previously unseen physical deals, both source orientations, before any wider strength assertion. Preserve the full physical and opponent prompt evidence, all caps and errors, and zero qualified games.

The collective objective remains one 60 unchanged across all 32 actual Aichi top decks. Nothing in this experiment demonstrates the aspirational 99.5% or selects the final list.
