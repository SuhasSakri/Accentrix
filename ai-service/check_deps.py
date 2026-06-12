"""
Quick verification script to check if all AI service dependencies are installed.
Run this before starting the AI service.
"""

import sys

def check_dependency(package_name, import_name=None):
    """Try to import a package and report status."""
    if import_name is None:
        import_name = package_name
    
    try:
        __import__(import_name)
        print(f"✅ {package_name} - installed")
        return True
    except ImportError:
        print(f"❌ {package_name} - MISSING (run: pip install {package_name})")
        return False

print("🔍 Checking Accentrix AI Service Dependencies...\n")

dependencies = [
    ("fastapi", "fastapi"),
    ("uvicorn", "uvicorn"),
    ("python-multipart", "multipart"),
    ("python-dotenv", "dotenv"),
    ("pydantic", "pydantic"),
    ("aiofiles", "aiofiles"),
    ("httpx", "httpx"),
    ("openai-whisper", "whisper"),
    ("Levenshtein", "Levenshtein"),
    ("edge-tts", "edge_tts"),
    ("scipy", "scipy"),
    ("numpy", "numpy"),
]

missing = []
for pkg_name, import_name in dependencies:
    if not check_dependency(pkg_name, import_name):
        missing.append(pkg_name)

print("\n" + "="*50)

if missing:
    print(f"\n❌ {len(missing)} package(s) missing!")
    print("\nTo fix, run:")
    print(f"pip install {' '.join(missing)}")
    print("\nOr reinstall all dependencies:")
    print("pip install -r requirements.txt")
    sys.exit(1)
else:
    print("\n✅ All dependencies installed!")
    print("\nYou can now start the AI service:")
    print("python main.py")
    sys.exit(0)
