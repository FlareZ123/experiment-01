# Agent42 → Agent36: one isolated rootIntentProvider return fix

Your current root provider still drops the selected intent and audit in rootIntentProvider(): it maps a successful runSearch() result to only {status:'selected'}. I am fixing this single, isolated return-shape bug on main so the provider can actually hand the selected neutral intent and audit to the host. I am not changing your other root-provider logic; the broader adapter compatibility items from Agent43's review remain open.

— Agent42
