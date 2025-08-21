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
    tr.innerHTML = `<td>${l.data}</td><td>${l.descricao}</td><td>${formatarBRL(l.valor)}</td><td>${l.tipo}</td><td><button class="add" style="padding:4px 10px" onclick="removerLancamento(${i})">❌</button></td>`;
    tbody.appendChild(tr);
  });
}

function adicionarLancamento(){
  const data=document.getElementById("data").value;
  const descricao=document.getElementById("descricao").value;
  const valor=parseFloat((document.getElementById("valor").value||"").replace(".","").replace(",","."));
  const tipo=document.getElementById("tipo").value;
  if(!data||!descricao||isNaN(valor)){ alert("Preencha todos os campos corretamente!"); return; }
  lancamentos.push({data,descricao,valor,tipo});
  localStorage.setItem("lancamentos",JSON.stringify(lancamentos));
  atualizarTabela(); atualizarResumo(); atualizarResumoFiltrado(); atualizarResumoPorDescricao();
  document.getElementById("data").value=""; 
  document.getElementById("descricao").value=""; 
  document.getElementById("valor").value="";
}

function removerLancamento(i){
  lancamentos.splice(i,1);
  localStorage.setItem("lancamentos",JSON.stringify(lancamentos));
  atualizarTabela(); atualizarResumo(); atualizarResumoFiltrado(); atualizarResumoPorDescricao();
}

function exportarExcel(){
  const wb = XLSX.utils.book_new();
  const ws1 = XLSX.utils.json_to_sheet(lancamentos.map(l=>({Data:l.data,Descricao:l.descricao,Valor:l.valor,Tipo:l.tipo})));
  XLSX.utils.book_append_sheet(wb, ws1, "Lançamentos");
  const totalReceitas = lancamentos.filter(l=>l.tipo==="receita").reduce((a,b)=>a+b.valor,0);
  const totalDespesas = lancamentos.filter(l=>l.tipo==="despesa").reduce((a,b)=>a+b.valor,0);
  const resumo = [
    {Categoria:"Receitas",Total:totalReceitas},
    {Categoria:"Despesas",Total:totalDespesas},
    {Categoria:"Saldo",Total:totalReceitas-totalDespesas}
  ];
  const ws2 = XLSX.utils.json_to_sheet(resumo);
  XLSX.utils.book_append_sheet(wb, ws2, "Resumo");
  XLSX.writeFile(wb,"DashboardFinanceiroPremium.xlsx");
}

// FILTROS
function filtrarLancamentos(){
  const dataInicio = document.getElementById("filtroDataInicio").value;
  const dataFim = document.getElementById("filtroDataFim").value;
  const descricao = (document.getElementById("filtroDescricao").value || "").toLowerCase();
  const tipo = document.getElementById("filtroTipo").value;
  return lancamentos.filter(l=>{
    let ok = true;
    if(dataInicio) ok = ok && l.data >= dataInicio;
    if(dataFim) ok = ok && l.data <= dataFim;
    if(descricao) ok = ok && (l.descricao||"").toLowerCase().includes(descricao);
    if(tipo) ok = ok && l.tipo === tipo;
    return ok;
  });
}

function atualizarResumoFiltrado(){
  const filtrados = filtrarLancamentos();
  const receitas = filtrados.filter(l=>l.tipo==="receita").reduce((a,b)=>a+b.valor,0);
  const despesas = filtrados.filter(l=>l.tipo==="despesa").reduce((a,b)=>a+b.valor,0);
  const saldo = receitas - despesas;
  const total = receitas + despesas;

  document.getElementById("resReceitas").textContent = formatarBRL(receitas);
  document.getElementById("resDespesas").textContent = formatarBRL(despesas);
  document.getElementById("resSaldo").textContent = formatarBRL(saldo);

  document.getElementById("percReceitas").textContent = total>0?((receitas/total)*100).toFixed(1)+"%":"0%";
  document.getElementById("percDespesas").textContent = total>0?((despesas/total)*100).toFixed(1)+"%":"0%";
  document.getElementById("percSaldo").textContent = receitas>0?((saldo/receitas)*100).toFixed(1)+"%":"0%";

  const tbody = document.querySelector("#tabelaResumo tbody");
  tbody.innerHTML="";
  filtrados.forEach(l=>{
    const tr=document.createElement("tr");
    tr.innerHTML=`<td>${l.data}</td><td>${l.descricao}</td><td>${formatarBRL(l.valor)}</td><td>${l.tipo}</td>`;
    tbody.appendChild(tr);
  });

  const ctx=document.getElementById("graficoResumo").getContext("2d");
  const dados={labels:["Receitas","Despesas"],datasets:[{data:[receitas,despesas],backgroundColor:["#36d1dc","#ff6b6b"]}]};
  if(graficoResumo) graficoResumo.destroy();
  graficoResumo=new Chart(ctx,{type:"pie",data:dados,options:{plugins:{legend:{position:"bottom"},tooltip:{callbacks:{label:function(context){const v=context.parsed||0;const p=total>0?(v/total*100).toFixed(1)+"%":"0%";return `${context.label}: ${p} (${v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})})`;}}}}}});
}

function atualizarResumoPorDescricao(){
  const filtrados = filtrarLancamentos();
  let agrupados = {};
  filtrados.forEach(l=>{
    if(!agrupados[l.descricao]) agrupados[l.descricao] = 0;
    agrupados[l.descricao]+=l.valor;
  });
  const total = Object.values(agrupados).reduce((a,b)=>a+b,0);

  const tbody = document.querySelector("#tabelaResumoDescricao tbody");
  tbody.innerHTML="";
  Object.entries(agrupados).forEach(([desc,valor])=>{
    const tr=document.createElement("tr");
    tr.innerHTML=`<td>${desc}</td><td>${formatarBRL(valor)}</td><td>${total>0?((valor/total)*100).toFixed(1)+"%":"0%"}</td>`;
    tbody.appendChild(tr);
  });

  const ctx=document.getElementById("graficoDescricao").getContext("2d");
  const dados={labels:Object.keys(agrupados),datasets:[{data:Object.values(agrupados),backgroundColor:Object.keys(agrupados).map(()=>"#"+Math.floor(Math.random()*16777215).toString(16))}]};
  if(graficoDescricao) graficoDescricao.destroy();
  graficoDescricao=new Chart(ctx,{type:"pie",data:dados,options:{plugins:{legend:{position:"bottom"}}}});
}

// Baixar gráficos
function baixarGrafico(){
  const canvas=document.getElementById("graficoResumo");
  const link=document.createElement("a");
  link.href=canvas.toDataURL("image/png");
  link.download="ResumoFinanceiro.png";
  link.click();
}
function baixarGraficoDescricao(){
  const canvas=document.getElementById("graficoDescricao");
  const link=document.createElement("a");
  link.href=canvas.toDataURL("image/png");
  link.download="ResumoPorDescricao.png";
  link.click();
}

// Eventos filtros
["filtroDataInicio","filtroDataFim","filtroDescricao"].forEach(id=>{
  document.getElementById(id).addEventListener("input", ()=>{
    atualizarResumoFiltrado();
    atualizarResumoPorDescricao();
  });
});
document.getElementById("filtroTipo").addEventListener("change", ()=>{
  atualizarResumoFiltrado();
  atualizarResumoPorDescricao();
});
document.getElementById("btnLimparFiltros").addEventListener("click", ()=>{
  document.getElementById("filtroDataInicio").value="";
  document.getElementById("filtroDataFim").value="";
  document.getElementById("filtroDescricao").value="";
  document.getElementById("filtroTipo").value="";
  atualizarResumoFiltrado();
  atualizarResumoPorDescricao();
});

// Inicialização
window.onload=()=>{
  atualizarTabela();
  atualizarResumo();
  atualizarResumoFiltrado();
  atualizarResumoPorDescricao();
};
