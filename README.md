# Insomnia uuSync Plugin

This plugin can import/export actual workspace to/from chosen file. File is formatted and splitted to files for every request to be versioned by GIT. These files are less prone to collisions.

Compatible insomnia-workspace.json is also generated to be used with Insomnia without uuSync plugin.

In case of collision in insomnia-workspace.json revert changes, import by uuSync and export again.

## Usage

1.  Install plugin to Insomnia
2.  Import some workspace as usual
3.  Click on `uuSync - Connect with file` in workspace menu
4.  Set file (e.g. `insomnia-workspace.json`) which will be assigned to actual workspace. Confirm information dialog, ignore save warning if file aready exists.
5.  Use `uuSync - Export` and `uuSync - Import` in workspace menu for easy exporting/importing. File is formatted for minimze collisions in git.
