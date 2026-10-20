# Rank26 authentic second-VIP continuation after Squawk, development-only

**Agent 4 | 20 October 2026 | pre-outcome registration.** This study continues the existing source 83:B first-turn case. It is **retrospectively selected** and cannot be included as a competitive trial or a win-rate observation. The exact original 60-card rank26 Meloetta and rank6 Iron Thorns sources are unchanged.

## Frozen state and evidence parent

- Original physical source first-player seat: **B (1)**, original rank26 source opening **83:B**, seed **2614852201**, deriveSlotSeeds base **20261019 / pilot / rank26 / repeat 83**.
- Pinned Twinleaf: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; same `RANK26_PROPAGATION_PROFILE` and source controls in `simulation/twinleaf/rank26-vip-after-pass-source-pair.cjs`.
- Exact historical zero-attack sequence observed in [earlier compiled native source](rank26-vip-cologne-owner-followup-native.md): Battle VIP Pass genuinely searched Meloetta + Squawk, physically played Cologne, then Squawk and Seize resolved its **actual six-card draw** and the source played Exeggcute before **Pass**. The archived owner replacement hand contained **Battle VIP Pass FST**, **Battle Compressor PHF**, **Carmine TWM**, **Bicycle PLS**, **Redeemable Ticket JTG**, and **Exeggcute PLF**.
- Native source evidence is [manual CI 39416974107](https://github.com/FlareZ123/experiment-01/actions/runs/39416974107), artifact 12261544044. These are original selected seeds, not newly drawn independent games.

## Planned additional branch and falsification

Keep original control, first-VIP-only, first-VIP+Cologne, and first-VIP+Cologne+Squawk-choice paths unchanged. Add exactly one **optional**, development-only continuation: following the live Squawk draw and subsequent original-bot Pass, check the *detached acting player's* hand and public board for a second held Battle VIP Pass, occupied Meloetta and Squawkabilly slots, absent in-play Koko, at least one free Bench slot, legal first-turn phase, and no Item lock. If eligible, ask the genuine Store whether another VIP action is valid. Only **after** the actual owner-deck search begins may the bot inspect remaining physical Basic identities and prefer Tapu Koko Prism Star, with Exeggcute as available secondary target.

A positive narrow witness must have all of: accepted second VIP root, authentic owner-deck ChooseCardsPrompt, physical target selection through native `prompt.validate`, public Bench postcondition, and **two real first-turn VIP plays** in its source root trace. A missing Koko may reflect Prize or access state, not a failed experiment if the native owner prompt honestly reports it. The prefix preceding the formerly passed root must remain identical. Preserve every root attack and resulting opposing Prize change, including zero. Any lack of a settled prompt, unexpected name mapping, rejected Store action, hand change, or prefix divergence should remain an explicit negative finding.

The hook in `simulation/twinleaf/rank26-first-own-vip-after-pass.cjs` is reversible, opt-in (`followupSecondVip`), and limited to a source-owned first turn. Its predicate sees only an `actorObservation`, while the native State is used strictly for action legality/dispatch. A separate pure test changes hypothetical concealed opposing zones to check decision parity. No available full-game bot or Twinleaf paper clock is newly certified.

## Interpretation before observing the result

This tests a sequence-level flaw of the default one-action score optimizer. A drawn setup Item may be useful even after the source bot has found, Benched and used a draw Ability, yet its successor root can still become a Pass. A second VIP could find Tapu Koko while Cologne suppresses Active Iron Thorns for this turn; **that possibility alone does not prove Lightning in discard, Energy attachments, Crisis Punch, damage-pump self-KOs, or a completed source win**. One selected source branch cannot establish how frequently the line occurs in fresh deals.

Repository standing: **29/32 original source 60s; zero competitively qualified games; no validated fixed 60 at 99.5%**.
