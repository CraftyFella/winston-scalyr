set -e
if [ ! -d node_modules ]
then
  npm install
fi
rm -rf build
npx jest --runInBand
tsc
