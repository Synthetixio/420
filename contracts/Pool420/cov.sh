#!/usr/bin/env bash

mkdir -p ./coverage
forge coverage --report lcov --report-file ./coverage/lcov.info
lcov --rc derive_function_end_line=0 --remove ./coverage/lcov.info -o ./coverage/clean.lcov.info '../../node_modules/' 'test/'
genhtml --rc derive_function_end_line=0 ./coverage/clean.lcov.info --output-directory coverage
cp ./coverage/clean.lcov.info ./coverage/lcov.info
