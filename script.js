function lerValorSeguro(id) {
    const elemento = document.getElementById(id);
    if (!elemento || elemento.value.trim() === "") {
        return 0; 
    }
    let campo = elemento.value.trim();
    campo = campo.replace(/\./g, '').replace(',', '.');
    return parseFloat(campo);
}

// ==========================================
// CONTROLE DOS POP-UPS 
// ==========================================
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

// ==========================================
// LÓGICA DE AUDITORIA E CÁLCULO
// ==========================================
function auditarSemestralidade() {
    const valorMensalidadeBase = lerValorSeguro('valorMensalidade');

    if (valorMensalidadeBase === 0) {
        alert("Por favor, preencha o valor correto da mensalidade (Referência).");
        return;
    }

    const valorMensalidadeCentavos = Math.round(valorMensalidadeBase * 100);

    let qtdBoletos = 0;
    let totalFaturadoCentavos = 0;
    let detalhesCredito = []; 
    
    const formatarMoeda = (valorEmCentavos) => {
        return Math.abs(valorEmCentavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    for (let i = 1; i <= 6; i++) {
        const elementoMes = document.getElementById('mes' + i);
        if (elementoMes && elementoMes.value.trim() !== "") {
            let valorDesteMesBase = lerValorSeguro('mes' + i);
            let valorDesteMesCentavos = Math.round(valorDesteMesBase * 100);
            
            qtdBoletos++;
            totalFaturadoCentavos += valorDesteMesCentavos;

            let diferencaNesteMesCentavos = valorDesteMesCentavos - valorMensalidadeCentavos;
            
            if (diferencaNesteMesCentavos > 0) {
                detalhesCredito.push(`boleto ${i}`);
            }
        }
    }

    if (qtdBoletos === 0) {
        alert("Por favor, preencha pelo menos uma mensalidade faturada no SIA.");
        return;
    }

    const totalCorretoCentavos = valorMensalidadeCentavos * qtdBoletos;
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
    
    if (diferencaFinal > 0 && detalhesCredito.length > 0) {
        detalheElement.innerHTML = `O crédito de <strong>${formatarMoeda(diferencaCentavos)}</strong> precisa ser lançado referente ao <strong>${detalhesCredito.join(', ')}</strong>.`;
        detalheElement.style.display = "block";
    } else {
        if (detalheElement) detalheElement.style.display = "none";
    }

    document.getElementById('modalResultado').style.display = "flex";
}

function limparTudo() {
    document.getElementById('valorMensalidade').value = "";
    for (let i = 1; i <= 6; i++) {
        document.getElementById('mes' + i).value = "";
    }
}
