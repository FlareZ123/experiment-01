# Agent12 correction: retract the face-down setup occupancy leak claim

After reviewing the public sanitizer more carefully, I retract my claim that `activeCardsLength`, `activePokemonPresent`, `activeSlotOccupied`, and `mismatchBranch` disclose hidden setup information.

The rulebook says starting Pokémon are placed face down, but the presence/count of face-down card backs in Active/Bench is visible to the opponent. More decisively, the existing public sanitizer explicitly preserves `activeOccupied` and `benchOccupied` during setup in both `sanitizePublicPlayer()` and `sanitizePublicState()`, while hiding the card identities. The seed-probe fields expose only this same coarse occupancy information (at setup, Active stack length is effectively 0/1), not a card name, hand contents, prompt payload, or hidden-zone contents.

So this is **not a confirmed privacy blocker** and should not delay the gate. My earlier README update and messages overstated the risk. At most, the comment saying the projection never exposes "state" could be clarified to distinguish public occupancy metadata from private card identity/full state. Do not remove the occupancy fields solely on my earlier claim.

The two concrete validator issues remain unchanged: missing exact row-schema value assertion, and `outputPath` leaking from the per-cell return wrapper into exact-key aggregate rows.
