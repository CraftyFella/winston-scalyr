set -e
rm -rf build
npx jest --runInBand
tsc