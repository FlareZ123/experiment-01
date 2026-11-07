# Issue25 phase-A blocker: Galarian Stunfisk Snap Trap is the leading source hypothesis

**Agent36 | 7 November 2026 | pinned Twinleaf phase-A diagnostic | no treatment comparison, no competitive qualification**

## Result

The owner-information quarantine correctly stopped one unsupported live prompt in the v10b phase-A diagnostic:

- GitHub Actions run: [42380667306](https://github.com/FlareZ123/experiment-01/actions/runs/42380667306)
- Artifact: `agent3-owner-information-fallback-diagnostic.zip`, artifact ID `13577796896`
- ZIP SHA-256: `90e78f37c3824628e4d57a58dfe2f86e326a265adc140beb6cb6bed7b69ee290`
- Inner JSON SHA-256: `4cab306039e572f17785e1b13c387292f9561526823ea3cc6909a5fd4ba38de8`
- Source v10b runner Git blob: `e4ea259dbfedc623b90c2f06321432368c89e8f5`
- Source v10b registration Git blob: `b92ca134da7abf90efd0c0f975f8a9a91f7943a8`
- Diagnostic status: `FALLBACK_CAPTURED`; one fallback call / one quarantine record across eight native attempts.

The blocked prompt was seat 0, turn 54, phase 3: `ChooseCardsPrompt`, `CHOOSE_CARD_TO_DISCARD`, minimum 1, maximum 1, `allowCancel=false`. The first blocked-prompt envelope contains the same shape and typed error `OWNER_INFORMATION_NATIVE_FALLBACK_QUARANTINED`.

The aborted row was trial `3:312:B:champion-reference`, with 249 accepted root actions before abort. Its physical source deal, full deal, accepted root ledger and first-turn provenance were verified. The phase-A run also had six terminal unqualified rows, one 260-root-capped unqualified row, and this one aborted row. The workflow's success means the diagnostic captured the blocker; it does not mean the eight trials were completed.

## Leading printed-source explanation

The public pre-dispatch board in the blocked-prompt envelope shows:

- Seat 0 Active: `Galarian Stunfisk SSH`, 10 damage.
- Seat 1 Active: `Marshadow UNB`, with eight attached Psychic Energy.
- Last accepted root action: seat 1 `AttackAction`, `Red Knuckles`, turn 54, action ordinal 247. The following accepted prompt action was a `WaitPrompt` acknowledgement.

The repository's English card pool gives `Galarian Stunfisk SSH` (`resources/cards/en/swsh1.json`, card `swsh1-132`) the Ability **Snap Trap**:

> If this Pokémon is in the Active Spot and is damaged by an opponent's attack (even if it is Knocked Out), discard an Energy from the Attacking Pokémon.

The same card pool gives `Marshadow UNB` (`resources/cards/en/sm10.json`, card `sm10-81`) **Red Knuckles**, whose only printed modifier is +60 damage when the opponent's Active Pokémon is an Ultra Beast. It has no discard instruction.

The board, timing, prompt cardinality, and Snap Trap text therefore make **Snap Trap triggered by Red Knuckles** the leading source hypothesis. The likely legal target zone is the attacking Marshadow's publicly attached Energy. The eight Psychic Energy shown on that Pokémon provide eligible physical targets.

This is a strong source hypothesis, not yet an exact source-to-prompt proof. The phase-A artifact did not record `prompt.sourceCard`, the identity of `prompt.cards` as a Store zone, or the exact attached-Energy CardList reference. Those fields must be captured before a new policy is admitted. Do not attribute the prompt to Red Knuckles itself.

## Why the message string is insufficient

Agent30's existing [Issue25 attack-prompt triage](agent30-issue25-attack-prompt-two-printing-namespace-triage-20261104.md) already documents two other distinct `CHOOSE_CARD_TO_DISCARD` sources:

| Printed source | Native target zone | Distinguishing semantics |
|---|---|---|
| Trevenant & Dusknoir-GX SMP, Night Watch | Opponent's concealed hand | Two random physical positions; identities remain hidden |
| Girafarig LOT, Get Lost | Opponent's public discard | Chosen public cards to the Lost Zone |
| Galarian Stunfisk SSH, Snap Trap (current hypothesis) | Attacking Pokémon's attached Energy | One publicly visible Energy from the attacker |

A message-only handler would conflate hidden-hand random selection, public discard selection, and public attached-Energy selection. It is not admissible.

## Required next diagnostic and owner-safe resolver

1. Add a read-only prompt-creation observer to the existing phase-A runner. For the blocked prompt, record only public provenance: `prompt.sourceCard?.fullName`, exact zone-reference matches against owner/opponent hand, discard, Active energies and Bench energies, `prompt.filter`, `isSecret`, min/max/cancel, both Active printings, and the immediately initiating AttackAction fingerprint. Never record concealed card identities.
2. Require the exact source `Galarian Stunfisk SSH / Snap Trap` and `prompt.cards === attacker.active.energies` (or the exact pinned equivalent established by the observer), with one mandatory selection. If either source or zone differs, leave the prompt unsupported and let the quarantine abort.
3. Construct a detached actor observation. `actorObservation` already exposes both players' face-up Pokémon and their attached Energy printings while excluding opponent hand identities, deck identities and Prize identities. Choose one eligible public physical Energy deterministically; the current example has eight identical Psychic Energy, so a position tie-break is adequate. Label this as a legal baseline, not an optimized discard policy.
4. Resolve to the exact physical object from the proven Energy CardList, require `prompt.validate([card])`, and dispatch a genuine `ResolvePromptAction`.
5. After native Store dispatch, re-read the current Store state (Store rollback can replace State/player objects). Verify the prompt settled, the selected physical Energy left the attacker's attached-Energy zone, and the same card entered the attacker's discard. Run both physical seats and negative controls for owner hand, opponent hand, public discard, unrelated attached-energy prompts, wrong printing, wrong count, and optional/cancellable prompts.
6. Keep the handler default-off and outside vendor code. Integrate only into a new versioned v10c runner/registration after the exact prompt zone and both-seat Store receipts pass. Preserve v10b and this phase-A failure as immutable provenance.

## Limits

- This is a phase-A diagnostic, not an A/B/A treatment result.
- The policy aborted one of eight native attempts. The other attempts were terminal or capped but all remain unqualified.
- No candidate win rate, matchup estimate, or paper-legality certification follows from this prompt diagnosis.
- The 99.5% Aichi Top 32 target remains unproven. No deck-list selection should change from this result alone.
