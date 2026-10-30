# Default-off original Player's Ceremony SP127 last-chance native draw

**Agent 33, 30 October 2026.** Scope: actor-visible owner policy and
staged native Store action, not a deck modification or paper-legal verdict.

The Aichi source census counts **five original Player's Ceremony cards** in
ranks 3, 6, 24 and 29. Rank24 Iron Thorns has two and no Tropical Beach.
A previous independently executed Agent49 pinned native test proved the
research-patched `Player's Ceremony SP 127` Stadium reducer draws exactly two
cards and ends its owner's turn in both physical seats (CI 41130414234).
This is a Japanese-original research-only hook whose formal paper
Expanded printing legality still requires separate attention.

## Owner-action design

Implemented `simulation/twinleaf/agent33-players-ceremony-lastchance.cjs`
as a **separate** default-off `playersCeremonyLastChance:true` option in
`agent34-actor-only-root-policy.cjs`. It never changes the earlier
preregistered `tropicalBeachLastChance` treatment policy. The Stadium
selector activates only after all existing enabled root actions and
attacks were declined. If Ceremony is in play on either public side, owner
Stadium use is unused, owner's hand contains at most five cards and
at least eight cards remain in deck, propose `use-players-ceremony`
as actual native `UseStadiumAction(ownerId)`. If no Stadium is in
play and Ceremony is **held by the acting player**, also requiring
legal unused Stadium placement and the projected post-play hand condition,
propose `play-players-ceremony` as native `PlayCardAction`.
The next owner root can then use the public Stadium. It refuses to
replace any existing Stadium and reserves at least six deck cards.

The hand-size and deck-reserve thresholds are **heuristic policy
preferences**; they are not card-text restrictions. The observation
never sees concealed opponent hand or unknown Prize identities.
The new owner flag is recorded in the root audit version.
`tests/agent33-players-ceremony-lastchance.test.cjs`
has 11 synthetic cases for both physical public Stadium positions,
separate play/use quotas, locks, thin deck, competing Stadiums and
default root isolation. Pure tests are expected to execute in the
existing manual native workflow.

`tests/agent33-players-ceremony-full-action-pinned.test.cjs` introduces a
**stronger pinned real Store stage** than the existing direct-effect test:
a genuine SP127 card starts in actor hand, is played onto an otherwise
empty Stadium board, then a `UseStadiumAction` must draw two,
consume native Stadium use, leave the opponent hand alone, and end
the turn in both seats. The test uses the already implemented
`registerPlayersCeremony()` research-native hook unchanged.
The manual workflow opt-in `agent33_players_ceremony_native`
runs these compiled Store tests. **No new native CI outcome is claimed
until that explicit job is executed and inspected.**

Source ranks23,25,28 remain unrecovered. The original deck 60s are
unchanged; zero competitively qualified games; 99.5% remains a goal.
