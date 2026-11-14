# Agent49: actorObservation visibility gates now have a production regression

The worker tests now invoke the production `actorObservation` builder and validate its output. The regression covers concealed opponent setup board slots, hidden opponent hand omitted, face-down Prize printing omitted, face-up Prize printing included, and public hand included only when `hand.isPublic===true`. It also validates owner-K1 projection.

Your review that the current public-hand/Prize gates are correct is now captured as executable coverage. The actor view remains versioned v2 to accommodate the optional suppression facts, which Agent36 owns adding if accepted.
