"""Independent action-trace canonical encoding and integrity regressions."""
import copy
import unittest

from scripts.action_trace_integrity import action_trace_sha256, verify_action_trace


class ActionTraceIntegrityTests(unittest.TestCase):
    def test_reordered_keys_and_equivalent_unicode_escape_have_equal_hashes(self):
        first = [{"step": 0, "action": "draw", "payload": {"name": "Pokémon 🎴", "n": 1}},
                 {"step": 1, "action": "attack", "payload": {"damage": 30}}]
        second = [{"payload": {"n": 1, "name": "Pok\u00e9mon 🎴"}, "action": "draw", "step": 0},
                  {"action": "attack", "step": 1, "payload": {"damage": 30}}]
        self.assertEqual(action_trace_sha256(first), action_trace_sha256(second))
        self.assertTrue(verify_action_trace(second, action_trace_sha256(first)))

    def test_action_order_and_code_points_are_integrity_significant(self):
        first = [{"step": 0, "action": "draw"}, {"step": 1, "action": "attach"}]
        reordered = [{"step": 0, "action": "attach"}, {"step": 1, "action": "draw"}]
        self.assertNotEqual(action_trace_sha256(first), action_trace_sha256(reordered))
        self.assertNotEqual(action_trace_sha256([{"step": 0, "action": "draw", "name": "é"}]),
                            action_trace_sha256([{"step": 0, "action": "draw", "name": "e\u0301"}]))

    def test_rejects_invalid_envelopes_and_ambiguous_numbers(self):
        invalid = [
            None, [], {"step": 0, "action": "draw"}, [None],
            [{"step": 1, "action": "draw"}],
            [{"step": True, "action": "draw"}],
            [{"step": 0, "action": " "}],
            [{"step": 0, "action": "draw", "n": 1.0}],
            [{"step": 0, "action": "draw", "n": float("nan")}],
            [{"step": 0, "action": "draw", "n": 2**53}],
            [{"step": 0, "action": "draw", "n": -0.1}],
            [{"step": 0, "action": "draw", "unicode": chr(0xD800)}],
            [{"step": 0, "action": "draw", "object": {1: "nonstring-key"}}],
        ]
        for trace in invalid:
            with self.subTest(value=repr(trace)), self.assertRaises(ValueError):
                action_trace_sha256(trace)

    def test_action_name_whitespace_matches_node_portable_contract(self):
        for point in (0x85, 0x1c, 0x1f, 0x200a):
            with self.subTest(code_point=point), self.assertRaises(ValueError):
                action_trace_sha256([{"step": 0, "action": chr(point)}])
        self.assertEqual(
            action_trace_sha256([{"step": 0, "action": chr(0xfeff)}]),
            "77ce76ff5522a815d33f010fe07532de03c41966f2d18ede81a0ff825f30799f")

    def test_cyclic_python_value_is_rejected_as_malformed(self):
        event = {"step": 0, "action": "draw"}
        event["self"] = event
        with self.assertRaises(ValueError):
            action_trace_sha256([event])

    def test_changed_data_or_digest_fails(self):
        trace = [{"step": 0, "action": "attach", "card": "Basic Energy"}]
        digest = action_trace_sha256(trace)
        altered = copy.deepcopy(trace)
        altered[0]["card"] = "Special Energy"
        with self.assertRaisesRegex(ValueError, "match"):
            verify_action_trace(altered, digest)
        with self.assertRaisesRegex(ValueError, "match"):
            verify_action_trace(trace, "f" * 64)
        with self.assertRaisesRegex(ValueError, "SHA-256"):
            verify_action_trace(trace, digest.upper())


if __name__ == "__main__":
    unittest.main()
