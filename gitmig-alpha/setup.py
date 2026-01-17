from setuptools import setup

setup(
    name="gitmig",
    version="1.0.0",
    py_modules=["gitmig", "gitmig_config"],
    entry_points={
        "console_scripts": [
            "gitmig=gitmig:main",
        ],
    },
    python_requires=">=3.6",
    author="qtremors",
    description="A lightweight tool to copy git repositories without dependencies.",
)
