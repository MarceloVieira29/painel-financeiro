document.addEventListener("DOMContentLoaded", () => {
  const lancamentos = JSON.parse(localStorage.getItem("lancamentos")) || [];
  const form = document.getElementById("formLancamento");
  const tabela = document.querySelector("#tabelaLancamentos tbody");

  // Abas
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(sec => sec.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
    });
  });

  // Campo manual
  document.getElementById("descricao").addEventListener("change", (e) => {
    document.getElementById("descricaoManual").style.display = e.target.value === "manual" ? "block" : "none";
  });

  // Adicionar lançamento
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = document.getElementById("data").value;
    let descricao = document.getElementById("descricao").value;
    if (descricao === "manual") descricao = document.getElementById("descricaoManual").value;
    const valor = parseFloat(document.getElementById("valor").value);
    const tipo = document.getElementById("tipo").value;

    lancamentos.push({ data, descricao, valor, tipo });
    localStorage.setItem("lancamentos", JSON.stringify(lancamentos));
    form.reset();
    renderTabela();
    atualizarRelatorios();
    atualizarGraficos();
  });

  // Render tabela
  function renderTabela() {
    tabela.innerHTML = "";
    lancamentos.forEach((l, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${l.data}</td>
        <td>${l.descricao}</td>
        <td>R$ ${l.valor.toFixed(2)}</td>
        <td>${l.tipo}</td>
        <td><button onclick="remover(${i})">Excluir</button></td>
      `;
      tabela.appendChild(tr);
    });
  }

  // Excluir
  window.remover = (i) => {
    lancamentos.splice(i, 1);
    localStorage.setItem("lancamentos", JSON.stringify(lancamentos));
    renderTabela();
    atualizarRelatorios();
    atualizarGraficos();
  };

  // Relatórios
  function atualizarRelatorios() {
    const receitas = lancamentos.filter(l => l.tipo === "receita").reduce((acc, l) => acc + l.valor, 0);
    const despesas = lancamentos.filter(l => l.tipo === "despesa").reduce((acc, l) => acc + l.valor, 0);
    document.getElementById("totalReceitas").textContent = receitas.toFixed(2);
    document.getElementById("totalDespesas").textContent = despesas.toFixed(2);
    document.getElementById("saldo").textContent = (receitas - despesas).toFixed(2);
  }

  // Gráficos
  let graficoPizza, graficoLinha;
  function atualizarGraficos() {
    const ctxPizza = document.getElementById("graficoPizza").getContext("2d");
    const ctxLinha = document.getElementById("graficoLinha").getContext("2d");
    const receitas = lancamentos.filter(l => l.tipo === "receita").reduce((acc, l) => acc + l.valor, 0);
    const despesas = lancamentos.filter(l => l.tipo === "despesa").reduce((acc, l) => acc + l.valor, 0);

    if (graficoPizza) graficoPizza.destroy();
    if (graficoLinha) graficoLinha.destroy();

    graficoPizza = new Chart(ctxPizza, {
      type: "pie",
      data: {
        labels: ["Receitas", "Despesas"],
        datasets: [{ data: [receitas, despesas], backgroundColor: ["#28a745", "#dc3545"] }]
      }
    });

    graficoLinha = new Chart(ctxLinha, {
      type: "line",
      data: {
        labels: lancamentos.map(l => l.data),
        datasets: [{
          label: "Saldo ao longo do tempo",
          data: lancamentos.map((_, i) => {
            const receitasParciais = lancamentos.slice(0, i+1).filter(l => l.tipo === "receita").reduce((acc, l) => acc + l.valor, 0);
            const despesasParciais = lancamentos.slice(0, i+1).filter(l => l.tipo === "despesa").reduce((acc, l) => acc + l.valor, 0);
            return receitasParciais - despesasParciais;
          }),
          borderColor: "#007bff",
          fill: false
        }]
      }
    });
  }

  // Exportar Excel
  document.getElementById("exportExcel").addEventListener("click", () => {
    let csv = "Data,Descrição,Valor,Tipo\n";
    lancamentos.forEach(l => {
      csv += `${l.data},${l.descricao},${l.valor},${l.tipo}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "lancamentos.csv";
    link.click();
  });

  // Exportar PDF
  document.getElementById("exportPDF").addEventListener("click", () => {
    const printContent = document.getElementById("relatorios").innerHTML;
    const win = window.open("", "", "width=800,height=600");
    win.document.write("<html><head><title>Relatório</title></head><body>");
    win.document.write(printContent);
    win.document.write("</body></html>");
    win.document.close();
    win.print();
  });

  renderTabela();
  atualizarRelatorios();
  atualizarGraficos();
});
