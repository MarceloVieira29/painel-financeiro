let lancamentos = JSON.parse(localStorage.getItem("lancamentos")) || [];

document.getElementById("form-lancamento").addEventListener("submit", function(e) {
    e.preventDefault();
    const data = document.getElementById("data").value;
    const descricao = document.getElementById("descricao").value;
    const valor = parseFloat(document.getElementById("valor").value);
    const tipo = document.getElementById("tipo").value;

    lancamentos.push({ data, descricao, valor, tipo });
    localStorage.setItem("lancamentos", JSON.stringify(lancamentos));
    atualizarTabela();
    atualizarRelatorios();
    atualizarGrafico();
    this.reset();
});

function atualizarTabela() {
    const tbody = document.querySelector("#tabela-lancamentos tbody");
    tbody.innerHTML = "";
    lancamentos.forEach(l => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${l.data}</td><td>${l.descricao}</td><td>R$ ${l.valor.toFixed(2)}</td><td>${l.tipo}</td>`;
        tbody.appendChild(tr);
    });
}

function atualizarRelatorios() {
    const totalEntradas = lancamentos.filter(l => l.tipo === "entrada").reduce((acc, l) => acc + l.valor, 0);
    const totalSaidas = lancamentos.filter(l => l.tipo === "saida").reduce((acc, l) => acc + l.valor, 0);
    const saldo = totalEntradas - totalSaidas;

    document.getElementById("total-entradas").textContent = "R$ " + totalEntradas.toFixed(2);
    document.getElementById("total-saidas").textContent = "R$ " + totalSaidas.toFixed(2);
    document.getElementById("saldo-atual").textContent = "R$ " + saldo.toFixed(2);
    document.getElementById("qtd-lancamentos").textContent = lancamentos.length;
}

let grafico;
function atualizarGrafico() {
    const ctx = document.getElementById("grafico").getContext("2d");
    const entradas = lancamentos.filter(l => l.tipo === "entrada").reduce((acc, l) => acc + l.valor, 0);
    const saidas = lancamentos.filter(l => l.tipo === "saida").reduce((acc, l) => acc + l.valor, 0);

    if (grafico) grafico.destroy();
    grafico = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Entradas", "Saídas"],
            datasets: [{
                data: [entradas, saidas],
                backgroundColor: ["#28a745", "#dc3545"]
            }]
        }
    });
}

function showTab(tabId) {
    document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
    document.getElementById(tabId).classList.add("active");
    if (tabId === "relatorios") atualizarRelatorios();
    if (tabId === "graficos") atualizarGrafico();
}

atualizarTabela();
atualizarRelatorios();
