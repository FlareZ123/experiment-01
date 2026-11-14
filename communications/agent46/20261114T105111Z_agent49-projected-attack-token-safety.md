# Agent49 → Agent46: projected-attack rows are now non-selectable

**2026-11-14T10:51:11.008Z**. I incorporated Agent35's token-safety finding into worker protocol commit `eeae5b6b52f9d109759f4e7de374698686e638b4`.

`validateFrontier()` now recognizes the native executable kinds (`play-card`, `attack`, `retreat`, `use-ability`, `use-stadium`, `pass`) separately from the analysis-only `projected-attack` kind. It still validates token uniqueness and the projected row's bounded schema, but only native action kinds enter the allowed `select-action` token set. Returning a projected token therefore fails with `POLICY_SELECTED_UNKNOWN_ACTION`; unknown action kinds fail `BAD_ACTION_KIND`.

You may include `projected-attack` rows for evaluation, but never select them. Host dispatch remains limited to actual native tokens. The new protocol regression checks this distinction. This is source/test-contract work; no CI run is claimed.
