# Native Battle Compressor choice and genuine owner-deck prompt enable Perfection donors

**Agent 32, 19 October 2026 UTC.** Scope: paper Expanded tactical
development and a narrow executable pinned-Twinleaf interaction.
These prepared native states are **not** Aichi source-dealt games, full
games or evidence of competitive win probability.

## Why this matters

The canonical hard-rank bilateral New Moon development games were capped
with **zero candidate attack declarations** in both the rank-6 and rank-11
New Moon candidate arms, and the rank-11 New Moon actor had Gengar &
Mimikyu-GX still stranded in its own deck. The existing shared common
resource-policy wrapper handles Field Blower, Forest Seal Stone and Star
Alchemy, but has not incorporated a guaranteed proactive attack-donor
placement step. See
[`agent10-active-bilateral-v2-integration-state-20261019.md`]
(../aichi-2026/agent10-active-bilateral-v2-integration-state-20261019.md)
for the exact unqualified historical four-arm comparison.

An already present research-owned
[`new-moon-compressor-payload-policy.cjs`]
(../../simulation/twinleaf/new-moon-compressor-payload-policy.cjs)
exposes `withNewMoonCompressorPayload(options)`: an Item tactic and
prompt resolver selecting target GX cards from **the actor's own deck
only after the engine has produced a real ChooseCardsPrompt**.
The predicate depends on public Active position and the actor's own
hand/discard/Bench, not opponent hidden hand/deck or unsearched own
deck card identities. Full policy safety still requires additional audit.

## Native Store proof, original configuration

[`newmoon-compressor-owner-prompt-native.cjs`]
(../../simulation/twinleaf/newmoon-compressor-owner-prompt-native.cjs)
constructs a synthetic, reproducible pinned Store with
`Mewtwo & Mew-GX UNM` Active,
`Battle Compressor PHF` held,
`Gengar & Mimikyu-GX TEU` and
`Trevenant & Dusknoir-GX SMP` in owner deck.
It invokes an actual
`SimpleTacticsAi.decodeNextAction` with the opt-in extra tactic,
dispatches the selected **native PlayCardAction**, and resolves
the resulting actual native **ChooseCardsPrompt** via a bot-selected
**ResolvePromptAction**.

The native Store observes the Item in the player's `supporter` staging
zone during its pending prompt, then accepts selecting the two
owner-deck donors and moves them into discard. The downstream
[`ownerVisibleCopyOptions`]
(../../simulation/twinleaf/owner-visible-perfection-pass-bridge.cjs)
offers Horror House-GX and Poltergeist from the Gengar, and
Night Watch from the Trevenant, as potential Perfection actions.

**Compiled pin:** `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
**Verified manual GitHub Actions:
[39333598305](https://github.com/FlareZ123/experiment-01/actions/runs/39333598305)
(SUCCESS)**, head
`2fb8f98865df5a3a2d6c0b5083973e55c7435377`.
The test printed `owner-visible-compressor-genuine-prompt-v1` with
`actualPromptClass:"ChooseCardsPrompt"`,
`promptSelectedPrintings` exactly Gengar TEU and Trevenant SMP,
`discardContainsBothPerfectionDonors:true`,
and owner-deck count 3 to 1. No actual copied AttackAction,
opponent response, normal tournament opening, final Prizes or victory
was evaluated in this fixture.

## Corrected held-Gengar decision

The originally archived pure `shouldSeekPayload` predicate declined
Battle Compressor merely if **Gengar was in the owner's hand**.
The printed Perfection Ability allows copies from owner's **Bench or
discard pile**, excluding hand. The held Gengar should therefore
not terminate the proactive Item opportunity when a relevant GX donor
could remain in the unsearched deck. Added
`player.cannotPlayItemCards !== true` to avoid proposing an Item
under an observable Item-lock flag. Both changes preserve the
owner-information boundary: only an owner-deck **size**, not an
unsearched deck's identities, is inspected before the Item.

Code revision
`31327f8a8ef3287016a8ff73881e2da07e26e5cf`; new pure
regressions at `tests/new-moon-compressor-payload-policy.test.cjs`,
revision `c389cc9334273aba2e4d17c4744bb5771d039286`.
The existing manual-only cheap workflow ran all rank-6 and New Moon
pure regressions at
[GitHub Actions 39334009702](https://github.com/FlareZ123/experiment-01/actions/runs/39334009702)
(**SUCCESS**, head `9b9c5c68db9115da6f76904d6c0b0f11f55cd812`).

A second native state test, also located in the executable above,
now intentionally holds the Gengar in its owner's hand and leaves
Trevenant in the deck. The expected legal sequence is
Compressor Item play, genuine own-deck prompt, Trevenant chosen,
Gengar remains held, Night Watch becomes available, Gengar's
other attacks remain unavailable for copying. Evidence for that
additional native case should be attached only after a compiled
CI run has verified it.

## Existing source-dealt negative control that constrains this finding

The prior
[Agent35 all-twelve source-deal study]
(agent35-rank11-compressor-partition-recovery.md)
already compared this original **Active-Mewtwo-only** Compressor
tactic against an unchanged-policy control in twelve fixed
rank-11 New Moon versus Absol/Garbodor paired physical deals.
All 24 Store arms completed execution or reached their action caps,
but **no Battle Compressor PlayCardAction occurred in any arm**.
Across 60 within-game early owner-turn snapshots, Mewtwo was
Active in 13 and Compressor held in five, with **zero
overlapping opportunities**. The 12 paired arms therefore
recorded identical action/terminal observations.

This constrains interpretation: the new native prepared-state
success proves an implementation path works *when its narrow
preconditions occur*. It does not refute the source-dealt
**zero-opportunity** result. The new held-Gengar rule correction
and Item-lock guard alone do not solve absent co-occurrence of
Active Mewtwo and held Compressor. To affect a real source
game, a future explicitly versioned policy might prepare
donors before Mewtwo moves Active, using only the owner's
public/own Pokémon in play, or improve Mewtwo positioning.
Test such a changed predicate and the downstream copy/attack
on actual source-dealt identical inventory/seed controls before
considering it an improvement.

## Integration / qualification gate

To meaningfully test tactical impact, enable the exact same generic
proactive owner-information-safe tactic in the shared canonical
candidate policy for **both candidate lists** when the card exists
in the player's hand. Avoid branching on candidate label, opponent
rank or a preknown deck location. The existing custom
`SimpleTacticsAi` factory consumes a `SimpleBotOptions` object;
further integration would need to hook actual match bot construction
and record each acting player's owner-visible opportunity and
accepted prompt. The first on-source-dealt case should show
Gengar or Trevenant in discard and an actual Store-accepted
Perfection choice, followed by a consequential opponent response.

This work does not by itself prove hidden-information-safe generic
Twinleaf decisions, printed paper rule equivalence, a tournament
clock model, or any win-rate improvement. `qualifiedForCompetitiveInference:false`.
Aichi exact published 60s remain **29/32** and qualified games
remain **zero**.
