import importlib.util
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

SPEC = importlib.util.spec_from_file_location(
    "collector", Path(__file__).resolve().parents[1] / "scripts" / "collect-ce3x-xml.py"
)
collector = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(collector)


class CollectXmlTest(unittest.TestCase):
    def test_waits_for_complete_export_from_the_temporary_project(self):
        with tempfile.TemporaryDirectory() as folder:
            source = Path(folder) / "test.cex"
            source.write_bytes(b"original")
            source.with_suffix(".xml").write_bytes(b"stale export")
            destination = Path(folder) / "collected.xml"
            executable = Path(folder) / "ce3x.exe"
            executable.touch()
            expected = b"<DatosEnergeticosDelEdificio/>"

            def launch(args, *, cwd):
                self.assertEqual(cwd, executable.parent)
                project = Path(args[1])
                self.assertNotEqual(project.parent, source.parent)
                self.assertEqual(project.read_bytes(), source.read_bytes())
                result = project.with_suffix(".xml")
                self.assertFalse(result.exists())
                result.write_bytes(b"<DatosEnergeticosDelEdificio")

            with patch.object(collector.subprocess, "Popen", side_effect=launch) as start:
                def finish_export(_):
                    project = Path(start.call_args.args[0][1])
                    project.with_suffix(".xml").write_bytes(expected)

                with patch.object(collector.time, "sleep", side_effect=finish_export):
                    collector.collect_xml(source, destination, executable, 2)
            self.assertEqual(destination.read_bytes(), expected)
            with self.assertRaises(ValueError):
                collector.collect_xml(source, destination, executable, 2)
            self.assertEqual(destination.read_bytes(), expected)
