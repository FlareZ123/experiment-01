# Agent 39: native original rank29 Peonia accepts paper-valid 1/2/3 Prize choices while its validator rejects 1/2

**1 November 2026 | Narrow original Store prepared-board regression, both real physical player seats. No naturally dealt 60-card game and no competitive match outcome.**

## Genuine source and engine provenance

The authenticated Aichi 2026 original [rank29 Kohei Hamamichi Iron Thorns 60](full-decklists.json) contains exactly **1 Peonia CRE149**, **2 Lusamine CIN96**, **1 Team Rocket's Handiwork FCO112** and **4 Crushing Hammer POR71**. All four printing identities appear in the provided complete card archive. Rank29 has **zero Gladion**. These are source cards that can form a Prize-rescue + no-Prize deck-out strategy if physically drawn and sequenced.

The supplied Advanced Player's Rulebook section D-05 says a Trainer-card effect selecting **up to N** ordinarily permits choosing **1 through N**, while section E-34 covers face-down Prizes. Printed Peonia says **up to three Prize cards**, then return one actual card from hand for each. It does not reveal all Prize identities before selecting.

Pinned Twinleaf submodule **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**:
- `ptcg-server/src/sets/09-sword-and-shield/set-chilling-reign/peonia.ts` creates a native `ChoosePrizePrompt` with `count=Math.min(3,prizesLeft)` and no override for allowing fewer.
- `ptcg-server/src/game/store/prompts/choose-prize-prompt.ts` sets `max=count` and `validate(result,state)` requires `result.length===count`.
- The original Store dispatch can, in the scenario below, settle the paper-valid shorter selection even when `prompt.validate` rejects it. The Store's acceptance should not be conflated with the native validator's certification.

## Six real native prompt chains

Source-printing fixture [`agent39-rank29-peonia-original-print-native.cjs`](../../simulation/twinleaf/agent39-rank29-peonia-original-print-native.cjs) stages owner Active Iron Thorns ex, the original rank29 Peonia and physical Lusamine in hand, physically distinct Crushing Hammer replacement cards, and a physically Prized original rank29 Team Rocket's Handiwork. It uses a **genuine pinned `Store.dispatch(PlayCardAction)`**, then actual returned native `ChoosePrizePrompt`, `ChooseCardsPrompt`, `OrderCardsPrompt` and `ResolvePromptAction`. Six independent fresh Store fixtures cover the paper-valid **1,2,3** choices in each actual owner seat 0 and 1.

| Physical source seat | Paper-valid Prize selections | Native `ChoosePrizePrompt.validate` | Original Store paper-valid physical chain |
| ---: | --- | --- | --- |
| 0 | **1** | **false** | **settled** |
| 0 | **2** | **false** | **settled** |
| 0 | **3** | true | settled |
| 1 | **1** | **false** | **settled** |
| 1 | **2** | **false** | **settled** |
| 1 | **3** | true | settled |

All six cases passed the intended dedicated step in [compiled original Store CI **41359104594**](https://github.com/FlareZ123/experiment-01/actions/runs/41359104594) at research SHA `442cad0c756c8703d6b5b991ad05a4b84e642011`. Each asserted that the true Prized Handiwork moved into the owner's hand, exactly that many original Crushing Hammer physical instances replaced the Prizes, all six Prize positions became occupied, Peonia moved to the real owner discard, and all three genuine prompts were closed. The **overall workflow was red** because the unrelated generic campaign runner treated the diagnostic input string as an unknown trial ID. The diagnostic step was **green**. That workflow routing error was corrected with a separate guard commit and the workflow re-dispatched; preserve the result distinction.

The fixtures use intentionally arranged initial Prize slots and source-printing-only synthetic support cards. They make **no claim** about naturally opening Peonia, its original opponent response, the ability to access core Prizes before an actual clock, a legal registered original sixty as a whole, or a candidate win.

## Release blocker and concrete next test

A blanket exact-count validation of every native `ChoosePrizePrompt` result would **falsely reject legal original rank29 Peonia** 1/2 choices. The same native validation is already known to miss actual Store violations in other original-source cards, so a release checker must use **effect-specific printed contracts**, while still checking prompt ownership, actual selected Prize slots, corresponding physical hand payment and full zone conservation. No global weakening to 'any list length' is justified.

Separately, the pinned generic `ChoosePrizePromptResolver` selects **the first three nonempty Prize positions** every time. Peonia fills the first empty positions with replacement cards. If no Prizes are taken or otherwise moved between Peonia visits, a repeated generic-bot Peonia will therefore revisit the **same first three positions** indefinitely, never exploring untouched positions 4–6. A human with two separate legal Peonia uses and enough replacement cards could deliberately select the complementary positions. This is an algorithmic source-policy limitation, distinct from the prompt validator defect. The conditional bound from [five source LO loops / Peonia Prize model](agent39-five-recursive-control-mill-source-matrix-20261101.md) assigns **84.3717%** first blind one-visit favorable deals/paths versus **97.6299%** *potentially accessible* in two complementary visits without earlier Prize movement; neither percentage is a gameplay win rate.

A next strong gate is source **rank29 actual registered 60**, genuine owner-legal Peonia after establishing K1, two turn-separated retrievals (using actual Lusamine if available), saved Prize-position knowledge limited to that owner, and a real opponent reply, both seats. It must record accepted/supporter spent/actual face-down-to-hand and actual physical Prizes, plus official paper-clock outcomes.

**Benchmark status unchanged: 29/32 authenticated original sixties, 0 competitive-qualified games, no demonstrated 99.5% fixed deck.**
