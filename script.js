let lancamentos = JSON.parse(localStorage.getItem('lancamentos')) || [];
let graficoPizza, graficoLinha;

function showTab(tabId){
  document.getElementById('lancamentos').style.display = "none";
  document.getElementById('relatorio').style.display = "none";
  document.getElementById(tabId).style.display = "block";
  document.querySelectorAll('.nav-link').forEach(el=>el.classList.remove('active'));
  document.querySelector(`[onclick="showTab('${tabId}')"]`).classList.add('active');
}

function adicionarLancamento(){
  const data = document.getElementById('data').value;
  const tipo = document.getElementById('tipo').value;
  const categoria = document.getElementById('categoria').value;
  const valor = parseFloat(document.getElementById('valor').value);
  if(!data || !categoria || isNaN(valor)){ alert("Preencha todos os campos!"); return; }
  lancamentos.push({data,tipo,categoria,valor});
  localStorage.setItem('lancamentos',JSON.stringify(lancamentos));
  atualizarTabela();
  atualizarResumo();
  carregarGraficos();
  document.getElementById('data').value=''; document.getElementById('categoria').value=''; document.getElementById('valor').value='';
}

function atualizarTabela(){
  const tbody = document.getElementById('tabela');
  tbody.innerHTML='';
  lancamentos.forEach((l,i)=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${l.data}</td><td>${l.tipo}</td><td>${l.categoria}</td><td>R$ ${l.valor.toFixed(2)}</td><td><button class="btn btn-sm btn-danger" onclick="excluir(${i})">❌</button></td>`;
    tbody.appendChild(tr);
  });
}

function atualizarResumo(){
  const totalReceitas = lancamentos.filter(l=>l.tipo==='receita').reduce((a,b)=>a+b.valor,0);
  const totalDespesas = lancamentos.filter(l=>l.tipo==='despesa').reduce((a,b)=>a+b.valor,0);
  const saldo = totalReceitas-totalDespesas;
  document.getElementById('totalReceitas').textContent = "R$ "+totalReceitas.toLocaleString('pt-BR');
  document.getElementById('totalDespesas').textContent = "R$ "+totalDespesas.toLocaleString('pt-BR');
  document.getElementById('saldo').textContent = "R$ "+saldo.toLocaleString('pt-BR');
}

function excluir(index){
  lancamentos.splice(index,1);
  localStorage.setItem('lancamentos',JSON.stringify(lancamentos));
  atualizarTabela(); atualizarResumo(); carregarGraficos();
}

function carregarGraficos(){
  const ctxPizza = document.getElementById('graficoPizza').getContext('2d');
  const ctxLinha = document.getElementById('graficoLinha').getContext('2d');
  const totalReceitas = lancamentos.filter(l=>l.tipo==='receita').reduce((a,b)=>a+b.valor,0);
  const totalDespesas = lancamentos.filter(l=>l.tipo==='despesa').reduce((a,b)=>a+b.valor,0);

  if(graficoPizza) graficoPizza.destroy();
  graficoPizza = new Chart(ctxPizza,{
    type:'pie',
    data:{labels:['Receitas','Despesas'],datasets:[{data:[totalReceitas,totalDespesas],backgroundColor:['#2ecc71','#e74c3c']}]},
    options:{responsive:true, maintainAspectRatio:false}
  });

  const meses={};
  lancamentos.forEach(l=>{
    const m = l.data.slice(0,7);
    if(!meses[m]) meses[m]={receitas:0,despesas:0};
    l.tipo==='receita'?meses[m].receitas+=l.valor:meses[m].despesas+=l.valor;
  });

  if(graficoLinha) graficoLinha.destroy();
  graficoLinha = new Chart(ctxLinha,{
    type:'line',
    data:{
      labels:Object.keys(meses),
      datasets:[
        {label:'Receitas',data:Object.values(meses).map(m=>m.receitas),borderColor:'#2ecc71',fill:false},
        {label:'Despesas',data:Object.values(meses).map(m=>m.despesas),borderColor:'#e74c3c',fill:false}
      ]
    },
    options:{responsive:true, maintainAspectRatio:false}
  });
}

// Inicializar
atualizarTabela(); atualizarResumo(); carregarGraficos();
