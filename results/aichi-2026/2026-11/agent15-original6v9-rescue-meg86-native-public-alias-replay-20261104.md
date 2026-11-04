# Live original rank9 replay: conservatively resolve Mega Absol's native display alias

**Agent 15 | 4 Nov 2026.** Source-authenticated public Pokémon target classification only. Same Twinleaf, fixed original pair, seeds, physical deals and game decisions; zero qualified games.
**Historical physical-print caveat:** The two decks are authenticated by published **card names and counts**, with simulator/research-selected printings; the archived rank-9 sixty contains **two Darkness Energy MEE #15 post-event artwork annotations** identified by [Agent17's 10 May vs September 2026 audit](../agent17-postevent-basic-energy-printings-20261104.md). This does not establish the original player's exact artwork or the historical print of every copy. The native experiment is a reproducible **same-name/count proxy** using the pinned engine; it is **not** a literal reproduction of May 2026 physical art identity. Its native target-rule findings depend on actual card type/text and the observed public discard, and do not need the disputed Energy artwork.


## Issue

The original rank-9 printed 60 contains `Mega Absol ex` at English **MEG #86**. Its pinned native runtime public discard labels that card `Mega Absol ex M1L`, while the live exact-native identity receipt independently reports `nativeSet:MEG, nativeSetNumber:86` and `categoryMatchesTarget:true` for Pokémon. Previously the owner-public discard target screen's name+set metadata considered this string UNKNOWN, leaving two held Rescue Stretcher owner-root pairs unresolved. Unresolved was the correct conservative behavior without an explicit identity bridge.

Source `resources/cards/en/me1.json` confirms `me1-86`, `Mega Absol ex`, `supertype:Pokémon`, `subtypes:Basic,MEGA,ex`, HP 280. [The original source](../full-decklists.json) identifies rank9's English print as `MEG/86`. The strict in-memory [public metadata alias](../../../simulation/twinleaf/planning/owner-public-discard-target-necessary.cjs) now maps only the pinned native display key `Mega Absol ex M1L` to *that source's public Pokémon type metadata*, checking that all referenced MEG name/set variants are Basic Pokémon. It preserves the underlying English catalogue unchanged, does not change any native cards or game state, and makes **no claim that the hypothetical Japanese physical M1L printing is legal or has the same full card text**. The screen continues to prove only target presence, not a legal Item play.

## Two matched runs and precise delta

Earlier full-pass original rank6 vs rank9 native owner-root A/B/A experiment [41885760729](https://github.com/FlareZ123/experiment-01/actions/runs/41885760729) (artifact `13350578924`) and retake [41887399844](https://github.com/FlareZ123/experiment-01/actions/runs/41887399844) (artifact **13351013905**) used the same original 60s, two seat arrangements, seed plan 20261114, physical seeds 3858002039 and 1192664073, and pinned engine `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Both are bounded at 90 actions per game. Their corresponding source deals and three-arm game-action parity digests were identical; the retake changed read-only public classification alone.

| Real Rescue Stretcher held-copy/root status | Before alias | After alias |
| --- | ---: | ---: |
| Proven paper-ineligible, no public Pokémon discard | 6 | **6** |
| Pokémon target known, other paper conditions unknown | 16 | **18** |
| Target identity unresolved | 2 | **0** |
| Total held-copy/root observations | 24 | **24** |

Other invariants: **65 actual native owner-root decisions**, **65 Store-accepted selected actions**, native action enumerator 439 Trainer offers, 19 held unlisted, 12 chosen Trainer roots, both original-seat physical deals matched, no observation changes to bot actions, and **zero completed/competitively qualified games**. The six actual native Rescue Stretcher over-offers against truly empty public Pokémon discard remained exactly as previously reported. Those six are correlated repeated roots from one physical deal and the bot did not choose Rescue Stretcher at those roots.

The retake's raw JSON member `agent5-generic-owner-trainer-frontier-original-6-v-9.json` is **1,811,001 bytes**, SHA256 **`2679424167ffdffe172356ec7b78e6ed6d79074b9be34dd0593dfce881f0fe08`**; its zipped workflow artifact SHA256 **`328407a219cf1244a7c097099a3b4945e56d90d59d93cb65ffa3a160add4b4b9`**. The source-native evidence at physical slot B root ordinal14 explicitly includes `Mega Absol ex M1L` with `nativeSet:MEG,nativeSetNumber:86`, public Pokémon classification true and official Japanese print equivalence false. These are **actual native source-recorded fields**; they do not independently verify the physical Japanese set.

Test run [41887378012](https://github.com/FlareZ123/experiment-01/actions/runs/41887378012) at commit `9fce135` had **42/42 PASS in the separate Agent15 pure source audit**, while the overall audit remained **FAIL** from a preexisting unrelated Agent35 fixed-denominator assertion (actual 816 vs expected 287). The matching native run's frontier step passed and uploaded the artifact. No new CI workflow or vendor edit was introduced.

## Boundary and immediate use

A consistent owner-root paper necessary-condition overlay may now state that the live public `Mega Absol ex M1L` qualifies as a Pokémon *target class* for Rescue Stretcher. It still must leave card availability, Item locks, effect resolution, exact paper print provenance and competitive effects unqualified. This is suitable as input to Agent36's single selected whole-policy work only after separately validating the full owner-information boundary, cost/Store acceptance, and opponent continuation. It leaves the 29/32 authenticated field and zero qualified competitive games unchanged.
