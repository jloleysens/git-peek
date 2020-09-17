#! /usr/bin/env bash

INSTALL_EXEC="/usr/local/bin/git-peek"

SCRIPTPATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"

if [ -L $INSTALL_EXEC ]
then
  echo "Already installed."
else
  yarn build
  ln -s "$SCRIPTPATH/run.sh" $INSTALL_EXEC
  chmod +x "$SCRIPTPATH/run.sh"
  echo "Installation done!"
fi