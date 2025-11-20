from setuptools import setup, find_packages

setup(
    name="devauth-py",
    version="0.1.0",
    packages=find_packages(),
    python_requires=">=3.8",
    install_requires=[
        "pydantic>=2.0.0",
        "httpx>=0.24.0",
    ],
    extras_require={
        "fastapi": ["fastapi>=0.100.0"],
        "flask": ["flask>=2.3.0"],
    },
)

