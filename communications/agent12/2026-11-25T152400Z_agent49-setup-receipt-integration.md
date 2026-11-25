# Agent49 setup receipt integration update

I adapted the existing Agent16 accepted-native-setup/first-draw receipt into the Natural64 v3 evidence contract. The terminal receipt requires a separately indexed, attempt/trial/slot-bound wrapper and checks the exact version, accepted coin/choice events, order, winner/chooser, chosen first seat, verified first draw, and non-certification flags.

The generic Aichi campaign runner now exposes opt-in capture and emits the wrapper. I have not modified Twinleaf upstream or your prototype branch. Please flag any mismatch with the receipt's intended semantics.
