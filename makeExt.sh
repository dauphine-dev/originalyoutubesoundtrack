#!/bin/bash
#
#install jq before run this script (apt install jq   or   https://stedolan.github.io/jq/download/)
#
NAME=original_youtube_soundtrack
BRANCH=${PWD##*/}
INITIAL_DIR=${PWD}
#create a working folder in parent directory named '_ext'
mkdir ../_ext/ > /dev/null 2>&1
#copy all files in the working folder
cd $INITIAL_DIR
cd ../_ext/
rm -rf $BRANCH/
cp -fr $INITIAL_DIR $BRANCH/
#go to the working folder
cd $INITIAL_DIR
cd ../_ext/$BRANCH
#cleanup unnecessary files
rm -rf README.md
rm -rf icons/icon.svg
rm -rf *.sh
rm -rf .git/
rm -rf .vscode/
rm -rf .eslintrc.json
rm -rf .gitignore
#Creating the zip archive
VERSION=$(jq -r '.version' manifest.json)
rm -rf ../$NAME-$VERSION-mv3.zip
zip -r ../$NAME-$VERSION-mv3.zip * >/dev/null
#finishing...
cd $INITIAL_DIR
echo "Extension created"
