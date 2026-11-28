# Aichi rank-18 Regidrago: an executable source-bound policy prototype for a distinct turbo configuration

**Agent 2, 2026-11-28, 13:46 UTC.** Exact-original-field opponent research, not deck selection, native Store evidence, a game, a matchup or a 99.5% win-rate claim.

## Why this decision changes

Aichi rank 18 was listed among the missing *opponent-policy* implementations even though its exact 60 is authenticated. Reusing rank27 blindly is incorrect: rank18 carries **four Battle VIP Pass, three Sky Field, one Squawkabilly ex, one Hisuian Goodra VSTAR, one Mega Kangaskhan ex, and two Hisuian Heavy Ball**, without rank27's **Battle Compressor, Crispin, Noivern ex or Net Ball**. Opening, ability, donor, Bench, search, and discard decisions therefore differ structurally. This supplies a source-bound **developmental opponent policy** for previously unsupported rank18. It does not replace an independently reviewed/admitted policy.

## Reproducible source identity

Exact inventory: `results/aichi-2026/full-decklists.json`, Git blob `ae773f6201d7aa69d31914dbfee66f3fba692200`, rank 18, **60 cards in 33 rows**, source URL in that ledger. The worker embeds every printing and count; it fails initialization unless role=opponent, correct 0/1 seat, policy version and exact rank/source SHA. Pinned native numberless name+set labels are accepted only if collision-free within the rank18 original, and arbitrary incorrect explicit collector numbers are not stripped.

File: `simulation/evaluation/2026-11/agent2-rank18-regidrago-opponent-policy.cjs` created [6e50594](https://github.com/FlareZ123/experiment-01/commit/6e505941c7e3326b6a20f7075272b614ebc64386), bounded correction [53981dd](https://github.com/FlareZ123/experiment-01/commit/53981dd7f90846f0f2920431b0fdf8f62a9cf61c), strict abstention codebook [8862c66](https://github.com/FlareZ123/experiment-01/commit/8862c668b38f59d09143a8e0343057d52f3fe203).

## Material decision paths

- **VIP first-turn acceleration:** if the original source VIP is actually offered by the host's playable frontier, prioritize a pair of Basic setup Pokémon; prefer Regidrago V, then Budew, and decline invalid Stage 1/2 deck choices. The model is conditional on actual action legality; it never assumes the attack or Item is playable simply because its name exists.
- **Sky Field / Roadblock:** account for eight Bench slots under Sky Field, five normally, and four under observable opposing Sudowoodo GRI66 Roadblock. Play a Stadium replacement of Temple of Sinnoh when it concretely unblocks an already-funded active Apex Dragon, rather than incorrectly crediting suppressed Double Dragon colored units.
- **Distinct payload:** include Hisuian Goodra VSTAR Rolling Iron (Dragon) as a real Apex donor in discard; exclude Mega Kangaskhan ex Rapid-Fire Combo (Colorless, not a Dragon donor), even though Mega Kangaskhan is a Basic with Run Errand and has a three-Prize liability.
- **Other actual cards:** Squawk and Seize confirmation conditional on early turn/hand; Quick Ball Basic-only search, Mysterious Treasure Psychic/Dragon, Ultra Ball all Pokémon, hand-discard preferences favor donor Dragons and preserve ACE SPEC / currently needed Double Dragon; rank18 source-only cards score independently. Fallback to rank27 and rank10 functions only for shared source cards; rank18-only choices are not falsely inferred from rank10 inventory.
- **Strict output:** all action/prompt responses use the genuine host-supplied opaque tokens; no fabrication of target tokens. Unsupported prompt/source/zone/config paths abstain using the exact registered `agent49-policy-protocol.cjs` reason codebook, not private `R18_*` strings.

## Tests and evidence classification

Added `tests/2026-11/agent2-rank18-regidrago-opponent-policy.test.cjs`, commit [4f1d850](https://github.com/FlareZ123/experiment-01/commit/4f1d850b112b92ca93fd9c76ebde32721a4bdc2c). Executed the actual GitHub CommonJS worker, rank27 shared policy, rank10 base, Apex helper, Phantom Dive helper and strict protocol in a V8 in-process harness, replacing only the Node test/assert test entry points. **15/15 test groups passed, 94 assertions**, with both physical seats represented. Included exact source identity/config, VIP/Quick Ball/Mysterious Treasure and Heavy Ball selection, Sky Field/Roadblock constraints, Temple unlock, Goodra donor, Squawk confirmation, protected hand discards, protocol-validated choices and negative forged source/seat tests.

This is **synthetic actor-observation and protocol-level evidence only**. The runner has not been asked to play a card, dispatch native Twinleaf, compile a pinned Store, run an uninterrupted game, compare candidate policies, or change the owner's gated fixture. There is no policy competence certificate or qualified Aichi matchup yet. In particular: native prompt provenance for each source, mandatory KO/Prize continuation, attacker payment, whole-game sequencing, Stage-A policy and opponent independent assessment remain unresolved.

## Next useful step

An independent engine/policy reviewer should bind this worker to original rank18 installed physical 60, reproduce its first **actual offered** VIP/Quick Ball/Squawk/Goodra prompt in pinned Twinleaf on a separately authorized **no-game** witness, and catalogue the first false abstention or unsafe action. Do not add another workflow or broad synthetic suite as a substitute for the owner's existing no-game run/review queue. Do not count this as another canonical admitted or competent opponent until source-to-native mapping and full-game actor decisions are audited. The 32-rank field still has 29 published inventories, ranks 23/25/28 absent; **0/32 qualified games and no fixed final 60**.
