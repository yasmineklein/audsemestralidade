function lerValor(id) {
    const elemento = document.getElementById(id);
    if (elemento.value.trim() === "") return 0;
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

    if (!checkbox.checked) {
        alert("Você precisa confirmar todos os passos de ajuste para liberar a auditoria.");
        return;
    }
    fecharModal();
}

function fecharModalResultado() {
    document.getElementById('modalResultado').style.display = 'none';
}

function auditarSemestralidade() {
    const valorIntegralBase = lerValor('valorMensalidade');
    const valorParcelaLeve = lerValor('parcelaLeve'); /

    if (valorIntegralBase === 0) {
        alert("Por favor, preencha o valor integral da mensalidade.");
        return;
    }

    const percBolsa1 = lerValor('bolsa1');
    const percBolsa2 = lerValor('bolsa2');
    const percBolsa3 = lerValor('bolsa3');
    const percBolsa4 = lerValor('bolsa4');
    const percBolsa5 = lerValor('bolsa5');

    let qtdBoletos = 0;
    let totalFaturadoCentavos = 0;
    let totalCorretoCentavos = 0;
    let detalhesCredito = [];

    const formatarMoeda = (valorEmCentavos) => {
        return Math.abs(valorEmCentavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    for (let i = 1; i <= 6; i++) {
        const elementoMes = document.getElementById('mes' + i);

        if (elementoMes.value.trim() !== "") {
            qtdBoletos++;
            let valorSIA = Math.round(lerValor('mes' + i) * 100);
            totalFaturadoCentavos += valorSIA;

            let valorEsperadoNesteMes = valorIntegralBase;

            [percBolsa1, percBolsa2, percBolsa3, percBolsa4, percBolsa5].forEach((perc, idx) => {
                const numBolsa = idx + 1;
                if (perc > 0 && document.getElementById(`b${numBolsa}_m${i}`).checked) {
                    valorEsperadoNesteMes = valorEsperadoNesteMes * (1 - (perc / 100));
                }
            });

        
            valorEsperadoNesteMes += valorParcelaLeve;

            let esperadoCentavos = Math.round(valorEsperadoNesteMes * 100);
            totalCorretoCentavos += esperadoCentavos;

            let diferencaNesteMes = valorSIA - esperadoCentavos;
            if (diferencaNesteMes > 0) {
                detalhesCredito.push(`boleto ${i}`);
            }
        }
    }

    if (qtdBoletos === 0) {
        alert("Preencha pelo menos um mês faturado no SIA.");
        return;
    }

    const diferencaCentavos = totalFaturadoCentavos - totalCorretoCentavos;
    const diferencaFinal = diferencaCentavos / 100;

    let textoAcao = "";
    let corFundo = "";
    let corTexto = "";

    if (diferencaFinal > 0) {
        textoAcao = "Lançar Crédito";
        corFundo = "rgba(46, 213, 115, 0.2)";
        corTexto = "#2ed573";
    } else if (diferencaFinal < 0) {
        textoAcao = "Lançar Débito";
        corFundo = "rgba(255, 71, 87, 0.2)";
        corTexto = "#ff4757";
    } else if (diferencaFinal === 0) {
        textoAcao = "Sem ação a ser feita";
        corFundo = "rgba(0, 191, 255, 0.2)";
        corTexto = "#00bfff";
    }

    document.getElementById('resQtdBoletos').innerText = qtdBoletos;
    document.getElementById('resFaturado').innerText = formatarMoeda(totalFaturadoCentavos);
    document.getElementById('resCorreto').innerText = formatarMoeda(totalCorretoCentavos);

    const sinalDiferenca = diferencaFinal < 0 ? "-" : (diferencaFinal > 0 ? "+" : "");
    document.getElementById('valorDiferenca').innerText = sinalDiferenca + formatarMoeda(diferencaCentavos);
    document.getElementById('valorDiferenca').style.color = corTexto;

    document.getElementById('textoAcao').innerText = textoAcao;
    document.getElementById('caixaAcao').style.backgroundColor = corFundo;
    document.getElementById('caixaAcao').style.color = corTexto;
    document.getElementById('caixaAcao').style.border = `1px solid ${corTexto}`;

    const detalheElement = document.getElementById('detalheCredito');
    if (diferencaFinal > 0) {
        detalheElement.innerHTML = `O crédito de <strong>${formatarMoeda(diferencaCentavos)}</strong> precisa ser lançado referente ao <strong>${detalhesCredito.join(', ')}</strong>.`;
        detalheElement.style.display = "block";
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
        document.getElementById('bolsa' + b).value = "";
        document.getElementById(`b${b}_todos`).checked = false;

        const checkboxes = document.querySelectorAll(`.check-b${b}`);
        checkboxes.forEach(box => box.checked = false);
    }
}
