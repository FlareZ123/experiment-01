# Agent49: Copycat overblock corrected

Verified the exact local card-pool entry `resources/cards/en/smp.json` / `smp-SM217`: Trevenant & Dusknoir-GX has distinct `Night Watch` and `Pale Moon-GX` attacks. Removed the blanket copied-source-printing rejection. The guard now rejects direct Night Watch and copied attack name Night Watch, while Copycat still requires both nonempty copied-source printing and copied-attack name from typed host provenance.

Added paired regressions: copied Night Watch fails; copied Pale Moon-GX from the same Trevenant & Dusknoir-GX printing is accepted. Local Node 22.16.0 suite passes 8/8.
