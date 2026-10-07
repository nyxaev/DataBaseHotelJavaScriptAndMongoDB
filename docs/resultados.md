# Consultas e exemplos de resultados

Os resultados abaixo foram calculados a partir dos documentos de exemplo deste repositório (`data/` e `scripts/01_criar_colecoes_e_inserir.js`). Para ver a saída real, rode `scripts/02_consultas.js` no mongosh.

No `$dayOfWeek` do MongoDB, 1 = domingo e 7 = sábado. Todas as datas estão em UTC.

## 1. Quartos com vista para o mar

**Pergunta:** Quais quartos possuem vista para o mar?

```js
db.quartos.find({ caracteristicas: "vista_mar" }, { _id: 0, numero: 1, nome_tematico: 1, preco_diaria: 1 }).sort({ preco_diaria: 1 })
```

**Resultado:**

```json
[
  {
    "numero": "201",
    "nome_tematico": "Suíte Aurora Boreal",
    "preco_diaria": 420
  },
  {
    "numero": "202",
    "nome_tematico": "Suíte Horizonte Cósmico",
    "preco_diaria": 450
  },
  {
    "numero": "301",
    "nome_tematico": "Suíte Presidente Foguete",
    "preco_diaria": 780
  }
]
```

## 2. Quartos com banheira

**Pergunta:** Quais quartos possuem banheira?

```js
db.quartos.find({ caracteristicas: "banheira" }, { _id: 0, numero: 1, nome_tematico: 1, preco_diaria: 1 }).sort({ preco_diaria: 1 })
```

**Resultado:**

```json
[
  {
    "numero": "201",
    "nome_tematico": "Suíte Aurora Boreal",
    "preco_diaria": 420
  },
  {
    "numero": "501",
    "nome_tematico": "Suíte Panorama Atômico",
    "preco_diaria": 520
  },
  {
    "numero": "301",
    "nome_tematico": "Suíte Presidente Foguete",
    "preco_diaria": 780
  },
  {
    "numero": "401",
    "nome_tematico": "Cobertura Estação Lunar",
    "preco_diaria": 1100
  }
]
```

## 3. Quartos de luxo

**Pergunta:** Quais quartos são de luxo?

```js
db.quartos.find({ caracteristicas: "luxo" }, { _id: 0, numero: 1, nome_tematico: 1, preco_diaria: 1 }).sort({ preco_diaria: 1 })
```

**Resultado:**

```json
[
  {
    "numero": "201",
    "nome_tematico": "Suíte Aurora Boreal",
    "preco_diaria": 420
  },
  {
    "numero": "202",
    "nome_tematico": "Suíte Horizonte Cósmico",
    "preco_diaria": 450
  },
  {
    "numero": "501",
    "nome_tematico": "Suíte Panorama Atômico",
    "preco_diaria": 520
  },
  {
    "numero": "301",
    "nome_tematico": "Suíte Presidente Foguete",
    "preco_diaria": 780
  },
  {
    "numero": "401",
    "nome_tematico": "Cobertura Estação Lunar",
    "preco_diaria": 1100
  }
]
```

## 4. Combinando características

**Pergunta:** Quais quartos têm, ao mesmo tempo, vista para o mar, banheira e luxo?

```js
db.quartos.find({ caracteristicas: { $all: ["vista_mar", "banheira", "luxo"] } }, { _id: 0, numero: 1, nome_tematico: 1, preco_diaria: 1 })
```

**Resultado:**

```json
[
  {
    "numero": "201",
    "nome_tematico": "Suíte Aurora Boreal",
    "preco_diaria": 420
  },
  {
    "numero": "301",
    "nome_tematico": "Suíte Presidente Foguete",
    "preco_diaria": 780
  }
]
```

## 5. Hóspedes com mais de uma reserva

**Pergunta:** Quais hóspedes fizeram mais de uma reserva?

```js
db.reservas.aggregate([
  { $group: { _id: "$hospede_id", total_reservas: { $sum: 1 } } },
  { $match: { total_reservas: { $gt: 1 } } },
  { $lookup: { from: "hospedes", localField: "_id", foreignField: "_id", as: "hospede" } },
  { $unwind: "$hospede" },
  { $project: { _id: 0, hospede: "$hospede.nome", total_reservas: 1 } },
  { $sort: { total_reservas: -1, hospede: 1 } }
])
```

**Resultado:**

```json
[
  {
    "hospede": "Walter Pemberton",
    "total_reservas": 5
  },
  {
    "hospede": "Doris Callahan",
    "total_reservas": 3
  },
  {
    "hospede": "Frank Delacroix",
    "total_reservas": 3
  },
  {
    "hospede": "Harold Finch",
    "total_reservas": 3
  },
  {
    "hospede": "Arthur Kimura",
    "total_reservas": 2
  },
  {
    "hospede": "Betty Sorensen",
    "total_reservas": 2
  },
  {
    "hospede": "Dolores Ximenes",
    "total_reservas": 2
  },
  {
    "hospede": "Eugene Hartley",
    "total_reservas": 2
  },
  {
    "hospede": "Gloria Tanaka",
    "total_reservas": 2
  },
  {
    "hospede": "Leonardo Vasquez",
    "total_reservas": 2
  },
  {
    "hospede": "Lucille Marlowe",
    "total_reservas": 2
  },
  {
    "hospede": "Marilyn Voss",
    "total_reservas": 2
  },
  {
    "hospede": "Mortimer Quill",
    "total_reservas": 2
  }
]
```

## 6. Faturamento em um período

**Pergunta:** Quanto o hotel faturou entre 01/06/2026 e 31/08/2026?

```js
db.pagamentos.aggregate([
  { $match: { status: "aprovado", data_pagamento: { $gte: ISODate("2026-06-01T00:00:00Z"), $lt: ISODate("2026-09-01T00:00:00Z") } } },
  { $group: { _id: null, faturamento_total: { $sum: "$valor" }, pagamentos: { $sum: 1 } } },
  { $project: { _id: 0, faturamento_total: 1, pagamentos: 1 } }
])
```

**Resultado:**

```json
[
  {
    "faturamento_total": 27475,
    "pagamentos": 17
  }
]
```

## 7. Faturamento por mês

**Pergunta:** Qual foi o faturamento mês a mês?

```js
db.pagamentos.aggregate([
  { $match: { status: "aprovado" } },
  { $group: { _id: { $month: "$data_pagamento" }, faturamento: { $sum: "$valor" } } },
  { $sort: { _id: 1 } },
  { $project: { _id: 0, mes: "$_id", faturamento: 1 } }
])
```

**Resultado:**

```json
[
  {
    "mes": 1,
    "faturamento": 2075
  },
  {
    "mes": 2,
    "faturamento": 3885
  },
  {
    "mes": 3,
    "faturamento": 5015
  },
  {
    "mes": 4,
    "faturamento": 4660
  },
  {
    "mes": 5,
    "faturamento": 4210
  },
  {
    "mes": 6,
    "faturamento": 12625
  },
  {
    "mes": 7,
    "faturamento": 10500
  },
  {
    "mes": 8,
    "faturamento": 4350
  },
  {
    "mes": 9,
    "faturamento": 7950
  }
]
```

## 8. Meses com mais reservas

**Pergunta:** Quais meses tiveram mais reservas (pelo mês do check-in, sem contar canceladas)?

```js
db.reservas.aggregate([
  { $match: { status: { $ne: "cancelada" } } },
  { $group: { _id: { $month: "$periodo.checkin" }, total_reservas: { $sum: 1 } } },
  { $sort: { total_reservas: -1, _id: 1 } },
  { $project: { _id: 0, mes: "$_id", nome_mes: { $arrayElemAt: [["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"], { $subtract: ["$_id", 1] }] }, total_reservas: 1 } }
])
```

**Resultado:**

```json
[
  {
    "mes": 7,
    "nome_mes": "julho",
    "total_reservas": 4
  },
  {
    "mes": 3,
    "nome_mes": "março",
    "total_reservas": 3
  },
  {
    "mes": 4,
    "nome_mes": "abril",
    "total_reservas": 3
  },
  {
    "mes": 5,
    "nome_mes": "maio",
    "total_reservas": 3
  },
  {
    "mes": 6,
    "nome_mes": "junho",
    "total_reservas": 3
  },
  {
    "mes": 8,
    "nome_mes": "agosto",
    "total_reservas": 3
  },
  {
    "mes": 9,
    "nome_mes": "setembro",
    "total_reservas": 3
  },
  {
    "mes": 1,
    "nome_mes": "janeiro",
    "total_reservas": 2
  },
  {
    "mes": 2,
    "nome_mes": "fevereiro",
    "total_reservas": 2
  },
  {
    "mes": 10,
    "nome_mes": "outubro",
    "total_reservas": 2
  },
  {
    "mes": 11,
    "nome_mes": "novembro",
    "total_reservas": 2
  },
  {
    "mes": 12,
    "nome_mes": "dezembro",
    "total_reservas": 1
  }
]
```

## 9. Dias da semana com maior movimento

**Pergunta:** Quais dias da semana têm mais check-ins?

```js
db.reservas.aggregate([
  { $match: { status: { $ne: "cancelada" } } },
  { $group: { _id: { $dayOfWeek: "$periodo.checkin" }, total_checkins: { $sum: 1 } } },
  { $sort: { total_checkins: -1, _id: 1 } },
  { $project: { _id: 0, dia_semana: { $arrayElemAt: [["domingo","segunda-feira","terça-feira","quarta-feira","quinta-feira","sexta-feira","sábado"], { $subtract: ["$_id", 1] }] }, total_checkins: 1 } }
])
```

**Resultado:**

```json
[
  {
    "dia_semana": "sexta-feira",
    "total_checkins": 8
  },
  {
    "dia_semana": "domingo",
    "total_checkins": 5
  },
  {
    "dia_semana": "segunda-feira",
    "total_checkins": 4
  },
  {
    "dia_semana": "terça-feira",
    "total_checkins": 4
  },
  {
    "dia_semana": "quarta-feira",
    "total_checkins": 4
  },
  {
    "dia_semana": "quinta-feira",
    "total_checkins": 4
  },
  {
    "dia_semana": "sábado",
    "total_checkins": 2
  }
]
```

## 10. Serviços mais utilizados

**Pergunta:** Quais serviços são mais utilizados?

```js
db.hospedagens.aggregate([
  { $unwind: "$servicos_consumidos" },
  { $group: { _id: "$servicos_consumidos.servico_id", servico: { $first: "$servicos_consumidos.nome" }, quantidade_total: { $sum: "$servicos_consumidos.quantidade" }, vezes_contratado: { $sum: 1 }, receita: { $sum: "$servicos_consumidos.valor_total" } } },
  { $lookup: { from: "servicos", localField: "_id", foreignField: "_id", as: "info" } },
  { $unwind: "$info" },
  { $project: { _id: 0, servico: 1, categoria: "$info.categoria", quantidade_total: 1, vezes_contratado: 1, receita: 1 } },
  { $sort: { quantidade_total: -1, servico: 1 } }
])
```

**Resultado:**

```json
[
  {
    "servico": "Café da manhã no Diner Espacial",
    "categoria": "alimentacao",
    "quantidade_total": 30,
    "vezes_contratado": 13,
    "receita": 1350
  },
  {
    "servico": "Coquetel no Bar Órbita",
    "categoria": "alimentacao",
    "quantidade_total": 28,
    "vezes_contratado": 14,
    "receita": 1540
  },
  {
    "servico": "Cinema Drive-in no Terraço",
    "categoria": "entretenimento",
    "quantidade_total": 25,
    "vezes_contratado": 14,
    "receita": 1750
  },
  {
    "servico": "Minibar Atômico",
    "categoria": "alimentacao",
    "quantidade_total": 21,
    "vezes_contratado": 11,
    "receita": 525
  },
  {
    "servico": "Tour pelo Observatório",
    "categoria": "experiencia",
    "quantidade_total": 21,
    "vezes_contratado": 12,
    "receita": 3780
  },
  {
    "servico": "Lavanderia a vapor",
    "categoria": "comodidade",
    "quantidade_total": 20,
    "vezes_contratado": 9,
    "receita": 1600
  },
  {
    "servico": "Sala de Pinball e Jukebox",
    "categoria": "entretenimento",
    "quantidade_total": 20,
    "vezes_contratado": 11,
    "receita": 1200
  },
  {
    "servico": "Transfer de limusine",
    "categoria": "transporte",
    "quantidade_total": 17,
    "vezes_contratado": 9,
    "receita": 2040
  }
]
```

## 11. Quartos disponíveis em um período

**Pergunta:** Quais quartos estão disponíveis entre 10/11/2026 e 14/11/2026?

```js
var inicio = ISODate("2026-11-10T15:00:00Z");
var fim = ISODate("2026-11-14T11:00:00Z");
var ocupados = db.reservas.distinct("quarto_id", { status: { $ne: "cancelada" }, "periodo.checkin": { $lt: fim }, "periodo.checkout": { $gt: inicio } });
printjson(ocupados);
db.quartos.find({ _id: { $nin: ocupados }, status: { $ne: "manutencao" } }, { _id: 0, numero: 1, nome_tematico: 1, tipo: 1, preco_diaria: 1 }).sort({ numero: 1 })
```

**Resultado:**

```json
{
  "quartos_ocupados_ids": [
    4
  ],
  "disponiveis": [
    {
      "numero": "101",
      "nome_tematico": "Cabine Sputnik",
      "tipo": "standard",
      "preco_diaria": 180
    },
    {
      "numero": "102",
      "nome_tematico": "Cabine Atômica",
      "tipo": "standard",
      "preco_diaria": 190
    },
    {
      "numero": "201",
      "nome_tematico": "Suíte Aurora Boreal",
      "tipo": "luxo",
      "preco_diaria": 420
    },
    {
      "numero": "301",
      "nome_tematico": "Suíte Presidente Foguete",
      "tipo": "suite",
      "preco_diaria": 780
    },
    {
      "numero": "302",
      "nome_tematico": "Apartamento Família Orbital",
      "tipo": "familia",
      "preco_diaria": 560
    },
    {
      "numero": "401",
      "nome_tematico": "Cobertura Estação Lunar",
      "tipo": "cobertura",
      "preco_diaria": 1100
    },
    {
      "numero": "501",
      "nome_tematico": "Suíte Panorama Atômico",
      "tipo": "luxo",
      "preco_diaria": 520
    },
    {
      "numero": "502",
      "nome_tematico": "Cápsula Solo Saturno",
      "tipo": "capsula",
      "preco_diaria": 140
    }
  ]
}
```

## 12. count(), distinct() e sort()

**Pergunta:** Quantas reservas foram canceladas, quais canais de venda existem e quais são os 3 quartos mais caros?

```js
db.reservas.countDocuments({ status: "cancelada" });
db.reservas.distinct("canal");
db.quartos.find({}, { _id: 0, numero: 1, nome_tematico: 1, preco_diaria: 1 }).sort({ preco_diaria: -1 }).limit(3)
```

**Resultado:**

```json
{
  "canceladas": 2,
  "canais": [
    "agencia_online",
    "app_mobile",
    "empresa_parceira",
    "site_proprio",
    "telefone"
  ],
  "mais_caros": [
    {
      "numero": "401",
      "nome_tematico": "Cobertura Estação Lunar",
      "preco_diaria": 1100
    },
    {
      "numero": "301",
      "nome_tematico": "Suíte Presidente Foguete",
      "preco_diaria": 780
    },
    {
      "numero": "302",
      "nome_tematico": "Apartamento Família Orbital",
      "preco_diaria": 560
    }
  ]
}
```

## 13. Hóspedes atualmente hospedados ($lookup duplo)

**Pergunta:** Quem está hospedado agora e em qual quarto?

```js
db.hospedagens.aggregate([
  { $match: { status: "em_andamento" } },
  { $lookup: { from: "hospedes", localField: "hospede_id", foreignField: "_id", as: "hospede" } },
  { $lookup: { from: "quartos", localField: "quarto_id", foreignField: "_id", as: "quarto" } },
  { $unwind: "$hospede" },
  { $unwind: "$quarto" },
  { $project: { _id: 0, hospede: "$hospede.nome", quarto: "$quarto.nome_tematico", checkin_real: 1, total_servicos_ate_agora: "$totais.servicos" } }
])
```

**Resultado:**

```json
[
  {
    "hospede": "Leonardo Vasquez",
    "quarto": "Apartamento Família Orbital",
    "checkin_real": "2026-10-04T15:35:00Z",
    "total_servicos_ate_agora": 770
  }
]
```

