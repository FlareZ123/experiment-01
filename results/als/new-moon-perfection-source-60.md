# New Moon Perfection: published 60-card Aichi source transcription

The Japanese [first-person May 2026 Aichi Open report](https://ottopoke.hatenablog.com/entry/2026/05/13/183822) publishes official Japanese deck code `GxxDYx-a4rD4W-a8xYxc` and a [60-card image](https://cdn-ak.f.st-hatena.com/images/fotolife/o/ottopoke/20260511/20260511230136.png). This file transcribes **all 33 card-grid positions and quantities** from that image, with English name translations for research. The [machine-readable grid/60 entries](new-moon-perfection-source-60.json) preserves row and column coordinates. This is a **52nd-place tournament participant's list** and is not one of the Top 32 benchmark decks.

Grid image recovered in [public-source CI 38857162495](https://github.com/FlareZ123/experiment-01/actions/runs/38857162495); row-by-row visual confirmations: [row 1](https://github.com/FlareZ123/experiment-01/actions/runs/38857620739), [row 2](https://github.com/FlareZ123/experiment-01/actions/runs/38857511793), [row 3](https://github.com/FlareZ123/experiment-01/actions/runs/38857516724), and [row 4](https://github.com/FlareZ123/experiment-01/actions/runs/38857625328). No OCR was used.

**Transcribed totals: 19 Pokémon, 35 Trainers, six Energy, exactly 60 physical cards.** Card identities and quantities are supported by the Japanese image. Exact Japanese printing/set identifiers and a canonical English simulator-printing mapping are not yet verified. The `New Moon` Lunatone, Solrock supporting it, `Cursed Bomb/Cursed Blast` Dusclops and `Farewell Letter` Unown require ability-specific mappings when converting to English engine IDs. Treat English translations as identification aids, not a Japanese registration export.

## Pokémon (19)

| Qty | Japanese name (source) | English identity | Grid |
|---:|---|---|---|
| 2 | ミュウツー&ミュウGX | Mewtwo & Mew-GX | R1 C1 |
| 1 | ゲンガー&ミミッキュGX | Gengar & Mimikyu-GX | R1 C2 |
| 1 | オーロット&ヨノワールGX | Trevenant & Dusknoir-GX | R1 C3 |
| 1 | カプ・テテフGX | Tapu Lele-GX | R1 C4 |
| 1 | ガラルフリーザーV | Galarian Articuno V | R1 C5 |
| 1 | ラティアスex | Latias ex | R1 C6 |
| 1 | リーリエのピッピex | Lillie's Clefairy ex | R1 C7 |
| 1 | イキリンコex | Squawkabilly ex | R1 C8 |
| 3 | アンノーン | Unown | R1 C9 |
| 2 | サマヨール | Dusclops | R2 C1 |
| 2 | ヨマワル | Duskull | R2 C2 |
| 1 | ソルロック | Solrock | R2 C3 |
| 1 | ルナトーン | Lunatone | R2 C4 |
| 1 | クレッフィ | Klefki | R2 C5 |

## Trainers (35)

| Qty | Japanese name (source) | English identity | Grid |
|---:|---|---|---|
| 4 | バトルVIPパス | Battle VIP Pass | R2 C6 |
| 4 | 霧の水晶 | Fog Crystal | R2 C7 |
| 2 | ミステリートレジャー | Mysterious Treasure | R2 C8 |
| 2 | ヒスイのヘビーボール | Hisuian Heavy Ball | R2 C9 |
| 4 | レスキューキャリー | Rescue Carrier | R3 C1 |
| 2 | バトルコンプレッサー | Battle Compressor | R3 C2 |
| 2 | トレーナーズポスト | Trainer's Mail | R3 C3 |
| 1 | ぼうけんのカバン | Adventure Bag | R3 C4 |
| 1 | あなぬけのヒモ | Escape Rope | R3 C5 |
| 1 | カウンターキャッチャー | Counter Catcher | R3 C6 |
| 1 | シークレットボックス | Secret Box | R3 C7 |
| 2 | 力の砂時計 | Powerglass | R3 C8 |
| 1 | 森の封印石 | Forest Seal Stone | R3 C9 |
| 2 | リーリエの決心 | Lillie's Determination | R4 C1 |
| 2 | エリートトレーナー | Ace Trainer | R4 C2 |
| 2 | スカイフィールド | Sky Field | R4 C3 |
| 2 | 頂への雪道 | Path to the Peak | R4 C4 |

## Energy (6)

| Qty | Japanese name (source) | English identity | Grid |
|---:|---|---|---|
| 3 | テレパス超エネルギー | Telepathic Psychic Energy | R4 C5 |
| 3 | 基本超エネルギー | Basic Psychic Energy | R4 C6 |

## One now-resolved English-equivalent printing (Agent 3, 16 October)

The pilot's [May 13 article](https://ottopoke.hatenablog.com/entry/2026/05/13/183822) specifies Solrock's Japanese Ability **サンライト** (“Sunbeam”) and states it increases Lunatone's HP. It separately describes using its status attack to hope for a Paralysis result. The English identity is therefore [Solrock, Celestial Storm 62 (`sm7-62`)](https://limitlesstcg.com/cards/CES/62), whose Sunbeam sets Lunatone's maximum HP to **130** and whose Scorching Light applies Paralysis on heads, Burn on tails. [Bulbapedia's bilingual printing record](https://bulbapedia.bulbagarden.net/wiki/Solrock_%28Celestial_Storm_62%29) also aligns the Japanese name サンライト and Japanese expansion Champion Road 029/066 with this English printing.

This disambiguates the earlier name-only image transcription: the Obsidian Flames **Call for Family** Solrock cannot substitute for the source's actual Sunbeam ability and status attack. The source JSON records CES 62 as one verified **English-equivalent variant**; the exact Japanese physical printing remains unverified, and no automatic mapping of the other card rows follows.

## Interpretation limits and next tests

1. Verify Japanese printing IDs from the published official deck code against the deck viewer, and resolve the English-equivalent Twinleaf `fullName` of all 33 entries. In particular, use **Sunbeam/Sunlight Solrock** rather than the similarly named Call for Family printing, and **Farewell Letter Unown** rather than a different Unown.
2. Confirm all 60 source cards and the sole **Secret Box ACE SPEC** meet May 2026 paper Expanded legality, including current errata and reprint equivalence. Do not infer legality from this English-card translation table alone.
3. Test the actual `Horror House-GX -> Powerglass end-of-turn attachment -> Dusclops Cursed Blast self-KO -> Ace Trainer -> Perfection/Night Watch` line as a board/turn-state fixture.
4. Use the [reversible Night Watch random-selection correction](../twinleaf/night-watch-random-hand-semantics.md) for any engine benchmark of this candidate, after validating full-match copied-attack and randomness behavior.
5. Assess both physical seats and every published Aichi Top32 opponent using a policy capable of pursuing the hand-lock ALS. Record the three unavailable rank inventories and failures explicitly; no win-rate estimate is presently supported.

The author's reported 6–2 Swiss performance, including four games won against Regidrago and losses to Raichu and Iron Thorns, is a small contemporaneous first-person observation. It is not evidence that this precise list meets the project's 99.5% target.
