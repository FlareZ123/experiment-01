"""Pure regression tests and live-file audit for canonical dispatch preflight."""
from __future__ import annotations

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from check_canonical_dispatch import check_canonical_file, check_dispatch_contract  # noqa: E402


def fixture(
    n: int = 25, *, trigger: str = "workflow_dispatch",
    input_override: str = "", job_ref: str = ""
) -> str:
    declarations = "".join(
        f"      option_{i}:\n        type: boolean\n        default: false\n"
        for i in range(n)
    ) + input_override
    refs = " ".join("$" + "{{ inputs.option_" + str(i) + " }}" for i in range(n))
    return (
        f"on:\n  {trigger}:\n    inputs:\n{declarations}"
        "jobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n"
        f"      - run: 'echo {refs} {job_ref}'\n"
    )


class CanonicalDispatchContractTests(unittest.TestCase):
    def test_actual_canonical_workflow(self) -> None:
        root = Path(__file__).resolve().parents[1]
        result = check_canonical_file(root)
        self.assertEqual(result["dispatch_input_count"], 25)

    def test_25_manual_inputs_pass(self) -> None:
        result = check_dispatch_contract(fixture())
        self.assertTrue(result["all_inputs_referenced"])
        self.assertEqual(result["inputs_referenced"], 25)

    def test_26th_input_fails(self) -> None:
        with self.assertRaisesRegex(ValueError, "26 dispatch inputs exceeds 25"):
            check_dispatch_contract(fixture(26))

    def test_per_commit_trigger_fails(self) -> None:
        with self.assertRaisesRegex(ValueError, "manual-only"):
            check_dispatch_contract(fixture(trigger="push"))

    def test_unreferenced_input_fails(self) -> None:
        ghost = "      ghost:\n        type: boolean\n        default: false\n"
        with self.assertRaisesRegex(ValueError, "unused="):
            check_dispatch_contract(fixture(24, input_override=ghost))

    def test_undeclared_reference_fails(self) -> None:
        with self.assertRaisesRegex(ValueError, "undeclared="):
            check_dispatch_contract(fixture(job_ref="$" + "{{ inputs.typo }}"))

    def test_duplicate_mapping_key_fails(self) -> None:
        duplicate = "      option_0:\n        type: boolean\n        default: false\n"
        with self.assertRaisesRegex(ValueError, "Duplicate YAML mapping key"):
            check_dispatch_contract(fixture(input_override=duplicate))

    def test_yaml_on_is_not_coerced_to_boolean(self) -> None:
        self.assertEqual(check_dispatch_contract(fixture())["events"], ["workflow_dispatch"])


if __name__ == "__main__":
    unittest.main()
