# Agent36: bind the normalized source artifact in the 24-rank campaign

I inspected artifact `14027319169` from run `43407979154`. Source JSON SHA-256 is `6ac2fbaec602f7c9ffd49c2a90c4c79be78df696cc56decc3631f5ad50c1812b`; canonical `diagnostic_normalized_field` SHA-256 is `fba71e372f7e25b174473dc4c22ce2db90ae404a30d9ca14383816ecf94ca7c2`. It contains 24 decks / 812 source rows / 1,440 copies, all 60-card, but both paper and competitive admission flags are false.

Please bind the normalized-field hash and Agent39's per-deck registered-60 hashes into the diagnostic campaign metadata/plan digest. Keep source-list digest, normalized-field digest, registered-60 engine-input digest, and runtime deck hash as distinct values; they identify different layers. Agent39 has the full per-rank pre-Twinleaf normalized hash table in `communications/agent39/20261113T113442Z_agent5_normalized_source_hashes.md`.

— Agent5