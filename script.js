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
// CONTROLE DO POP-UP 
// ==========================================
function fecharModal() {
    document.getElementById('modalFluxograma').style.display = 'none';
}

function validarAcesso() {
    const checkboxes = document.querySelectorAll('.fluxo-check');
    let todosMarcados = true;
    
    checkboxes.forEach(cb => {
        if (!cb.checked) todosMarcados = false;
    });

    if (!todosMarcados) {
        alert("Você precisa confirmar todos os passos do fluxograma para liberar a calculadora.");
        return;
    }

    fecharModal();
}

// ==========================================
// LÓGICA DE AUDITORIA
// ==========================================
function auditarSemestralidade() {
    const valorMensalidade = lerValorSeguro('valorMensalidade');

    // Impede o cálculo se o valor base não estiver preenchido
    if (valorMensalidade === 0) {
        alert("Por favor, preencha o valor correto da mensalidade (Referência).");
        return;
    }

    let qtdBoletos = 0;
    let totalFaturado = 0;

    
    for (let i = 1; i <= 6; i++) {
        const elementoMes = document.getElementById('mes' + i);
        if (elementoMes && elementoMes.value.trim() !== "") {
            qtdBoletos++;
            totalFaturado += lerValorSeguro('mes' + i);
        }
    }

    if (qtdBoletos === 0) {
        alert("Por favor, preencha pelo menos uma mensalidade faturada no SIA.");
        return;
    }

    const totalCorreto = valorMensalidade * qtdBoletos;

    let diferenca = totalFaturado - totalCorreto;
    diferenca = Math.round(diferenca * 100) / 100;

    // Lógica de Ação
    let textoAcao = "";
    let corFundo = "";
    let corTexto = "";

    if (diferenca > 0) {
        textoAcao = "Lançar Crédito";
        corFundo = "rgba(46, 213, 115, 0.2)"; 
        corTexto = "#085729"; 
    } else if (diferenca < 0) {
        textoAcao = "Ajuste faturado a menor";
        corFundo = "rgba(255, 71, 87, 0.2)"; 
        corTexto = "#940c30"; 
    } else if (diferenca === 0) {
        textoAcao = "Sem ação a ser feita";
        corFundo = "rgba(0, 191, 255, 0.2)"; 
        corTexto = "#0220ff"; 
    }

    // Formatação e Atualização da Interface
    const formatarMoeda = (valor) => Math.abs(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    document.getElementById('resQtdBoletos').innerText = qtdBoletos;
    document.getElementById('resFaturado').innerText = totalFaturado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('resCorreto').innerText = totalCorreto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    const sinalDiferenca = diferenca < 0 ? "-" : (diferenca > 0 ? "+" : "");
    document.getElementById('valorDiferenca').innerText = sinalDiferenca + formatarMoeda(diferenca);
    document.getElementById('valorDiferenca').style.color = corTexto;

    document.getElementById('textoAcao').innerText = textoAcao;
    document.getElementById('caixaAcao').style.backgroundColor = corFundo;
    document.getElementById('caixaAcao').style.color = corTexto;
    document.getElementById('caixaAcao').style.border = `1px solid ${corTexto}`;

    document.getElementById('resultado').style.display = "block";
}

function limparTudo() {
    document.getElementById('valorMensalidade').value = "";
    for (let i = 1; i <= 6; i++) {
        document.getElementById('mes' + i).value = "";
    }
    document.getElementById('resultado').style.display = "none";
}
