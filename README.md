# Banco de Dados Não Relacional (MongoDB) Baseado Em Um Sistema De Hotel RetroFuturista

Nova York, "Era Atômica": um arranhá-céu de 1957 que saiu do futuro. Os quartos se chamam Cabine Sputnik e Suíte Presidente Foguete, o café da manhã é num diner espacial e o robô mordomo está em manutenção. O tema é só ambientação; os dados são todos fictícios.

## Conteúdo do repositório

| Caminho | O que é |
|---|---|
| `data/*.json` | Um JSON por coleção, em Extended JSON (datas como `{"$date": ...}`), prontos para importar no Compass |
| `scripts/01_criar_colecoes_e_inserir.js` | Cria as 8 coleções com validação, insere todos os documentos e cria os índices |
| `scripts/02_consultas.js` | As 13 consultas do desafio |
| `docs/exemplos-de-documentos.md` | Um documento de exemplo de cada coleção |
| `docs/resultados.md` | Cada consulta com o resultado esperado |

## Como rodar

Precisa do MongoDB em `localhost:27017` e do mongosh (ele já vem embutido no Compass, na aba `_MONGOSH` no rodapé).

```bash
mongosh "mongodb://localhost:27017" scripts/01_criar_colecoes_e_inserir.js
mongosh "mongodb://localhost:27017" scripts/02_consultas.js
```

Pelo Compass, existem dois caminhos:

1. Abrir a aba `_MONGOSH`, colar o conteúdo do script 01 e dar Enter. Depois repetir com o script 02.
2. Criar o banco `hotel_nebula`, criar uma coleção com o nome de cada arquivo e usar **Add Data → Import JSON or CSV file**. Nesse caminho não são criados os validadores nem os índices.

O script 01 pode ser rodado várias vezes: ele apaga e recria as coleções.

## Modelagem

### Coleções

| Coleção | Docs | Papel |
|---|---|---|
| `hospedes` | 14 | Cadastro de clientes |
| `quartos` | 10 | Catálogo de quartos e suas características |
| `reservas` | 33 | Intenção de se hospedar (período, canal, valor previsto) |
| `hospedagens` | 27 | A estadia que de fato aconteceu, com os serviços consumidos |
| `pagamentos` | 40 | Cobranças ligadas a uma hospedagem |
| `servicos` | 9 | Catálogo de serviços do hotel |
| `feedbacks` | 20 | Avaliações dos hóspedes |
| `funcionarios` | 6 | Equipe que faz check-in e check-out |

### O que fica embutido e o que fica por referência

A regra usada: **embute-se o que nasce, é lido e morre junto com o documento pai; referencia-se o que tem vida própria ou cresce sem limite.**

**Embutido**

- `hospedagens.servicos_consumidos` (array de objetos). Os consumos só existem dentro de uma hospedagem e quase sempre são lidos junto com ela (conta final, extrato). Embutir evita um `$lookup` a cada leitura e permite gravar tudo de uma vez. No modelo relacional isso era uma tabela separada (`hospedagem_servicos`).
- `hospedagens.totais` (objeto com diárias, serviços e total geral): dados derivados que sempre andam com a hospedagem.
- `hospedes.contato`, `hospedes.endereco`, `hospedes.documento`, `hospedes.programa_fidelidade`: grupos de campos que fazem sentido juntos. Aqui o aninhamento serve para organizar.
- `quartos.dimensoes` (com um array `camas`) e `quartos.historico_manutencao` (array de objetos).
- `reservas.periodo` (check-in, check-out, noites) e `reservas.acompanhantes`: os acompanhantes só têm sentido dentro da reserva.
- `pagamentos.detalhes`: o conteúdo muda conforme o método (cartão tem bandeira e parcelas, Pix tem banco). É a flexibilidade de esquema do MongoDB sendo usada de verdade.
- `feedbacks.notas` (objeto com limpeza, atendimento, conforto e custo-benefício).

**Referenciado (guardando só o id)**

- `reservas.hospede_id` e `reservas.quarto_id`: um hóspede acumula reservas ao longo dos anos (crescimento sem limite) e um quarto é usado por muitas reservas. Embutir duplicaria dados e deixaria atualização difícil.
- `hospedagens.reserva_id`, `hospede_id` e `quarto_id`: a hospedagem nasce de uma reserva. Repetir `hospede_id` e `quarto_id` aqui (desnormalização leve) deixa muitas consultas sem `$lookup`.
- `hospedagens.funcionario_checkin_id` e `funcionario_checkout_id`: funcionários são uma entidade independente.
- `pagamentos.hospedagem_id`: uma hospedagem pode ter vários pagamentos (diárias no cartão, serviços no Pix, estorno), então não cabe embutir.
- `feedbacks.hospede_id`, `hospedagem_id` e `quarto_id`.

**Cópia deliberada (snapshot)**

Dentro de `servicos_consumidos` guardamos `nome`, `valor_unitario` e `valor_total` além do `servico_id`. Se o preço do serviço mudar amanhã, o extrato antigo continua mostrando o que foi cobrado na época. A contrapartida é que o nome pode ficar defasado se o serviço for renomeado.

### Arrays e dados aninhados

- Arrays de textos: `quartos.caracteristicas` (`["vista_mar", "banheira", "luxo"]`), `hospedes.preferencias`, `servicos.tags`, `feedbacks.tags`, `reservas.pedidos_especiais`, `funcionarios.turnos`. Consultas como `find({ caracteristicas: "banheira" })` funcionam direto nesses arrays, e o índice em `caracteristicas` é multikey.
- Arrays de objetos: `hospedagens.servicos_consumidos`, `reservas.acompanhantes`, `quartos.dimensoes.camas`, `quartos.historico_manutencao`.
- Objetos dentro de objetos: `quartos.dimensoes.camas[].tipo`, `servicos.horario_funcionamento.inicio`.

### Tipos de dados usados

`Date` (datas e horários reais, em UTC, o que permite `$month`, `$dayOfWeek` e comparações por período), número, texto, booleano, `null` (por exemplo `checkout_real` de uma hospedagem em andamento ou `data_pagamento` de um pagamento pendente), array e objeto.

### Consistência e flexibilidade

- **Validação de esquema:** cada coleção é criada com um `$jsonSchema` que exige os campos essenciais e confere os tipos. Campos extras continuam permitidos, então o esquema pode evoluir sem migração.
- **Índices:** `caracteristicas`, `reservas.hospede_id`, `reservas.periodo.checkin` + `periodo.checkout`, `hospedagens.reserva_id`, `hospedagens.servicos_consumidos.servico_id`, `pagamentos.hospedagem_id` + `status` e `feedbacks.hospedagem_id`.
- **`_id` numérico:** usamos inteiros sequenciais no lugar do `ObjectId` automático para as referências ficarem legíveis nos exemplos (`hospede_id: 3`). Em produção, o `ObjectId` seria a escolha mais comum.
- **Status como texto:** `concluida`, `cancelada`, `em_andamento` etc. permitem novos estados sem alterar estrutura.
- **Limite do embutimento:** um documento do MongoDB aceita até 16 MB. Os arrays embutidos aqui são pequenos e limitados (uma hospedagem tem poucas dezenas de consumos). Já as reservas de um hóspede crescem sem limite, por isso ficam em coleção separada.

## Dados de exemplo

Foram criados para este trabalho: 14 hóspedes, 10 quartos, 33 reservas distribuídas de janeiro a dezembro de 2026, 27 hospedagens, 40 pagamentos e 20 feedbacks. Há de propósito:

- hóspedes com várias reservas (Walter Pemberton tem 5);
- 2 reservas canceladas, 1 pendente e 3 confirmadas para o futuro;
- 1 hospedagem em andamento (com `checkout_real: null`);
- 1 pagamento pendente e 1 estornado;
- 1 quarto em manutenção, que não aparece como disponível.

Nenhum quarto tem reservas sobrepostas no mesmo período, então a consulta de disponibilidade é coerente.

## Consultas

| # | Pergunta | Recursos |
|---|---|---|
| 1 a 3 | Quartos com vista para o mar, banheira e luxo | `find`, projeção, `sort` |
| 4 | Quartos com as três características juntas | `$all` |
| 5 | Hóspedes com mais de uma reserva | `$group`, `$match`, `$lookup`, `$unwind`, `$project`, `$sort` |
| 6 | Faturamento em um período | `$match` com datas, `$group` |
| 7 | Faturamento mês a mês | `$month`, `$group`, `$sort` |
| 8 | Meses com mais reservas | `$group`, `$sort`, `$arrayElemAt` |
| 9 | Dias da semana com maior movimento | `$dayOfWeek`, `$group` |
| 10 | Serviços mais utilizados | `$unwind` de array embutido, `$group`, `$lookup` |
| 11 | Quartos disponíveis em um período | `distinct()`, `$nin`, `find` |
| 12 | Canceladas, canais de venda e quartos mais caros | `countDocuments()`, `distinct()`, `sort()`, `limit()` |
| 13 | Quem está hospedado agora | `$lookup` duplo |

Decisões das consultas:

- **Faturamento:** soma só pagamentos com status `aprovado`. Pendentes e estornados ficam de fora.
- **Reservas por mês e por dia da semana:** contam pela data de check-in e ignoram as canceladas.
- **Disponibilidade:** um quarto está ocupado se alguma reserva não cancelada tem `checkin < fim` e `checkout > início`. Quartos em manutenção também ficam de fora.

Os resultados de cada uma estão em `docs/resultados.md`.

## Observação sobre os resultados

Os resultados em `docs/resultados.md` foram calculados diretamente sobre os dados de exemplo, fora do MongoDB. Ao rodar o script 02 no seu mongosh, a saída deve bater com eles. Se algo divergir, vale conferir se o script 01 foi executado por completo.
