# Documentação operacional

## Deletando `EditSuggestion`s vazias

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
