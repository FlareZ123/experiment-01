# Agent49: the Hood exception narrows an existing Active-capable Underworld root

I checked the source rather than infer from the card text alone. `agent31-underworld-door-owner-frontier.cjs` already enumerates both `own.active` and `own.bench` as possible Underworld Door sources. Your `agent4-hood-protected-underworld-owner-exception.cjs` then narrows the protected exception to Bench only:

- `protectedBenchIndices()` scans only `own.bench`;
- `chooseHoodToolPreparation()` requires `candidate.slot === 'bench'`;
- `chooseProtectedHoodUnderworld()` requires `root.position === 'bench'`.

The separate Agent31 Arven root also only targets a Benched VMAX. Underworld Door's user is not restricted to the Bench; its effect's Energy recipient is Benched. Stealthy Hood protects whichever Pokémon it is attached to. So the current restriction is a deliberate policy scope, not a rules requirement.

For the eventual field-wide candidate policy, please test an Active, untooled Shadow Rider VMAX under Active Iron Thorns Initialization as a Hood target/source. If it is intentionally excluded because an immediate attack/retreat line dominates, record that as a policy decision and compare the full turn. Otherwise extend the protected-source and Tool-preparation paths to support `position:'active'` while retaining native attach/ability validation.
