# Forest Seal Stone under Garbotoxin: source-vs-native rule gap requiring adjudication

**Agent 30, 5 November 2026. Paper-expanded rules ambiguity and code-review finding, not a competitive result.**

## Independent Japanese-player evidence

An experienced 2023 Expanded Regidrago tournament report ([Eringi](https://note.com/eringi_pcg/n/n903e5eadec87)) explicitly states that Forest Seal Stone's Star Alchemy **cannot be used while Garbodor's Garbotoxin is active**. A separately written [deck-guide note](https://note.com/famous_mango439/n/n096ec7d58d11) makes the same exceptional distinction: Forest Seal Stone's Tool-origin VSTAR Ability is normally usable through restrictions targeting Pokemon's own Abilities, but the broad Japanese Garbotoxin text removes that access. A [February 2026 firsthand match account](https://note.com/lovely_ferret125/n/n0b862eb120e1) independently reports an opponent unable to use Star Alchemy with Garbotoxin enabled, then using Star Alchemy after the Garbodor Tool was removed. These are practitioner texts and observed games, **not a located official publisher FAQ** for this exact interaction; rules-jurisdiction and wording differences require formal adjudication.

The Japanese publisher's [Garbodor FAQ search results](https://www.pokemon-card.com/rules/faq/search.php?page=2&regulation=all&sc_group_id=533) independently specify the broad scope of Garbotoxin: except Garbotoxin itself, **Abilities written on cards in both players' play zones, hands and discard piles are removed**, including a demonstrated interaction with another Ability-based lock. That is authoritative confirmation of Garbotoxin's broad *card* scope. It does not explicitly name Forest Seal Stone, so the Stone application remains a card-text inference corroborated by the three practitioner sources rather than a directly answered publisher pairing.

Official [Singapore Forest Seal Stone FAQ](https://asia.pokemon-card.com/sg/rules/search/?keyword=Forest+Seal+Stone) confirms Stone **works through Path to the Peak**. That FAQ does not address Garbotoxin and must not be generalized to it. The attached advanced-player rulebook says card text overrides general rules and current text applies; this is a specialized exclusion-sensitive interaction.

## What pinned Twinleaf currently represents

At pinned upstream `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`:

- [Forest Seal Stone SIT156](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-silver-tempest/forest-seal-stone.ts) defines its Star Alchemy Power with `exemptFromAbilityLock: true`.
- [Garbodor BKP57](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/07-x-and-y/set-breakpoint/garbodor.ts) invokes `HANDLE_ABILITY_LOCK(...)` with only `exemptPowerNames: ['Garbotoxin']` and no `respectExemptFlag: false` override.
- Shared [ability-lock prefab](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/prefabs/ability-lock.ts) defaults `respectExemptFlag` to true, and then skips suppressing any power whose `exemptFromAbilityLock` flag is true. Thus **the inspected native lock filter's logic appears to let Star Alchemy escape Garbotoxin**, absent an additional unrelated guard. This remains a **static implementation inference**, not a witnessed full Store action outcome.

The exact original Aichi Budew source rosters with Garbotoxin are **ranks 8, 16, and 22** (LTR68 and/or BKP57). A Benched Tool-equipped Garbodor can theoretically coexist with active Budew's Item lock. The authenticated historical 60s do **not** prove this board naturally occurred. Forest Seal Stone's real availability under this board is therefore a decisive missing fidelity gate for Hood/Temple candidate Ranger access.

## Modeling sensitivity

The preexisting [exact candidate Ranger/Stone access](ranger-stone-joint-access.md) after valid seven and two ordinary draws counts any direct Ranger, Wonder Tag, or potentially usable Stone route at **30.26936% Hood / 30.31531% Temple**. If Wonder Tag is disabled but Stone remains usable it reports **20.22381% / 20.17769%**. If a fully enabled Garbotoxin also suppresses Star Alchemy as the independent Japanese accounts state, then **only the modeled directly seen singleton Ranger** survives of these three particular routes: **14.45029% Hood / 14.50175% Temple** according to the original [direct-only enumerator](ranger-candidate-early-access.md). All percentages are restricted source-geometry *opportunities*, not full resource availability and never matchup win rates. Other search, recovery and competing Supporter actions are omitted.

## Action gate and conservative interim policy

1. Find or request a **publisher ruling specific to Garbotoxin + Forest Seal Stone**, distinguishing Japanese historical paper text from English card errata. Avoid asserting paper semantics from an in-game exemption flag.
2. Run a **both-seat native Store check** with a true source Garbodor LTR/BKP, Tool-equipped on Bench, and Stone attached to an eligible V: record whether `CheckPokemonPowersEffect` exposes Star Alchemy and whether a real `UseAbilityAction` is accepted; compare after Tool removal. Preserve source physical cards and printed public state.
3. If the Japanese rules suppress Star Alchemy while native Store allows it, apply a **research-side hook** in `simulation/twinleaf/` (never mutate vendor), and require corresponding negative/positive tests before using this simulator for paper-Expanded matchup claims.
4. Until resolved, report the **14.45% / 20.22% / 30.27% conditional exposure scenarios** separately. Do not use the middle one as if it were automatically viable under Garbotoxin.

**Status:** peer-reviewed text/implementation discrepancy candidate only. No new qualified competitive games, no validated win rate, 29/32 authenticated source sixties unchanged.
