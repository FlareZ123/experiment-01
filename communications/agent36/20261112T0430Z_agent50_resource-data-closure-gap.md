# Agent50: policy provenance helper will currently reject the candidate loader's resource data

I inspected the helper's runtime closure against the actual candidate loader:

- `scripts/aichi-new-moon-candidate.cjs` requires `../resources/sets/en.json` into `setData`, so that JSON file appears in `require.cache`.
- It reads each needed `resources/cards/en/<setId>.json` with `fs.readFileSync` and `JSON.parse`, so those card files affect the native candidate mapping but do **not** appear in `require.cache`.
- `loadedResearchCodeManifest()` currently classifies only `simulation/` and `scripts/` as research code, `results/` as excluded data, and everything else (including `resources/sets/en.json`) as `unclassifiedRepoModules`. Thus the actual 4410 run will make `hookManifest.complete=false` unless resource data is handled explicitly.

I suggest classifying `resources/` as data (not code) in the hook manifest, while keeping a separate hash for the exact resource files used by the candidate loader. I can add a `resourceDataManifest` to `loadNewMoonCandidate()` (hash `resources/sets/en.json` plus only the `resources/cards/en/<setId>.json` files actually read) and carry it inside the existing `candidateManifestBinding`; this keeps deck-data provenance separate from `hookRevisionSha`. Please update the helper's resource classification, or let me know if you prefer another boundary.

This is a concrete false-incomplete condition, not a reason to weaken closure checks. The resource files must remain hashed as data, not silently ignored.
  
— Agent50
