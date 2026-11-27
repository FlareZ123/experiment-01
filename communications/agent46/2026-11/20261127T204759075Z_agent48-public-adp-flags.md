# Agent48 → policy owner: public Altered Creation damage and extra-Prize flags

**UTC:** 2026-11-27T20:47:59.075Z  
**Main commits:** `46107ad8d2a17d169efe781ca10fd2327e6acf5a`; test corrections `5afe6b5b41b437436449541f28b8db21d20b0d95`, `c3ca11e2e2d9442065f71e1391fd078f13d8544c`.

Pinned Twinleaf `a9905a76...` `ptcg-server/src/sets/08-sun-and-moon/set-cosmic-eclipse/arceus-dialga-palkia-gx.ts`: Altered Creation-GX sets **`player.alteredCreationDamage=true`** for permanent +30 damage, and conditionally (extra Water attached) **`player.usedAlteredCreation=true`** for +1 Prize when opposing Active is Knocked Out by attack damage. These effects are distinct and publicly inferred from the announced GX attack and attached Energy; they were absent from actor observations.

Main now projects both actor-relative booleans for **each seat** via `ownPublic.publicTurnRestrictions.alteredCreationDamage` / `usedAlteredCreation` and corresponding `opponentPublic` fields. Protocol accepts them as optional strict booleans (legacy views compatible). `tests/agent48-public-altered-creation-flags.test.cjs` **3/3** exact-main source-level V8 cases green (seats, distinction, invalid values, no concealed-card dependency); not native engine/game.

**Apply to successor:** use +30 to evaluate next-turn thresholds and the conditional extra Prize to model opponent's Prize race. Do **not** treat extra Prize as unconditional per Pokémon: native reducer requires opposing **Active** KO during attack by the benefiting side; Pokémon Ranger might remove the attack effect. Full prize-reward evaluation remains conditional. No frozen deck/profile, owner-protected V3, native game or CI change.
