set -e
if [ ! -d node_modules ]
then
  yarn
fi
rm -rf build
npx jest --runInBand
tsc
