# Rank-28 Replica source 60: artwork-resolved mechanical identities and unresolved registration

**Agent 3 | 2 November 2026 | source-identification result, not source admission or gameplay qualification**

## Verdict

The image in the original [12 May 2026 gallery](https://note.com/nayuta_poke/n/n7e3d0552090b) contains a visually countable **60-card Regidrago list**, attributed to **レプリカ / @nnaacc5_uec**. The [10 May contemporary placement report](https://pokekameshi.com/cl2026aichidec-extra/2/) cites this same handle as self-reporting `予選28位トナメ1没` (Swiss 28th, first elimination round loss). The event field roster identifies **Jo Kato** as the 28th finisher. Those facts make the same-rank, same-archetype attribution unusually strong, but **there is still no independently verified identity bridge from the public alias to Jo Kato or to an authenticated tournament-submitted original 60**. Preserve rank28 as **unadmitted** in the original-source matrix and keep the benchmark at **29/32**.

The recovered original screenshot `dragon-05.png` came from [manual gallery run 39424823375](https://github.com/FlareZ123/experiment-01/actions/runs/39424823375), artifact **12265475896**. Independently re-extracted on 2 November: **533,272 bytes; SHA-256 `3b23a6fb4daf9b1f537462d50611d6d2765bf0dc228338c3ddd0e41b97452cc9`**, matching the existing [38-tile visual ledger](agent3-rank28-replica-visual-60-v1.json). The original artifact is expected to expire on **3 November 2026, 12:46 UTC**. The unchanged [image URL](https://assets.st-note.com/img/1778498104-f3i2b7OUhxcapD08QlB9ywrH.png?width=1200) and its digest preserve independent source checking. The snapshot does not expose legible set numbers for all cards.

## Independent validation of existing mechanic mapping; new Noivern artwork precision

**Prior-art correction, 22:10 UTC:** [Agent 48's earlier source print map](agent48-rank28-photo-mechanical-print-map.json) had already identified the correct **Marshadow UNB81**, **Wobbuffet RC11**, **Kyurem SFA47**, **Budew Itchy Pollen**, and Noivern ex's **Covert Flight / Dominating Echo** attack variant. This reread independently corroborates those mechanisms, and more narrowly matches Noivern's photographed *full-art illustration* to **Paldea Evolved 246/193**, versus Agent48's representative same-mechanic `sv2-153`. That collector-art distinction does not by itself change attack or Ability behavior. The fresh quantitative [legacy print legality trap audit](../methodology/agent3-prebw-reprint-flag-printing-divergence-20261102.md) is a separate contribution. Do not treat the earlier mechanism attributions as newly discovered by this report.

[Agent 19's prior same-rank collision](agent19-rank28-replica-60-photo-transcription-20261030.md) demonstrates that a preliminary Swiss rank and final Top32 ranking are **not an authenticated identity join**. The self-reported rank28 match therefore remains insufficient for source admission.

## Artwork cross-checks against the supplied complete English card pool

These are **artwork-supported candidate printings**. The image-resolution limit still forbids asserting that a particular English product is the authentic Japanese tournament printing.

| Visual tile | Strong artwork match | Mechanically consequential printed text | Why a generic English name is unsafe |
| --- | --- | --- | --- |
| r1c7 (1) | **Noivern ex, Paldea Evolved 246/193**, database `sv2-246` | **Covert Flight** 70 prevents damage from Basic attackers during the opponent's next turn; **Dominating Echo** 140 prevents Special Energy and Stadium plays from hand next turn. | Other legal Noivern ex such as `sv8pt5-91` have **Strafe / Sonic Blast**, a materially different attack pair. Photograph's distinctive full-art pink/teal illustration matches `sv2-246`. |
| r2c6 (1) | **Marshadow, Unbroken Bonds 81**, `sm10-81` | **Resetting Hole**, a Bench-only Ability, discards a Stadium in play and Marshadow itself; **Red Knuckles** attack. | Many legal Marshadow printings have completely different functions; choosing by name can fabricate a Stadium answer. |
| r2c7 (1) | **Wobbuffet, Generations Radiant Collection RC11/RC32**, `g1-RC11` | **Bide Barricade** turns off Abilities of non-Psychic Pokémon in play, hand and discard while Wobbuffet is Active; **Psychic Assault** attack. | Multiple legal Wobbuffet printings have other attacks/Abilities. `xy4-36` has a similar Bide Barricade but a different illustration; the pastel indoor RC11 artwork matches the photo. |
| r1c8 (1) | **Kyurem, Shrouded Fable 47**, `sv6pt5-47` | **Trifrost** targets three opposing Pokémon for 110 each and discards all attached Energy; **Plasma Bane** modifies attack cost under its condition. | The many legal Kyurem cards do not share this payoff. Pictured icy dark-blue scene and attack labels correspond to this printing. |
| r2c5 (1) | **Budew** with Itchy Pollen, consistent with `sv8pt5-4`; exact art-number cross-check remains open. | Free-cost **Itchy Pollen** 10 also denies Item cards from hand on next opposing turn. | Avoid automatically selecting an older/different future Budew merely by name. |

**English card data checked locally:** the provided `card-list.zip` has `sv2-246` and `sv8pt5-91` with different named attack pairs; `g1-RC11`, `sm10-81`, `sv6pt5-47`, and `sv8pt5-4` have precisely the effects summarized above and database Expanded flag `Legal`. Database flags and artwork are **not** complete Japanese paper-tournament legality or original-print authentication.

### Why these identities matter to evaluation

- **Counterlock and prize route:** copied **Dominating Echo** or **Covert Flight** from Noivern ex is a different tactical capability from a hypothetical copied Strafe/Sonic Blast. A print-by-name substitution changes source decisions and the meaning of a simulated Regidrago Apex Dragon attack.
- **Active-position contention:** Wobbuffet's Bide Barricade affects non-Psychic Abilities only while **Active**, competing with a funded Regidrago VSTAR's need to attack from Active. It can also suppress the player's non-Psychic Basic support before a switch; do not award simultaneous Wobbuffet Active lock and Regidrago Active attack.
- **Stadium interaction:** Marshadow's Resetting Hole requires **Bench presence, live Ability and the Stadium action**. The Ability may be unavailable under opposing Basic Ability suppression; its use sacrifices Marshadow. A source-policy search graph must count a real Bench slot and these costs.
- **Trifrost accounting:** Kyurem's copied attack discards Energy from **the Pokémon actually using the copied attack**, so a Regidrago VSTAR copying it cannot be given a free three-target strike or a fictional Energy source. The three-target and recipient payment must appear in actual attack/prompt/zone receipts.
- **Unresolved Quick Ball print:** the pictured r3c3 Quick Ball resembles a modern print, but the image does not independently establish a set number. This matters: the supplied Expanded-legal `dp2-114` instructs revealing cards until a Pokémon is revealed, whereas `swsh8-237` **discards another card to search specifically for a Basic Pokémon**. Treat r3c3 as a printing-identity gap rather than silently picking an engine default.
- **First-turn access:** the candidate screenshot contains three Battle VIP Pass, one Battle Compressor, three VS Seeker. The visual distinction already recorded in the prior ledger remains important; do not reinterpret the single Compressor as a fourth VS Seeker.

## Source admission protocol and next discriminating evidence

The visually reconstructed exact counts remain in [the original 60-card transcription](agent3-rank28-replica-visual-sixty-20261102.md) and [tile JSON](agent3-rank28-replica-visual-60-v1.json). Preserve that source, the digest, and the match of rank/archetype in a *provisional* admission row. Require **one independent player-alias identity bridge** and a verified original printed-source manifest or registration code to promote to the 30th authenticated original. Reading tiny QR from a screenshot or mapping English set numbers solely by artwork is insufficient.

After source admission, actual owner-visible natural decisions, original card identities and playable paper timing, paid Trainers, copied attacks, opponent reply, and the 25-minute paper clock still independently gate whole-game qualification. **Zero games are competitively qualified and the 99.5% target is unproven.**