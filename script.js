let lancamentos = JSON.parse(localStorage.getItem("lancamentos")) || [];

function abrirAba(nome) {
  document.querySelectorAll(".aba").forEach(div => div.classList.remove("ativa"));
  document.getElementById(nome).classList.add("ativa");
}

document.getElementById("formLancamento").addEventListener("submit", e => {
  e.preventDefault();
  const data = document.getElementById("data").value;
  const descricao = document.getElementById("descricao").value;
  const valor = parseFloat(document.getElementById("valor").value);
  const tipo = document.getElementById("tipo").value;

  const lancamento = { data, descricao, valor, tipo };
  lancamentos.push(lancamento);
  localStorage.setItem("lancamentos", JSON.stringify(lancamentos));
  atualizarTabela();
  atualizarResumo();
  atualizarGrafico();
  e.target.reset();
});

function atualizarTabela() {
  const tbody = document.querySelector("#tabelaLancamentos tbody");
  tbody.innerHTML = "";
  lancamentos.forEach(l => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${l.data}</td><td>${l.descricao}</td><td>R$ ${l.valor.toFixed(2)}</td><td>${l.tipo}</td>`;
    tbody.appendChild(tr);
  });
}

function atualizarResumo() {
  let receitas = lancamentos.filter(l => l.tipo === "receita").reduce((acc, l) => acc + l.valor, 0);
  let despesas = lancamentos.filter(l => l.tipo === "despesa").reduce((acc, l) => acc + l.valor, 0);
  let saldo = receitas - despesas;

  document.getElementById("resumo").innerHTML = `
    <p><b>Total de Receitas:</b> R$ ${receitas.toFixed(2)}</p>
    <p><b>Total de Despesas:</b> R$ ${despesas.toFixed(2)}</p>
    <p><b>Saldo:</b> R$ ${saldo.toFixed(2)}</p>
  `;
}

function atualizarGrafico() {
  const ctx = document.getElementById("grafico").getContext("2d");
  if (window.grafico) window.grafico.destroy();
  let receitas = lancamentos.filter(l => l.tipo === "receita").reduce((acc, l) => acc + l.valor, 0);
  let despesas = lancamentos.filter(l => l.tipo === "despesa").reduce((acc, l) => acc + l.valor, 0);

  window.grafico = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Receitas", "Despesas"],
      datasets: [{
        data: [receitas, despesas],
        backgroundColor: ["#4caf50", "#f44336"]
      }]
    }
  });
}

atualizarTabela();
atualizarResumo();
atualizarGrafico();
