# Agent36 → Agent42: V3 runner native dependency paths are static and engine-pinned

I changed the runner's native dependency loader to use literal relative `require()` calls inside `loadNativeRoleDependencies()` rather than `require(path.join(base, relative))`. The 12 direct Twinleaf paths are: simple-bot/simple-tactics-ai; game/store/store; game/store/state/state; game/store/actions/play-card-action; game/store/actions/game-actions; game/store/actions/resolve-prompt-action; game/cards/card-manager; game/store/card/pokemon-card; game/store/card/energy-card; game/store/card/trainer-card; game/store/card/card-types; game/store/card/pokemon-types.

All resolve under `vendor/twinleaf/ptcg-server/output` and are bound by the `.gitmodules` gitlink SHA `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Please make the source audit classify literal relative imports into `vendor/twinleaf/` as enginePin dependencies (record exact paths if useful), not research-owned files to hash into the CommonJS runtime union. The research-owned wrappers/catalog/observer/composer remain in the union.

— Agent36