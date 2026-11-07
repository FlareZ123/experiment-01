# Public-source audit for missing Aichi Open League 2026 opponent lists (23rd, 25th, 28th)

**Date:** 2026-11-07 UTC  
**Researcher:** Agent36  
**Status:** Negative provenance result. No additional exact 60-card list admitted.

## Question

Can public event, player, or decklist archives recover the exact original 60-card lists for the three placements absent from the repository's authenticated source manifest?

The current manifest `results/aichi-2026/full-decklists.json` remains the local source of truth: 29 authenticated original lists, with ranks **23, 25, and 28** missing. The public Limitless event page identifies the missing placements as:

| Rank | Limitless player | Archetype | Exact 60 found? |
|---:|---|---|---|
| 23 | Yuki Ueno | Regidrago | No |
| 25 | Kazuki Kumegawa | Raichu Electrode Combo | No |
| 28 | Jo Kato | Regidrago | No |

Primary public pages checked:

- Event standings: https://limitlesstcg.com/tournaments/566
- Published decklists: https://limitlesstcg.com/tournaments/566/decklists

The standings show the placements. The public decklist page has adjacent ranks and deck sections, but no section for 23rd, 25th, or 28th. This is consistent with the manifest's 29/32 count.

## Rank25: first-person evidence, no public 60

The player-authored note by `kume`, dated 2026-05-14, is titled **“CL愛知2026エクストラ ベスト32 アロライワンショット”**:

https://note.com/kume_pokeca/n/n6cfd126f5774

Its public portion reports eight Swiss matches, a 7-1 record, qualification in 25th place, and a Top 32 loss to Mega Absol / Garbodor. The public construction section begins after the paywall; the page shows a paid price and no public deck code or exact card counts before that boundary. I did not access or attempt to bypass paid content.

PokéKameshi's 2026-05-18 roundup independently links the same player note under the Best32 Eleki Rain / Alolan Raichu entry:

https://pokekameshi.com/cl2026aichidec-extra/2/

This supports the player/archetype/result association and the matchup narrative. It does not supply the original 60. Do not substitute rank4 or rank17 Raichu/Electrode lists.

## Rank28: public result post, identity crosswalk unresolved

The same PokéKameshi roundup includes a first-person May 10 post from `レプリカ` (`@nnaacc5_uec`) stating that the author finished 28th in CL Aichi Extra and used Regidrago. The roundup's embedded post text is:

> CL愛知エクストラ 予選28位トナメ1没でした！ レジドラゴ、今までありがとう

This is useful first-person placement/archetype evidence. The Limitless standings attribute 28th to **Jo Kato**, while the roundup uses the handle/display name **レプリカ**. I found no authoritative identity crosswalk between those labels. The post/roundup contains no public deck code or card-count list. The image shortlink was inaccessible through the public page viewer, so no image contents are claimed.

Do not treat this as a recovered 60, and do not merge the two player labels without evidence.

## Rank23: no additional public list source located

Limitless identifies 23rd as Yuki Ueno, Regidrago. The published decklist page has no corresponding deck section. Searches of public English/Japanese event terms, the player name, and the event's public decklist roundup did not locate a first-person deck code, image, or exact card-count list. The accessible Limitless player profile did not show a 2026 Aichi list. No source is strong enough to admit any card counts.

## Search boundary and conclusion

Searches covered the Limitless event and decklist pages, player/archetype-specific queries in English and Japanese, X/Twitter-indexed posts, Note, and PokéKameshi's 2026 Aichi roundup. The only new usable provenance is rank25's public match/result/strategy text and rank28's public result/archetype post. Neither closes the exact-list gap.

**Roster remains 29/32 authenticated exact original 60s.** Ranks23, 25, and28 must remain missing. No archetype template, neighboring placement, paid content, or unverified player alias was used to fabricate a list.

Recommended next step: seek direct permission-based publication from the players or event/list archivist, especially for rank25's publicly identified `kume` account and rank28's `@nnaacc5_uec` post. Preserve original Japanese card names/printings and source URLs if a list is later supplied.


## Additional archive checks (7 November follow-up)

- **Nayuta's image-first collection:** https://note.com/nayuta_poke/n/n7e3d0552090b. The search-indexed page text says the author collected public X deck recipes only when at least 55 cards could be identified. Its Top32 block includes Regidrago and Eleki Rain archetype headings, but the indexed material does not attribute a specific image/list to Yuki Ueno, Kazuki Kumegawa, or Jo Kato. Direct page open returned a cache miss; an image search did not expose the relevant deck images. This remains an unattributed 55+ image lead, not an original registered 60.
- **PTCG CAREER 2026 archive:** https://ptcg-career.com/decks/archive/2026. Its stated 2026 domestic coverage is CL/PJCS Top8 and official decklists; the CL 2026 Aichi May event shows eight results. Searches for the three missing player names in that archive did not return their placements. This archive does not cover ranks23,25,28.

These checks add no exact lists and do not change the 29/32 denominator.
