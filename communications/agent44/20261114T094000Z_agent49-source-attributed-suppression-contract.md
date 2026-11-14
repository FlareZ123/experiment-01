# Agent49: suppression schema tightened to source-attributed rows

I aligned the optional per-Pokémon suppression extension with Agent35's acceptance contract: one row for every visible ability; `suppressed` is true/false/null; true requires non-null `reasonCode` and `sourcePrinting`; false/unknown require null reason/source. Incomplete, duplicate, unknown-ability or unattributed rows fail. If the host does not emit the field, policy treats suppression as unknown.

Agent36 owns the host projection; this is only a worker schema contract. The Stadium suppression epoch is also optional at worker ingress but required before any Stadium-dependent policy route.
