function lerValorSeguro(id) {
    const elemento = document.getElementById(id);
    if (!elemento || elemento.value.trim() === "") return 0;
    let campo = elemento.value.trim().replace(/\./g, '').replace(',', '.');
    return parseFloat(campo);
}

function alternarTodos(numBolsa) {
    const marcar = document.getElementById(`b${numBolsa}_todos`).checked;
    const checkboxes = document.querySelectorAll(`.check-b${numBolsa}`);
    checkboxes.forEach(box => box.checked = marcar);
}

function fecharModal() {
    document.getElementById('modalFluxograma').style.display = 'none';
}

function validarAcesso() {
    const checkbox = document.getElementById('checkAjuste');

    if (checkbox && !checkbox.checked) {
        alert("Você precisa confirmar todos os passos de ajuste para liberar a auditoria.");
        return;
    }
    fecharModal();
}

function fecharModalResultado() {
    document.getElementById('modalResultado').style.display = 'none';
}


function auditarSemestralidade() {
    const valorMensalidade = lerValorSeguro('valorMensalidade');
    const parcelaLeve = lerValorSeguro('parcelaLeve');

    if (valorMensalidade === 0) {
        alert("Por favor, preencha o valor da mensalidade integral (Referência).");
        return;
    }

    const bolsa1 = lerValorSeguro('bolsa1');
    const bolsa2 = lerValorSeguro('bolsa2');
    const bolsa3 = lerValorSeguro('bolsa3');
    const bolsa4 = lerValorSeguro('bolsa4');
    const bolsa5 = lerValorSeguro('bolsa5');

    let qtdBoletos = 0;
    let totalFaturado = 0;
    let totalCorreto = 0; 
    
    
    let detalhesAcao = []; 
    
    let mesesMaior = [];
    let mesesMenor = [];
    let analiseMeses = []; 
    
    const formatarMoeda = (valor) => Math.abs(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    for (let i = 1; i <= 6; i++) {
        const elementoMes = document.getElementById('mes' + i);
        if (elementoMes && elementoMes.value.trim() !== "") {
            let valorFaturadoMes = lerValorSeguro('mes' + i);
            qtdBoletos++;
            totalFaturado += valorFaturadoMes;

            let fatorDesconto = 1;
            if (document.getElementById(`b1_m${i}`) && document.getElementById(`b1_m${i}`).checked) fatorDesconto *= (1 - (bolsa1 / 100));
            if (document.getElementById(`b2_m${i}`) && document.getElementById(`b2_m${i}`).checked) fatorDesconto *= (1 - (bolsa2 / 100));
            if (document.getElementById(`b3_m${i}`) && document.getElementById(`b3_m${i}`).checked) fatorDesconto *= (1 - (bolsa3 / 100));
            if (document.getElementById(`b4_m${i}`) && document.getElementById(`b4_m${i}`).checked) fatorDesconto *= (1 - (bolsa4 / 100));
            if (document.getElementById(`b5_m${i}`) && document.getElementById(`b5_m${i}`).checked) fatorDesconto *= (1 - (bolsa5 / 100));

            let valorCorretoNesteMes = (valorMensalidade * fatorDesconto) + parcelaLeve;
            valorCorretoNesteMes = Math.round(valorCorretoNesteMes * 100) / 100;
            
            totalCorreto += valorCorretoNesteMes;

            let diferencaNesteMes = Math.round((valorFaturadoMes - valorCorretoNesteMes) * 100) / 100;
            
            analiseMeses.push({
                mes: i,
                faturado: valorFaturadoMes,
                correto: valorCorretoNesteMes,
                diferenca: diferencaNesteMes
            });

            if (diferencaNesteMes > 0) {
                mesesMaior.push(i);
            } else if (diferencaNesteMes < 0) {
                mesesMenor.push(i);
            }
        }
    }

    if (qtdBoletos === 0) {
        alert("Por favor, preencha pelo menos uma mensalidade faturada no SIA.");
        return;
    }

    let diferencaTotal = totalFaturado - totalCorreto;
    diferencaTotal = Math.round(diferencaTotal * 100) / 100;

    
    if (diferencaTotal > 0 && mesesMaior.length > 0) {
        let somaExcedentes = analiseMeses.reduce((acc, m) => m.diferenca > 0 ? acc + m.diferenca : acc, 0);
        let creditoDistribuido = 0;
        let excedentesList = analiseMeses.filter(m => m.diferenca > 0);

        excedentesList.forEach((m, index) => {
            let creditoAplicado;
            
            if (index === excedentesList.length - 1) {
                creditoAplicado = Math.round((diferencaTotal - creditoDistribuido) * 100) / 100;
            } else {
                let proporcao = m.diferenca / somaExcedentes;
                creditoAplicado = Math.round((diferencaTotal * proporcao) * 100) / 100;
                creditoDistribuido += creditoAplicado;
            }

            let novoCorreto = Math.round((m.faturado - creditoAplicado) * 100) / 100;
            detalhesAcao.push(`<strong>Boleto ${m.mes}:</strong> Gerado por ${formatarMoeda(m.faturado)}, no entanto, deveria ser ${formatarMoeda(novoCorreto)}. Lançar crédito de <strong>${formatarMoeda(creditoAplicado)}</strong> (cobrança excedente).`);
        });
    }
    
    else if (diferencaTotal < 0 && mesesMenor.length > 0) {
        let debitoTotalAbs = Math.abs(diferencaTotal);
        let somaFaltantes = analiseMeses.reduce((acc, m) => m.diferenca < 0 ? acc + Math.abs(m.diferenca) : acc, 0);
        let debitoDistribuido = 0;
        let faltantesList = analiseMeses.filter(m => m.diferenca < 0);

        faltantesList.forEach((m, index) => {
            let debitoAplicado;
            
            if (index === faltantesList.length - 1) {
                debitoAplicado = Math.round((debitoTotalAbs - debitoDistribuido) * 100) / 100;
            } else {
                let proporcao = Math.abs(m.diferenca) / somaFaltantes;
                debitoAplicado = Math.round((debitoTotalAbs * proporcao) * 100) / 100;
                debitoDistribuido += debitoAplicado;
            }

            let novoCorreto = Math.round((m.faturado + debitoAplicado) * 100) / 100;
            detalhesAcao.push(`<strong>Boleto ${m.mes}:</strong> Gerado por ${formatarMoeda(m.faturado)}, no entanto, deveria ser ${formatarMoeda(novoCorreto)}. Lançar débito de <strong>${formatarMoeda(debitoAplicado)}</strong> (cobrança a menor).`);
        });
    }

    let textoAcao = "";
    let corFundo = "";
    let corTexto = "";

    if (diferencaTotal > 0) {
        textoAcao = "Lançar Crédito";
        corFundo = "rgba(46, 213, 115, 0.2)"; 
        corTexto = "#2ed573"; 
    } else if (diferencaTotal < 0) {
        textoAcao = "Lançar Débito";
        corFundo = "rgba(255, 71, 87, 0.2)"; 
        corTexto = "#ff4757"; 
    } else if (diferencaTotal === 0) {
        textoAcao = "Sem ação a ser feita";
        corFundo = "rgba(0, 191, 255, 0.2)"; 
        corTexto = "#00bfff"; 
    }

    document.getElementById('resQtdBoletos').innerText = qtdBoletos;
    document.getElementById('resFaturado').innerText = totalFaturado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('resCorreto').innerText = totalCorreto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    const sinalDiferenca = diferencaTotal < 0 ? "-" : (diferencaTotal > 0 ? "+" : "");
    document.getElementById('valorDiferenca').innerText = sinalDiferenca + formatarMoeda(diferencaTotal);
    document.getElementById('valorDiferenca').style.color = corTexto;

    document.getElementById('textoAcao').innerText = textoAcao;
    document.getElementById('caixaAcao').style.backgroundColor = corFundo;
    document.getElementById('caixaAcao').style.color = corTexto;
    document.getElementById('caixaAcao').style.border = `1px solid ${corTexto}`;

    const detalheElement = document.getElementById('detalheCredito');
    
    const formatarListaMeses = (arr) => arr.length > 1 ? arr.join(', ').replace(/, ([^,]*)$/, ' e $1') : arr[0];

    
    if (diferencaTotal > 0 && detalhesAcao.length > 0) {
        let listaHTML = detalhesAcao.map(item => `<li style="margin-bottom: 8px;">${item}</li>`).join('');
        
        detalheElement.innerHTML = `Para corrigir o faturamento, segue o detalhamento referente à cobrança excedente:<br>
        <ul style="text-align: left; margin-top: 10px; margin-left: 10px; padding-left: 20px; color: #fff; font-size: 0.95em;">
            ${listaHTML}
        </ul>`;
        detalheElement.style.borderLeft = "4px solid #2ed573";
        detalheElement.style.display = "block";
        detalheElement.style.textAlign = "left"; 
        
    } 
    
    else if (diferencaTotal < 0 && detalhesAcao.length > 0) {
        let listaHTML = detalhesAcao.map(item => `<li style="margin-bottom: 8px;">${item}</li>`).join('');
        
        detalheElement.innerHTML = `Para corrigir o faturamento, segue o detalhamento referente à cobrança a menor:<br>
        <ul style="text-align: left; margin-top: 10px; margin-left: 10px; padding-left: 20px; color: #fff; font-size: 0.95em;">
            ${listaHTML}
        </ul>`;
        detalheElement.style.borderLeft = "4px solid #ff4757";
        detalheElement.style.display = "block";
        detalheElement.style.textAlign = "left"; 
        
    } 
    
    else if (diferencaTotal === 0) {
        if (mesesMaior.length > 0 && mesesMenor.length > 0) {
            let textMaior = formatarListaMeses(mesesMaior);
            let textMenor = formatarListaMeses(mesesMenor);
            detalheElement.innerHTML = `O ajuste no(s) boleto(s) <strong>${textMaior}</strong> foi para corrigir o faturado a menor na(s) mensalidade(s) <strong>${textMenor}</strong>.`;
        } else {
            detalheElement.innerHTML = `O faturamento está correto em todos os meses avaliados. Nenhuma compensação interna foi necessária.`;
        }
        
        detalheElement.style.borderLeft = "4px solid #00bfff";
        detalheElement.style.display = "block";
        detalheElement.style.textAlign = "center"; 
        
    } else {
        detalheElement.style.display = "none";
    }

    document.getElementById('modalResultado').style.display = "flex";
}

function limparTudo() {
    document.getElementById('valorMensalidade').value = "";
    document.getElementById('parcelaLeve').value = ""; 
    
    for (let i = 1; i <= 6; i++) {
        document.getElementById('mes' + i).value = "";
    }

    for (let b = 1; b <= 5; b++) {
        const campoBolsa = document.getElementById('bolsa' + b);
        if (campoBolsa) campoBolsa.value = "";
        
        const checkTodos = document.getElementById(`b${b}_todos`);
        if (checkTodos) checkTodos.checked = false;

        const checkboxes = document.querySelectorAll(`.check-b${b}`);
        checkboxes.forEach(box => box.checked = false);
    }
}


document.addEventListener('keydown', function(event) {
    const modalFluxograma = document.getElementById('modalFluxograma');
    const modalResultado = document.getElementById('modalResultado');

    if (event.key === 'Escape' || event.key === 'Enter') {
       
        if (modalResultado && modalResultado.style.display === 'flex') {
            fecharModalResultado();
        } 
        
        else if (modalFluxograma && modalFluxograma.style.display === 'flex') {
            if (event.key === 'Enter') {
                validarAcesso(); 
            } else {
                fecharModal(); 
            }
        }
    }
});
