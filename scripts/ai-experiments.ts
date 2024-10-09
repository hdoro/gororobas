/**
 * Experimento de usar IA pra classificar notas. Aprendizados:
 *
 * - Nenhum modelo pequeno de ollama (llama 3.1, gemma 2, mistral) conseguiu dar conta
 * - OpenAI e Anthropic parecem ter performance muito parecida.
 *    - Anthropic Haiku é mais barato e funcionou num teste simples, mas precisa de mais test cases.
 * - Essas APIs oferecem desconto de prompt caching, que é automático. Ainda assim, talvez tenha como colocar os vegetais como um contexto mais perene e que custe mais barato?
 * - SDK da Vercel é bem bacaninha e dá pra usar schemas zod, que funcionam bem.
 *   - Mas, de novo, não funcionam pra ollama direito
 *   - Não faço ideia de como enviam o schema na prompt, não achei jeito de investigar a prompt final enviada.
 * - Abaixo tem PROMPT_1, que fiz primeiro da minha cabeça, e PROMPT_2 que foi revisada com IA
 *   - A PROMPT_1 tem um "FORMATO ESPERADO" que pode tirar no uso do zod schema
 *
 * CONCLUSÃO: preciso maturar isso um pouco mais, até lá posso ir taggeando as notas manualmente
 */

import { generateObject } from 'ai'
import { z } from 'zod'
import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'

// import ollama from 'ollama' // Usando ollama direto
import { ollama } from 'ollama-ai-provider' // Usando ollama via Vercel AI SDK

import { createClient } from 'edgedb'
const client = createClient({
  // Note: when developing locally you will need to set tls security to
  // insecure, because the development server uses self-signed certificates
  // which will cause api calls with the fetch api to fail.
  tlsSecurity: process.env.NODE_ENV === 'development' ? 'insecure' : 'default',
})

const VEGETABLES = await client.query<
  {
    id: string
    nome_comum: string
    nomes_alternativos: string[]
    nomes_cientificos: string[]
  }[]
>(`
select Vegetable {
  id,
  nome_comum := .names[0],
  nomes_alternativos := .names[1:],
  nomes_cientificos := .scientific_names,
  handle,
}`)

const NOTE =
  'Colocar tapioca granulada (bijú) no meio do chocolate quente dá bom demais!'

const PROMPT_1 = `
  Em formato JSON, liste apenas os **vegetais contidos, direta ou indiretamente, na nota abaixo**. Fatores a se considerar:
  
  - Vegetais podem aparecer como ingredientes processados, como a maizena, que é derivada do milho.
  - Podem aparecer com diversos nomes e regionalismos, como "aipim" e "macaxeira" para a mandioca. \`nomes_alternativos\` são providenciados no banco de dados.
  - Podem aparecer com nomes científicos, como "Ananas comosus" para o abacaxi. \`nomes_cientificos\` são providenciados no banco de dados.
  - Podem não ser citados diretamente, mas aparecerem como ingredientes de 2ª ou 3ª ordem. Por exemplo, o macarrão pode ser feito de trigo, arroz e outros; quando não especificado, considerar o mais comum, neste caso o trigo.
  - **Retorne apenas os vegetais que atendam aos requisitos acima.**
  - Na resposta, inclua apenas seus nomes principais (\`nome_comum\`), segundo provido no banco de dados (vide cabeçalho "VEGETAIS NO BANCO DE DADOS").
  - Se não houver nenhum vegetal na nota, ou se nenhum dos vegetais da nota estão presentes no banco de dados, retorne uma lista vazia.
  
  ## NOTA A SER ANALISADA

  "${NOTE}"

  ## VEGETAIS NO BANCO DE DADOS

  \`\`\`json
  ${JSON.stringify(VEGETABLES, null, 2)}
  \`\`\`

  ## FORMATO ESPERADO

  Um JSON contendo um array de objetos com apenas o \`id\` e o \`nome_comum\` do(s) vegetal(is) contidos na nota:

  \`\`\`ts
  type ReturnType = {
    id: string
    nome_comum: string
  }[]
  \`\`\`
  `

const PROMPT_2 = `
  **Tarefa**: Identificar vegetais contidos direta ou indiretamente em uma nota e listá-los em formato JSON.

### Passos a seguir:

1. **Identificação de Vegetais**:
   - **Diretos**: Vegetais mencionados explicitamente.
   - **Indiretos**: Ingredientes processados derivados de vegetais (ex: maizena do milho).
   - **Nomes Alternativos**: Considere nomes regionais e científicos.

2. **Exemplos de Identificação**:
   - **Direto**: "Cenoura" em "cozinhei cenoura com batata"; "Banana" em "duas bananas caturras amassadas"; "mamão" em "adoro suco de papaia"
   - **Indireto**: "Mandioca" em "tapioca granulada"; "milho" em "maizena"; "cacau" em "chocolate"; "trigo" em macarrão

3. **Formato de Saída**:
   - Retorne um JSON com \`id\` e \`nome_comum\` dos vegetais.
   - **Exemplo**:
     \`\`\`json
     [
       {
         "id": "a5b277a6-e7e1-4f31-842a-6ebe22694592",
         "nome_comum": "Mandioca"
       }
     ]
     \`\`\`

4. **Verificação**:
   - Revise se todos os vegetais possíveis foram considerados.
   - Verifique se o formato de saída está correto.

### Nota a ser analisada:

"${NOTE}"

### Vegetais no Banco de Dados:
${JSON.stringify(VEGETABLES)}

### Instruções Finais:
-  Se nenhum vegetal for encontrado, retorne um array vazio \`[]\`.
-  Certifique-se de que o formato JSON está correto antes de responder.
  `

const SCHEMA = z.object({
  id: z.string().describe('O `id` do vegetal no banco de dados'),
  nome_comum: z.string().describe('O nome mais comum do vegetal'),
})

// Ollama puro é péssimo, o schema raramente é respeitado
// const response = await ollama.generate({
//   model: 'llama3.1',
//   prompt: PROMPT,
//   format: 'json',
// })

const result = await generateObject({
  // model: ollama('gemma2:2b'), // péssimo
  // model: ollama('mistral'), // péssimo
  // model: ollama('llama3.1'), // errático, só funciona as vezes
  // model: openai('gpt-4o'), // 100%
  // model: anthropic('claude-3-sonnet-20240229'), // 100%
  model: anthropic('claude-3-haiku-20240307'), // deu certo nos testes, mas chutaria que vai falhar em alguns
  prompt: PROMPT_2,
  schema: SCHEMA,
  schemaDescription:
    'Lista de vegetais contidos na nota, apenas com seu `id` e `nome_comum`',
})

console.log(result.object)
