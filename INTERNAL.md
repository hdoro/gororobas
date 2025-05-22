# Internal docs on operations and navigating the codebase

## Deleting empty `EditSuggestion`s

```edgeql
select EditSuggestion {id, diff} filter count(json_array_unpack(.diff)) = 0
```

## Restaurando backups

A partir do backup baixado no S3:

1. Instale o GPG:
   - Windows: `winget install GnuPG.GnuPG`
   - MacOS: `brew install gpg`
   - Linux: `sudo apt-get install gpg`
1. Decodifique a encriptação do backup com: `gpg --decrypt --output decrypted_backup.dump.gz input_file.dump.gpg `
   - A chave de encriptação é a mesma que foi usada para criar o backup
1. Descompacte o backup: `gunzip decrypted_backup.dump.gz`
1. Restaure o backup: `gel restore decrypted_backup.dump` localmente, ou `gel restore -I ORG/INSTANCE_NAME decrypted_backup.dump` na nuvem

## On internationalization and translations

We're experimenting with [Inlang](https://inlang.com). It's still nascent and has some buggy behavior, but it does help with a good workflow for translating strings and doesn't require us to have different translation calls depending on where we're in the code (components, API routes and admin scripts all call the same compiled functions).

That said, we need to document the **quirks we're facing** for our future usage:

- If using VSCode, use [Sherlock](https://inlang.com/m/r7kp499g/app-inlang-ideExtension), their translation tool, as that'll surface translations' result inline and allow for editing translations easily
- Sherlock doesn't play well with editing translations directly in the .json files. I assume its source of truth is an internal DB and it doesn't pick up on the changes, overwriting them when the editor is called
- When editing selectors in Sherlock, always delete and re-add some keys in the editor as sometimes it doesn't save the state of the editor and breaks the translation
- You can check how we're doing gender and
- We expect to have to refactor translations in the future. Henrique, who set it up, was doing app i18n for the first time. We're especially worried about message duplication, cryptic message names
- When rendering JSX fragments in the middle of the translation, use `ReplaceI18nFragments`
- Sometimes Sherlock throws your work out with no explanation. Make recurring, small commits.
- Be especially careful when running machine-translate. I have no clue how to even start debugging that.
- **When adding translations to constants** that aren't initialized inside a function (such as routes or components), AKA module-level variables, make sure to put the messages inside `get` object properties. This way, the i18n function will run every time you require the variable, which makes it dynamic to the currently-set locale.
  - For Next route metadata, we can use `generateMetadata` instead of the static `metadata`, at which point we get this for free
  - Perhaps there could be a custom ESLint rule for this? Not sure the level of effort involved.

Henrique's note (2025-05): As I write these, I realize how frought this solution is. Open to alternatives!
