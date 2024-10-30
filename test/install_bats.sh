#!/bin/bash
git -c advice.detachedHead=false clone --depth 1 --branch v1.11.0 https://github.com/bats-core/bats-core.git test/bats
git -c advice.detachedHead=false clone --depth 1 --branch v2.1.0 https://github.com/bats-core/bats-assert.git test/test_helper/bats-assert
git -c advice.detachedHead=false clone --depth 1 --branch v0.3.0 https://github.com/bats-core/bats-support.git test/test_helper/bats-support
git -c advice.detachedHead=false clone --depth 1 --branch v0.4.0 https://github.com/bats-core/bats-file.git test/test_helper/bats-file
