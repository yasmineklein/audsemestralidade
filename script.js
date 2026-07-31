// Função auxiliar para tratar vírgulas e campos vazios (Estava faltando)
function lerValorSeguro(id) {
    const elemento = document.getElementById(id);
    if (!elemento || elemento.value.trim() === "") {
        return 0; 
    }
    let campo = elemento.value.trim();
    campo = campo.replace(/\./g, '').replace(',', '.');
    return parseFloat(campo);
}

function auditarSemestralidade() {
    // 1. Pega os parâmetros de cobrança
    const valorMensalidade = lerValorSeguro('valorMensalidade');
    let qtdBoletos = parseInt(document.getElementById('qtdBoletos').value);

    // Validação da quantidade de boletos
    if (isNaN(qtdBoletos) || qtdBoletos < 1 || qtdBoletos > 6) {
        alert("Por favor, informe uma quantidade válida de boletos gerados (1 a 6).");
        return;
    }

    // 2. Soma as mensalidades faturadas no SIA até o limite de boletos gerados
    let totalFaturado = 0;
    for (let i = 1; i <= qtdBoletos; i++) {
        totalFaturado += lerValorSeguro('mes' + i);
    }

    // 3. Calcula o total correto esperado para os meses gerados
    const totalCorreto = valorMensalidade * qtdBoletos;

    // 4. Calcula a diferença (Faturado - Correto)
    let diferenca = totalFaturado - totalCorreto;
    diferenca = Math.round(diferenca * 100) / 100;

    // 5. Aplicação da Lógica de Ação
    let textoAcao = "";
    let corFundo = "";
    let corTexto = "";

    if (diferenca > 0) {
        textoAcao = "Lançar Crédito";
        corFundo = "rgba(46, 213, 115, 0.2)"; 
        corTexto = "#2ed573"; 
    } else if (diferenca < 0) {
        textoAcao = "Lançar Débito";
        corFundo = "rgba(255, 71, 87, 0.2)"; 
        corTexto = "#ff4757"; 
    } else if (diferenca === 0) {
        textoAcao = "Sem ação a ser feita";
        corFundo = "rgba(0, 191, 255, 0.2)"; 
        corTexto = "#00bfff"; 
    }

    // 6. Formatação e Atualização da Interface
    const formatarMoeda = (valor) => Math.abs(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    document.getElementById('resFaturado').innerText = totalFaturado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('resCorreto').innerText = totalCorreto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    // Mostra o sinal visualmente
    const sinalDiferenca = diferenca < 0 ? "-" : (diferenca > 0 ? "+" : "");
    document.getElementById('valorDiferenca').innerText = sinalDiferenca + formatarMoeda(diferenca);
    document.getElementById('valorDiferenca').style.color = corTexto;

    // Aplica o status da ação
    document.getElementById('textoAcao').innerText = textoAcao;
    document.getElementById('caixaAcao').style.backgroundColor = corFundo;
    document.getElementById('caixaAcao').style.color = corTexto;
    document.getElementById('caixaAcao').style.border = `1px solid ${corTexto}`;

    document.getElementById('resultado').style.display = "block";
}

function limparTudo() {
    document.getElementById('valorMensalidade').value = "";
    document.getElementById('qtdBoletos').value = "6"; // Retorna ao padrão
    for (let i = 1; i <= 6; i++) {
        document.getElementById('mes' + i).value = "";
    }
    document.getElementById('resultado').style.display = "none";
}