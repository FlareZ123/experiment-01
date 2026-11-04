# Three Japanese promotional Trainer identities among Aichi original-source corpus gaps

**Agent 41 | 4 November 2026.** Verified official Japanese card identity and printed effect, independently cross-checked to original 29-source name/count gaps. This is an independent official-text concordance to prior Agent15/20/33/42/49 native promo research; no competitive game was tested by this contribution.

## Full primary-source identity reconciliation

Agent3's [29-original source print-gap census](../methodology/agent3-original-29-source-printed-corpus-ten-gap-20261104.md) finds 134 physical source copies unmatched in the local English corpus: 120 across seven MEE Basic Energy printing labels and **14 across three Japanese promotional Trainer identities**. The exact rank/copy pairs below match [Agent3's machine census](../aichi-2026/agent3-original29-printing-gap-20261104.json). Corresponding machine-readable [source-to-official identity and semantics registry](agent41-jp-exclusive-top32-promo-print-effects-20261104.json) preserves the distinction between source alias, actual promo mark and rule.

| Original source alias | Official Japanese card and exact effect | Source ranks | Primary evidence |
| --- | --- | --- | --- |
| **Palace Belt BWP153** | **殿堂ベルト**, **153 / BW-P**, Japanese card ID **28213**, **Pokémon Tool**. When its holder is Active, the owner's beginning-of-turn standard draw count becomes **two cards**. Passive Active-specific turn-start draw replacement. | rank6 **1**, rank29 **2**; total **3** | [Official card](https://www.pokemon-card.com/card-search/details.php/card/28213/regu/all) |
| **Palace Book SMP/NAN25** | **殿堂の書**, official mark **SM-P** with **no numeric collector number displayed**, Japanese card ID **34382**, **Item**. Playing it **draws three cards and ends that player's turn**. | rank6 **1**, rank7 **3**, rank24 **2**; total **6** | [Official card](https://www.pokemon-card.com/card-search/details.php/card/34382/regu/all), [provider index](https://limitlesstcg.com/cards/jp/SMP/NAN25?translate=en) |
| **Player's Ceremony SP127** | **プレイヤーズセレモニー**, **127 / S-P**, Japanese card ID **38633**, **Stadium**. Once during each player's own turn, that player may **draw two cards and end their turn** while the Stadium is in play. | rank3 **1**, rank6 **1**, rank24 **2**, rank29 **1**; total **5** | [Official card](https://www.pokemon-card.com/card-search/details.php/card/38633/regu/XY) |

Exact audited total **3 + 6 + 5 = 14** original physical copies. These are original **name/count** concordances; the missing English records have not appeared and physical Japanese source printings are never relabeled as international.

## Decisive implementation distinctions

- **`NAN25` is a synthetic provider index.** Official Pokémon lists Palace Book under the unnumbered SM-P designation; [Limitless](https://limitlesstcg.com/cards/jp/SMP/NAN25?translate=en) and [Prism](https://prismtcg.app/set/JPSMP?uiLang=en) call it NAN25. Preserve that exact original source alias for traceability and the **official card ID 34382** independently. Inventing a numbered 25/SM-P physical printing would be wrong.
- **Palace Belt is a Tool.** Pokémon's official header says `ポケモンのどうぐ`; the old source also includes generic Goods footer text. The supplied **Advanced Player's Rulebook v3.4, B-02** expressly treats older printed Pokémon Tools as Tools even if the earlier text mentions Item. Its effect operates automatically when attached to the Active, at turn-start draw; it is affected by Tool suppression/removal rather than ordinary Item card-play freedom.
- **Palace Book and Player's Ceremony must end turns.** A native proxy that just adds three Item draws or two repeatable Stadium draws creates illegal subsequent plays/attacks. Palace Book consumes an Item and is subject to Item lock; Player's Ceremony is an optionally activated shared Stadium effect with a separate once-per-player-turn limit. Source player and opponent can each use the Stadium on their own turn.
- **Japanese Expanded scope.** The [official Japanese Expanded regulation](https://www.pokemon-card.com/rules/regulation/) was updated **19 February 2026**, sets **Black & White onward**, and its published banned-card list does not name any of these three. The known original May 10 2026 ranked lists include them; [Limitless](https://limitlesstcg.com/cards/jp/SMP/NAN25?translate=en) explicitly distinguishes `Expanded (JP): legal` from `Expanded: not legal` for Palace Book. Strong historical prima facie Japanese-card validity remains subject to full event rules; do **not** silently admit JP-only promos into international Expanded or treat original source provenance as a game-effect simulator certificate.

## Native testing gates suggested

The repository already contains controlled real-Store tests for these three effects, as detailed in the correction below. The full original-60 native integration should additionally verify exact source attribution, own/public zone control and both-seat symmetry:

1. Palace Belt adds the start-draw card only while its holder is in the Active Spot; suppress when an applicable Tool-effect lock applies.
2. Palace Book can be played when its Item is legal, draws three and immediately ends its player's turn. Check Item-lock negative case and reject same-turn follow-up actions.
3. Player's Ceremony once-per-own-turn optional draw two immediately ends the turn, is available to both players, and remains constrained by Stadium existence and per-turn usage.
4. Audit actual **live Store** transitions and paper correctness. Detached Simulator acceptance, native green CI, prompt counters and proxy draw effects alone are insufficient.
5. Preserve the three original name/count entries and case-specific `sourceSet/sourceNumber`; implement research hooks outside the vendor submodule. Tests must remain developmental until an independent all-policy qualification audit.

## Correction: existing prior native implementations and tests

Agent15 and Agent42 already indexed these 14 Japanese-only source copies and the unnumbered SM-P identity; see `simulation/twinleaf/planning/owner-japanese-only-promo-source-metadata.cjs` and `tests/agent15-japanese-only-promo-metadata.test.cjs`. The contribution here is an independently verified official-page crosswalk and original-rank consolidation. The three promo identities themselves were previously known.

Critically, the pinned native engine already has Palace Book SMP and Palace Belt BWP. `tests/palace_promos_store.test.cjs` already exercises real Store Palace Book turn-end and Vileplume Item lock, Palace Belt Active-versus-Bench turn draw and Jamming Tower suppression, and Stadium Player's Ceremony shared turns. Agent20 also stages Palace Book for both seats in `tests/agent20-palace-book-turnend-native.test.cjs`.

Player's Ceremony SP127 has an existing research-only, opt-in native card in `simulation/twinleaf/card-patches.cjs`, registered by `simulation/twinleaf/resolve-field.cjs` when `allowJapanesePromoHooks` is enabled, with real Store tests `tests/agent33-players-ceremony-full-action-pinned.test.cjs` and `tests/agent49-native-players-ceremony-store.test.cjs`. These controlled tests do not establish a paper-correct full-game policy or 32-field match qualification.

The missing local **English source-corpus printing** is distinct from missing native game support. Reuse these tests rather than duplicate them. The remaining integration challenge is to verify the full original 60-card deck in live, competitively competent bilateral games with exact printed-source and action-provenance custody.

**Status:** Source coverage **29/32** (missing 23,25,28); **0 paper-competitively qualified games**, **no selected fixed best 60** and **no demonstrated 99.5% result**.
