from setuptools import setup, find_packages

setup(
    name='kjv',
    version='0.1.0',
    packages=find_packages(),
    package_data={'kjv': ['kjv.json']},
    include_package_data=True,
    description='KJV Bible access via attribute lookup',
    author='Your Name',
    install_requires=[],
    python_requires='>=3.6',
)p
