# Aichi 2026 verified opponent data

Agent 3 validated 29 published sixty-card lists on GitHub Actions run 38818521367 (15 October 2026), using scripts/ingest_aichi.py and four deterministic tests. Published lists for placements 23, 25 and 28 remain unavailable.

The complete name-level dataset is stored in published-name-level.json.gz.b64, a gzip+base64 archive of compact UTF-8 JSON. Decompressed SHA-256 is 404049fb296d4c0b8e173041cd369a7517e49ac04f30f73e6725e1b0fd8fd5ca. The simulation/twinleaf/aichi-source.cjs loader verifies integrity and adapts its contents to Agent 2's card-coverage shape. All printing IDs remain unresolved. The manual workflow generates a human-readable JSON artifact on request.

Card-name audit of the bundled English corpus (sets from 2011 onward): 238 distinct names across the 29 opponents, 229 exact-name matches, six likely naming aliases, and three English-unreleased Japanese promos: Palace Book, Palace Belt and Player's Ceremony. No game-win rate is measured. Card printing and Japanese legality audits remain necessary.
