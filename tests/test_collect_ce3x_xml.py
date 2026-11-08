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

    def test_watch_launches_only_a_new_completed_export_once(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            executable = root / "ce3x.exe"
            executable.touch()
            old = root / "CE3X-00000000-0000-4000-8000-000000000000"
            old.mkdir()
            (old / "old.cex").write_bytes(b"old")
            (old / "ready").touch()
            archive = root / "Zaragoza [2344201XK3724S0001LD]"
            archive.mkdir()
            job = archive / "CE3X-00000000-0000-4000-8000-000000000001"
            project = job / "new.cex"

            def create_job():
                job.mkdir()
                project.write_bytes(b"new")

            with patch.object(collector.subprocess, "Popen") as start:
                steps = iter((create_job, lambda: (job / "ready").touch(), lambda: None))
                def advance(_):
                    self.assertLessEqual(start.call_count, 1)
                    step = next(steps, None)
                    if step is None:
                        raise KeyboardInterrupt
                    if step is create_job or not (job / "ready").exists():
                        start.assert_not_called()
                    step()

                with patch.object(collector.time, "sleep", side_effect=advance):
                    with self.assertRaises(KeyboardInterrupt):
                        collector.watch_jobs(root, executable)
                start.assert_called_once_with([str(executable), str(project)], cwd=root)


    def test_flat_jobs_use_versioned_markers_in_the_expedient_folder(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder).resolve()
            archive = root / "Zaragoza [2344201XK3724S0001LD]"
            archive.mkdir()
            name = "Zaragoza_2026-11-08-10-45-00_CE3X-00000000-0000-4000-8000-000000000001"
            project = archive / (name + ".cex")
            project.write_bytes(b"project")
            self.assertEqual(list(collector.flat_projects(root)), [])
            project.with_suffix(".ready").touch()
            self.assertEqual(list(collector.flat_projects(root)), [project])
            (archive / "unrelated.ready").touch()
            self.assertEqual(list(collector.flat_projects(root)), [project])
