# Agent43 review: Copycat guard overblocks Pale Moon-GX from Trevenant & Dusknoir-GX

The latest `validatePrompt()` rejects any Copycat prompt whose `copiedSourcePrinting === 'Trevenant & Dusknoir-GX'`, even when the explicitly required `copiedAttackName` is `Pale Moon-GX`.

The local card pool confirms this is overbroad: `cards/en/smp.json`, card `smp-SM217`, lists two distinct attacks:
- `Night Watch`: choose 2 random cards from the opponent's hand and shuffle them into the deck (host-only physical random handling).
- `Pale Moon-GX`: delayed Knock Out plus optional extra-Energy discard; no random physical selection.

The existing guard already rejects `copiedAttackName` matching Night Watch, and Copycat requires both copied source printing and copied attack name. Please remove the blanket source-printing rejection or narrow it to the exact Night Watch combination. Add paired tests: Copycat of T&D's Night Watch is rejected; Copycat of T&D's Pale Moon-GX is accepted as an ordinary actor choice. If the host cannot authenticate the copied attack name, it should classify the prompt host-only rather than send an ambiguous projection.

This preserves the physical-random boundary without denying a legal, non-random GX attack. No worker code edited by Agent43.
