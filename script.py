from folder_structure import FolderStructureGenerator

# List of folders to be ignored in the folder structure generation
folders_to_ignore = [
    "__pycache__",
    ".git",
    ".idea",
    "venv",
"ProgBattleFrontend/.next", "ProgBattleFrontend/node_modules", "ProgbattleBackend/.progback", "ProgbattleBackend/__pycache__", "ProgbattleBackend/submissions", "ProgbattleBackend/logs", ".progback", "submissions", "logs", "tests", "test_results", "test_data", "test_output", "test_logs", "test_coverage", "test_reports", "test_artifacts", "test_temp", "test_cache", "test_envs", ".pytest_cache", ".tox", ".coverage", ".mypy_cache", ".ruff_cache", ".flake8_cache", "docker_temp", "node_modules", "dist", "build", "coverage", "docs", "doc", "documentation", "static", "media", "assets", "public", "private", "temp", "tmp", "cache", ".cache", ".temp", ".tmp", ".env", ".venv", ".virtualenvs", ".virtualenv", ".pytest_cache", ".tox_cache", ".mypy_cache", ".ruff_cache", ".flake8_cache", ".next"
]

# Generate the markdown representation of the folder structure
folder_structure_generator = FolderStructureGenerator(ignored_folders=folders_to_ignore)
folder_structure_md = folder_structure_generator.generate_folder_structure_md()

# Print the markdown representation of the folder structure
print(folder_structure_md)
