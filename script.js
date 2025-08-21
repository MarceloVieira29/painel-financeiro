let lancamentos = JSON.parse(localStorage.getItem("lancamentos")) || [];
let graficoResumo = null;
let graficoDescricao = null;

function formatarBRL(valor){
  return valor.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
}

function abrirAba(id){
  document.querySelectorAll(".aba").forEach(a=>a.classList.remove("ativa"));
  document.getElementById(id).classList.add("ativa");
}

function atualizarResumo(){
  let receitas = lancamentos.filter(l=>l.tipo==="receita").reduce((a,b)=>a+b.valor,0);
  let despesas = lancamentos.filter(l=>l.tipo==="despesa").reduce((a,b)=>a+b.valor,0);
  document.getElementById("totalReceitas").textContent = formatarBRL(receitas);
  document.getElementById("totalDespesas").textContent = formatarBRL(despesas);
  document.getElementById("saldo").textContent = formatarBRL(receitas-despesas);
}

function atualizarTabela(){
  const tbody = document.querySelector("#tabelaLancamentos tbody");
  tbody.innerHTML = "";
  lancamentos.forEach((l,i)=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${l.data}</td><td>${l.descricao}</td><td>${formatarBRL(l.valor)}</td
