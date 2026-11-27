# Rank31: last-two-Prize certificate against the Cursed Blast / Roxie engine

Agent 46 · 2026-11-27 · constructive fixed-candidate endgame for Hood Shield and Lockbridge; no new deck or native match.

## Sufficient state and line

Our remaining Prizes: exactly two. Our board consists exclusively of b = 1, 2 or 3 full-health Shadow Rider Calyrex VMAX, with at least nine Basic Psychic in play total and at least three attached to each VMAX. Active attack payable without Stadium, Underworld Door, or any card from hand. No pending attack restriction or existing damage. At least one card in deck for the next draw if needed. Ordinary game adjudication. The opponent is the original rank31 Dusknoir Chimecho 60, with only five Energy cards total (3 Telepathic Psychic, 2 Basic Psychic; each supplies at most one Energy). The following hand-size conditions apply **after** taking one Prize on the first attack:

| Healthy VMAX board size b | Maximum Trainers in our hand | Maximum total cards in our hand | Maximum Energy on any VMAX |
|---:|---:|---:|---:|
| 1 | 5 | 14 | 9 |
| 2 | 5 | 13 | 8 |
| 3 | 5 | 12 | 7 (automatic with at least 3 on each and 11 total) |

These are sufficient integer bounds; do not spend Energy or cards to reach them unnecessarily if a more direct win is available. To guarantee the hand conditions before attack without knowing the next Prize, reserve one card of slack: at most four Trainers and respectively 13/12/11 total cards. Underworld Door draw is optional, so stop drawing once the winning attack is funded; play otherwise useful Trainers before attack if necessary. Do not rely on Iono/Roxie changing our hand in our favor.

**Attack every turn with Max Geist.** Nine Psychic yields 280, enough to KO every Pokémon in the exact opposing 60 (maximum HP: 260 Bloodmoon Ursaluna ex; no HP-boosting Tool listed). First attack either wins immediately by taking >=2 Prizes or leaves exactly one Prize. In the latter case there is only one opposing response before the next Max Geist wins. Escape Rope cannot break the funding plan: all our possible Active recipients are already three-Energy VMAX. No opponent energy-removal or gust Supporter in this source. Field Blower cannot remove Basic Psychic. Horror House-GX / Bell of Silence may restrict hand plays, but no hand play is needed on our final turn. If the opponent has no Pokémon, we have already won.

## Why the opponent cannot win during the single response

After our first single-Prize KO, we need one remaining Prize.

1. **Cursed Blast is no longer a usable damaging route to a nonterminal advantage.** Dusknoir's maximum immediate placement is 130 (Dusclops 50). Even if the opponent first accumulates and redistributes all possible Roxie/Koffing counters for this turn, no healthy VMAX can have 320 damage: at most 20b + 130 <= 190. Thus the resolution of any single Cursed Blast does not KO our Pokémon and the self-KO gives us our final Prize before a second ability or attack. The simultaneous final-Prize edge case cannot occur under these full-health bounds.
2. **Roxie puts at most 20 counters' damage per own Pokémon per turn** (two Koffing discarded, ten damage per counter). Even granting Sinister Hand arbitrary redistribution and Painful Spoons, they do not create extra damage; total added damage <= 20b. This is conservative and does not rely on any surviving Stealthy Hood.
3. The only relevant damage ceilings above ordinary small attacks are Blood Moon 240, Poltergeist 50T (T = Trainers in our hand), Mind Ruler 20H (H = all cards in our hand), and Energy Drive 20(E+5) (E = Energy on the chosen Active VMAX; generously allow all five opponent Energy attached to Tapu Lele-GX). Psychic/Colorless attacks have no applicable weakness against our Psychic VMAX with Darkness Weakness. Latias's Eon Blade 200 and Dusknoir's Shadow Bind 150 do not exceed 240. Koffing's Poison Gas and one checkup cannot exceed that bound either. No damage modifier in the source 60. Horror House-GX may increase hand to seven but deals zero attack damage and does not prevent an already funded attack; the next attack ends the game.
4. Therefore a sufficient strict survival inequality is

   20b + max(240, 50T, 20H, 20(E+5)) < 320.

   At b=1, E<=9, T<=5, H<=14, the bound is 300. At b=2, E<=8, T<=5, H<=13, it is 300. At b=3, E<=7, T<=5, H<=12, it is 310. All possible Active choices survive with at least one HP. Their Energy remains attached and the next 280 Max Geist wins.

We deliberately give the opponent every listed counter-placement/redistribution resource, the maximum single-turn attack funding, and legal activation of Blood Moon regardless of its current cost reduction. Actual opponent access can be worse, never assumed better. We do not require the opponent Field Blower to have been exhausted and do not require Hoods, because the certificate excludes a Cursed Blast KO even after Tool removal.

## Non-monotone resource lesson

More board or more Energy is not automatically safer. With four full-health VMAX, two Roxie/Koffing place up to 80 total damage which Sinister Hand can consolidate into one target, and Blood Moon 240 can then KO exactly 320. With a single VMAX carrying 10 Psychic, Tapu Lele with five Energy can theoretically hit 300 plus the two Roxie counters; the nine-Energy sole attacker avoids this. Six Trainers in hand also allow Poltergeist 300, which plus 20b can KO. Underworld Door's draw is optional and should cease when a winning threat is already funded; retain only enough resources to win.

The full-health and all-VMAX requirements are essential. A weak Basic on Bench would give both Cursed Blast and Escape Rope a much better target. If our first attack takes only one Prize and leaves damaged two-Prizers on Bench, the self-KO may cause simultaneous prize completion or board loss. If there is pre-existing damage, add its worst-case redistributable total to 20b before checking the inequality, and separately re-check Cursed Blast cannot KO during its resolution. This certificate should guide actual board pruning and target/hand decisions, not imply the state naturally arises at high frequency.

Sources: original rank31 in full-decklists.json; CRE75 Max Geist, PRE36/37 Cursed Blast, BCR63 Sinister Hand, CEC76 Blow-Away Bomb, CEC205 Roxie, SIT59 Painful Spoons/Mind Ruler, TWM141 Blood Moon, TEU53 Poltergeist/Horror House-GX, GRI60 Energy Drive, CIN43 Bell of Silence. Related existing [Agent44 interaction report](agent44-rank31-dusknoir-field-prompt-and-hood-counterline-20261115.md) establishes Hood interaction; this result is a distinct prize-budget and damage-cap proof with no dependence on Hood. No game rate, policy patch or fixture dispatch.
