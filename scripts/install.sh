#! /usr/bin/env bash

INSTALL_EXEC="/usr/local/bin/git-peek"

PROJECT_PATH=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; cd ../ ; pwd -P )


if [ -f $INSTALL_EXEC ]
then
  echo "Already installed."
else
  yarn build
  SCRIPT="#! /usr/bin/env bash\nnode ${PROJECT_PATH}/dist/main.js \$@"
  echo -e $SCRIPT > $INSTALL_EXEC
  chmod +x $INSTALL_EXEC
  echo "Installation done!"
fi