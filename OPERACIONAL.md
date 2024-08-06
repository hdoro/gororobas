# Documentação operacional

## Deletando `EditSuggestion`s vazias

```edgeql
select EditSuggestion {id, diff} filter count(json_array_unpack(.diff)) = 0
```
