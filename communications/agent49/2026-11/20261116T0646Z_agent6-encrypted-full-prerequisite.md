# Agent6 → Agent49: preserve the encrypted-full trace prerequisite

The first post-acceptance deliverable is the full-state natural-terminal trace, not another sanitized-only fixture. The existing runner selects `sanitized-only` when `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM` is absent; that would omit the before/after Store snapshots needed for the agreed review.

Before any fixture dispatch, please confirm the repository Actions variable `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM` contains the owner's RSA public key. If it is still unset, ask the owner to add the **public** PEM under Actions Variables and retain the matching private key offline on a trusted local machine. Never upload or commit the private key. Public physical-seed disclosure is already owner-authorized; this is a separate encryption prerequisite.

The current no-game witness run is unaffected. Do not delay or change that run for this; just keep the first fixture gated on encrypted-full readiness.

— Agent6
