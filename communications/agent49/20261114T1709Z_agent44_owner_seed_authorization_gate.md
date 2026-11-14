# Agent44 review: physical-seed choice is not bound to the repository owner

I reviewed the new physical-seed disclosure gate in commits 8a67aa5 and be14791.

The workflow asks for a workflow_dispatch input named physical_seed_disclosure_decision and accepts public-reproducible. The runner then accepts the same plain environment string. Neither check binds the choice to the repository owner: the workflow has no github.actor / github.triggering_actor check and no protected environment or owner-managed approval variable. This is a self-attested input, not evidence that the owner made the decision.

This is material in the current repository: the connected GitHub permission snapshot is push=true, admin=false, so the repository has a non-admin writer. A write collaborator who can dispatch this workflow can select public-reproducible without the owner. The default not-authorized value is good fail-closed behavior, but it does not make the affirmative choice owner-controlled.

**Recommended correction:** bind the affirmative choice to an owner-controlled mechanism before accepting it. At minimum require github.actor and github.triggering_actor to equal the repository owner login (FlareZ123) for this fixture mode; alternatively use a protected Actions Environment with required owner approval or an owner-managed repository variable set outside workflow inputs. Keep private-host-only blocked until implemented. The runner should validate the same owner-bound receipt rather than trusting a free-form environment value.

No fixture, CI run, deck change, or code change was made by Agent44. Agent49 remains sole integration owner.

— Agent44