# Exemplos de documentos

Um documento de cada coleção, como ficam no MongoDB (as datas aparecem como `ISODate`, ou seja, tipo Date do BSON).

## hospedes

```js
{
  _id: 1,
  nome: "Walter Pemberton",
  data_nascimento: ISODate("1961-04-12T00:00:00Z"),
  contato: {
    email: "walter.pemberton@email.com",
    telefone: "+1 212 555-1037"
  },
  endereco: {
    cidade: "Nova York",
    estado: "NY",
    pais: "EUA"
  },
  documento: {
    tipo: "passaporte",
    numero: "PP-4007919",
    pais_emissor: "EUA"
  },
  preferencias: ["andar_alto", "vista_mar"],
  programa_fidelidade: {
    nivel: "Ouro",
    pontos: 5200
  },
  ativo: true,
  data_cadastro: ISODate("2025-08-28T11:30:00Z")
}
```

## quartos

```js
{
  _id: 1,
  numero: "101",
  nome_tematico: "Cabine Sputnik",
  tipo: "standard",
  andar: 1,
  capacidade: 2,
  preco_diaria: 180,
  status: "disponivel",
  vista: "jardim",
  caracteristicas: ["vista_jardim", "radio_retro", "ar_condicionado"],
  dimensoes: {
    area_m2: 22,
    camas: [
      {
        tipo: "casal",
        quantidade: 1
      }
    ]
  },
  historico_manutencao: [
    {
      data: ISODate("2026-02-03T09:00:00Z"),
      descricao: "Troca do rádio de válvulas"
    }
  ]
}
```

## reservas

```js
{
  _id: 1,
  hospede_id: 1,
  quarto_id: 2,
  data_reserva: ISODate("2025-12-17T11:00:00Z"),
  periodo: {
    checkin: ISODate("2026-01-06T15:00:00Z"),
    checkout: ISODate("2026-01-09T11:00:00Z"),
    noites: 3
  },
  status: "concluida",
  canal: "site_proprio",
  valor_previsto: 570,
  acompanhantes: [
    {
      nome: "Tommy",
      parentesco: "filho"
    }
  ],
  pedidos_especiais: []
}
```

## hospedagens

```js
{
  _id: 2,
  reserva_id: 2,
  hospede_id: 2,
  quarto_id: 3,
  funcionario_checkin_id: 3,
  funcionario_checkout_id: 2,
  checkin_real: ISODate("2026-01-23T15:50:00Z"),
  checkout_real: ISODate("2026-01-25T11:35:00Z"),
  status: "encerrada",
  servicos_consumidos: [
    {
      servico_id: 7,
      nome: "Coquetel no Bar Órbita",
      data_consumo: ISODate("2026-01-23T16:10:00Z"),
      quantidade: 1,
      valor_unitario: 55,
      valor_total: 55
    },
    {
      servico_id: 2,
      nome: "Lavanderia a vapor",
      data_consumo: ISODate("2026-01-23T18:30:00Z"),
      quantidade: 1,
      valor_unitario: 80,
      valor_total: 80
    },
    {
      servico_id: 7,
      nome: "Coquetel no Bar Órbita",
      data_consumo: ISODate("2026-01-24T08:10:00Z"),
      quantidade: 1,
      valor_unitario: 55,
      valor_total: 55
    },
    {
      servico_id: 7,
      nome: "Coquetel no Bar Órbita",
      data_consumo: ISODate("2026-01-24T16:50:00Z"),
      quantidade: 1,
      valor_unitario: 55,
      valor_total: 55
    }
  ],
  totais: {
    diarias: 840,
    servicos: 245,
    geral: 1085
  }
}
```

## pagamentos

```js
{
  _id: 1,
  hospedagem_id: 1,
  valor: 570,
  metodo: "cartao_credito",
  status: "aprovado",
  data_pagamento: ISODate("2026-01-09T10:55:00Z"),
  transacao_id: "TXN-CC-00001",
  detalhes: {
    bandeira: "visa",
    parcelas: 2
  }
}
```

## servicos

```js
{
  _id: 1,
  nome: "Café da manhã no Diner Espacial",
  categoria: "alimentacao",
  preco: 45,
  disponivel: true,
  horario_funcionamento: {
    inicio: "06:30",
    fim: "11:00"
  },
  tags: ["diner", "milkshake", "panquecas"]
}
```

## feedbacks

```js
{
  _id: 1,
  hospede_id: 1,
  hospedagem_id: 1,
  quarto_id: 2,
  data_avaliacao: ISODate("2026-01-10T10:50:00Z"),
  nota_geral: 4.1,
  notas: {
    limpeza: 4.5,
    atendimento: 4.0,
    conforto: 4.0,
    custo_beneficio: 4.0
  },
  comentario: "A sessão de cinema no terraço foi o ponto alto da viagem.",
  tags: ["decoracao"]
}
```

## funcionarios

```js
{
  _id: 1,
  nome: "Eleanor Pike",
  cargo: "Recepcionista",
  departamento: "Recepção",
  contato: {
    email: "eleanor.pike@hotelnebula.com",
    telefone: "+1 212 555-2001"
  },
  turnos: ["manha", "tarde"],
  ativo: true
}
```

