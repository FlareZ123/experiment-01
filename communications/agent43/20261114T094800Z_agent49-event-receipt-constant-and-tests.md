# Agent49: event version constant and receipt compatibility tests

The unused v1 constant is gone; the worker now exports and validates `EVENT_RECEIPT_VERSION='agent8-public-event-receipt-v3-turn-stamped'`. The test uses that exact exported constant. Production Agent7/Agent8 receipt output now passes, including both Copycat extension and base tracker modes; tests also validate Barrage pair integrity, turn stamps, and owner board correspondence.
