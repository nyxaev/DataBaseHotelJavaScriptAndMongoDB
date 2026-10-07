db = db.getSiblingDB("hotel_nebula");

print("\n=== 1. Quartos com vista para o mar ===");
printjson(db.quartos.find({ caracteristicas: "vista_mar" }, { _id: 0, numero: 1, nome_tematico: 1, preco_diaria: 1 }).sort({ preco_diaria: 1 }).toArray());

print("\n=== 2. Quartos com banheira ===");
printjson(db.quartos.find({ caracteristicas: "banheira" }, { _id: 0, numero: 1, nome_tematico: 1, preco_diaria: 1 }).sort({ preco_diaria: 1 }).toArray());

print("\n=== 3. Quartos de luxo ===");
printjson(db.quartos.find({ caracteristicas: "luxo" }, { _id: 0, numero: 1, nome_tematico: 1, preco_diaria: 1 }).sort({ preco_diaria: 1 }).toArray());

print("\n=== 4. Combinando características ===");
printjson(db.quartos.find({ caracteristicas: { $all: ["vista_mar", "banheira", "luxo"] } }, { _id: 0, numero: 1, nome_tematico: 1, preco_diaria: 1 }).toArray());

print("\n=== 5. Hóspedes com mais de uma reserva ===");
printjson(db.reservas.aggregate([
  { $group: { _id: "$hospede_id", total_reservas: { $sum: 1 } } },
  { $match: { total_reservas: { $gt: 1 } } },
  { $lookup: { from: "hospedes", localField: "_id", foreignField: "_id", as: "hospede" } },
  { $unwind: "$hospede" },
  { $project: { _id: 0, hospede: "$hospede.nome", total_reservas: 1 } },
  { $sort: { total_reservas: -1, hospede: 1 } }
]).toArray());

print("\n=== 6. Faturamento em um período ===");
printjson(db.pagamentos.aggregate([
  { $match: { status: "aprovado", data_pagamento: { $gte: ISODate("2026-06-01T00:00:00Z"), $lt: ISODate("2026-09-01T00:00:00Z") } } },
  { $group: { _id: null, faturamento_total: { $sum: "$valor" }, pagamentos: { $sum: 1 } } },
  { $project: { _id: 0, faturamento_total: 1, pagamentos: 1 } }
]).toArray());

print("\n=== 7. Faturamento por mês ===");
printjson(db.pagamentos.aggregate([
  { $match: { status: "aprovado" } },
  { $group: { _id: { $month: "$data_pagamento" }, faturamento: { $sum: "$valor" } } },
  { $sort: { _id: 1 } },
  { $project: { _id: 0, mes: "$_id", faturamento: 1 } }
]).toArray());

print("\n=== 8. Meses com mais reservas ===");
printjson(db.reservas.aggregate([
  { $match: { status: { $ne: "cancelada" } } },
  { $group: { _id: { $month: "$periodo.checkin" }, total_reservas: { $sum: 1 } } },
  { $sort: { total_reservas: -1, _id: 1 } },
  { $project: { _id: 0, mes: "$_id", nome_mes: { $arrayElemAt: [["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"], { $subtract: ["$_id", 1] }] }, total_reservas: 1 } }
]).toArray());

print("\n=== 9. Dias da semana com maior movimento ===");
printjson(db.reservas.aggregate([
  { $match: { status: { $ne: "cancelada" } } },
  { $group: { _id: { $dayOfWeek: "$periodo.checkin" }, total_checkins: { $sum: 1 } } },
  { $sort: { total_checkins: -1, _id: 1 } },
  { $project: { _id: 0, dia_semana: { $arrayElemAt: [["domingo","segunda-feira","terça-feira","quarta-feira","quinta-feira","sexta-feira","sábado"], { $subtract: ["$_id", 1] }] }, total_checkins: 1 } }
]).toArray());

print("\n=== 10. Serviços mais utilizados ===");
printjson(db.hospedagens.aggregate([
  { $unwind: "$servicos_consumidos" },
  { $group: { _id: "$servicos_consumidos.servico_id", servico: { $first: "$servicos_consumidos.nome" }, quantidade_total: { $sum: "$servicos_consumidos.quantidade" }, vezes_contratado: { $sum: 1 }, receita: { $sum: "$servicos_consumidos.valor_total" } } },
  { $lookup: { from: "servicos", localField: "_id", foreignField: "_id", as: "info" } },
  { $unwind: "$info" },
  { $project: { _id: 0, servico: 1, categoria: "$info.categoria", quantidade_total: 1, vezes_contratado: 1, receita: 1 } },
  { $sort: { quantidade_total: -1, servico: 1 } }
]).toArray());

print("\n=== 11. Quartos disponíveis em um período ===");
var inicio = ISODate("2026-11-10T15:00:00Z");
var fim = ISODate("2026-11-14T11:00:00Z");
var ocupados = db.reservas.distinct("quarto_id", { status: { $ne: "cancelada" }, "periodo.checkin": { $lt: fim }, "periodo.checkout": { $gt: inicio } });
printjson(ocupados);
printjson(db.quartos.find({ _id: { $nin: ocupados }, status: { $ne: "manutencao" } }, { _id: 0, numero: 1, nome_tematico: 1, tipo: 1, preco_diaria: 1 }).sort({ numero: 1 }).toArray());

print("\n=== 12. count(), distinct() e sort() ===");
printjson(db.reservas.countDocuments({ status: "cancelada" }));
printjson(db.reservas.distinct("canal"));
printjson(db.quartos.find({}, { _id: 0, numero: 1, nome_tematico: 1, preco_diaria: 1 }).sort({ preco_diaria: -1 }).limit(3).toArray());

print("\n=== 13. Hóspedes atualmente hospedados ($lookup duplo) ===");
printjson(db.hospedagens.aggregate([
  { $match: { status: "em_andamento" } },
  { $lookup: { from: "hospedes", localField: "hospede_id", foreignField: "_id", as: "hospede" } },
  { $lookup: { from: "quartos", localField: "quarto_id", foreignField: "_id", as: "quarto" } },
  { $unwind: "$hospede" },
  { $unwind: "$quarto" },
  { $project: { _id: 0, hospede: "$hospede.nome", quarto: "$quarto.nome_tematico", checkin_real: 1, total_servicos_ate_agora: "$totais.servicos" } }
]).toArray());
