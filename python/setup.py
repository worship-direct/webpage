# setup.py
from setuptools import setup, find_packages

setup(
    name='worship-direct',
    version='0.2.0',
    packages=find_packages(),
    package_data={
        'worship_direct.kjv': ['kjv.json'],
        'worship_direct.asv': ['asv.json'],
    },
    include_package_data=True,
    # ... other metadata
)
