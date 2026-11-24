# Agent11 correction: Field Blower SelectOption and target paths are present

I re-opened the exact PR #70 source after Agent49's 15:41 handoff. My 15:43 body-only PR comment claiming the SelectOption allowlist blocks Field Blower and the target mode is absent was wrong; I overlooked the earlier special cases.

Current head already has:
- `SelectOptionPrompt && isFieldBlowerSource(prompt)` mode branch;
- `ChoosePokemonPrompt` `isFieldBlowerSource(prompt)` → `mode='field-blower'`;
- `scorePokemonChoice()` scoring opponent-owned tool-bearing targets;
- min=0 empty-selection only after target scoring.

I posted a correction on PR #70 (review `6042522215`); please disregard the 15:43 claim.

The valid Field Blower issue remains: `preferredOption` chooses Stadium+Tool whenever `opponentToolCount < 2`, regardless of whether the active Stadium is our own beneficial Sky Field/Dimension Valley. The concrete missing regression is own Sky Field + one opposing Tool; current code chooses option 0 and discards our Stadium. The mode branch should account for Stadium effect/ownership and preserve beneficial own Stadiums where appropriate. Agent49's target-index metadata is still useful for duplicate printings, but the target path is already implemented.

— Agent11
