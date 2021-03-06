function DIAGRAMACAO(){}
/* ----------- CONSOLE SALVAR COMO ARQUIVO ----------- */
(function(console){
console.save = function(data, filename){
	if(!data) {
		console.error('Console.save: No data');
		return;
	}
	if(!filename) filename = 'console.json';
	if(typeof data === "object"){
		data = JSON.stringify(data, undefined, 4);
	}
	var blob = new Blob([data], {type: 'text/json'}),
		e    = document.createEvent('MouseEvents'),
		a    = document.createElement('a');
	a.download = filename;
	a.href = window.URL.createObjectURL(blob);
	a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':');
	e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
	a.dispatchEvent(e);
 }
})(console);
/* --///////- http://bgrins.github.io/devtools-snippets/#console-save -\\\\\\\-- */
DIAGRAMACAO.prototype.removerElementos = function(elementos){
	if(typeof(elementos) !== "undefined" && elementos !== null){
		if(elementos.length === 1 || typeof(elementos.length) === "undefined"){
			elementos.outerHTML = "";
		}else{
			for(var cont = 0; cont < elementos.length; cont++){
				elementos[cont].outerHTML = "";
			}
		}
	}
};
DIAGRAMACAO.prototype.removerSecoesNaoConteudo = function(){
	/* Remoção de todo conteúdo do word até a primeira seção de conteúdo real */
	var divWordSection = document.querySelectorAll('div[class^="WordSection"]');
	var allElements = document.querySelectorAll('body > *');
	for(var cont = 0; cont < allElements.length; cont++){
		if(allElements[cont] != divWordSection[divWordSection.length-1]){
			allElements[cont].outerHTML="";
		 }
	}
	/* Remoção de todos os elementos da primeira seção até o primeiro título H1 de conteúdo*/
	var firstH1 = document.querySelector('div[class^="WordSection"] > h1');
	allElements = document.querySelectorAll('div[class^="WordSection"] > *');
	for(cont = 0; cont < allElements.length; cont++){
		if(allElements[cont] != firstH1){
			allElements[cont].outerHTML="";
		}else{
			break;
		}
	}
};
DIAGRAMACAO.prototype.criarOnFigures = function(){
	/* Captura das legendas das figuras e aribuição destas na criação das tags on-figure*/
	var legendasFiguras = document.querySelectorAll('.Figura ~ p[class^="MsoCaption"]');
	var textoLegenda = "";
	for(var cont = 0; cont < legendasFiguras.length; cont++){
		/*Se parte da legenda é a primeira seguida pela parte do meio*/
		if(legendasFiguras[cont].classList.contains("MsoCaption") || (legendasFiguras[cont].classList.contains("MsoCaptionCxSpFirst") && typeof(legendasFiguras[cont+1]) !== "undefined" && legendasFiguras[cont+1].classList.contains("MsoCaptionCxSpMiddle"))){
			textoLegenda = ((legendasFiguras[cont].textContent.substring(((legendasFiguras[cont].textContent.indexOf("–"))), legendasFiguras[cont].textContent.length)).replace("–", "").trim() + " " + legendasFiguras[cont+1].textContent.trim()).trim();
			legendasFiguras[cont].outerHTML = '<on-figure img="assets/public/on-image-.jpg" description="' + textoLegenda + '"></on-figure>';
		}else{
			/*Se parte da legenda  não é seguida pela parte do meio*/
			/*Se é a primeira e se é seguida pela última*/
			if(legendasFiguras[cont].classList.contains("MsoCaption") || (legendasFiguras[cont].classList.contains("MsoCaptionCxSpFirst") && typeof(legendasFiguras[cont+1]) !== "undefined" && legendasFiguras[cont+1].classList.contains("MsoCaptionCxSpLast"))){
				textoLegenda = (legendasFiguras[cont].textContent.substring(((legendasFiguras[cont].textContent.indexOf("–"))), legendasFiguras[cont].textContent.length)).replace("–", "").trim();
				legendasFiguras[cont].outerHTML = '<on-figure img="assets/public/on-image-.jpg" description="' + textoLegenda + '"></on-figure>';
			}
		}
	}	
};
DIAGRAMACAO.prototype.removerFiguras = function(){
	/* Remoção das figuras presentes no word */
	var figuras = document.querySelectorAll(".Figura, img");
	this.removerElementos(figuras);
};
DIAGRAMACAO.prototype.removerFontesFiguras = function(){
	/* Remoção das fontes de figuras presentes no word */
	var fontesFiguras = document.querySelectorAll(".FonteFigura");
	this.removerElementos(fontesFiguras);
};
DIAGRAMACAO.prototype.criarOnCodes = function(){
	if(!document.querySelectorAll(".Cdigo-fonte").length){
		return;
	}
	/* Captura das legendas de códigos fontes e atribuição destas na criação dos onCodes junto com seus conteúdos*/
	var codigos = "";
	var tabelas = document.querySelectorAll('div[class^="WordSection"]:last-child TABLE');
	var legendasTabelas = document.querySelectorAll('div[class^="WordSection"]:last-child TABLE + p[class^="MsoCaption"]');
	/* null = opção não selecionada, 0 = nome do onCode é sua própria legenda, 1 = nome do onCode é onCode seguido pelo sue número */
	var opcaoNome = null;
	var nomeOnCode = "";
	for(var cont = 0; cont < tabelas.length; cont++){
		if(tabelas[cont].getElementsByClassName("Cdigo-fonte").length && (legendasTabelas[cont].textContent.trim().toLowerCase().indexOf("código fonte") === 0 || legendasTabelas[cont].textContent.trim().toLowerCase().indexOf("código-fonte") === 0)){
			if(opcaoNome === null){
				opcaoNome = parseInt(window.prompt("Digite 0 para colocar a legenda do código como seu nome ou 1 para colocar seu número:"));	
				if(opcaoNome !== 0 && opcaoNome !== 1){
					var msgErro = "Opção inválida para nomeação de onCode. Padrão de nomeá-lo por sua legenda.";
					console.log(msgErro); 
					alert(msgErro);
				}
			}
			nomeOnCode = (opcaoNome ? ("onCode" + (cont+1)) : (legendasTabelas[cont].innerHTML.replace(/ *\<a[^)]*\/a> */, "").replace(/\d/g, "").replace(/– /, "").trim()));
			codigos += ('"' + nomeOnCode + '": ' + '`' + tabelas[cont].textContent + '`,\n');
		}
	}
	if(codigos !== ""){
		console.save(codigos, "codigos_" + document.title + ".txt");
	}
};
DIAGRAMACAO.prototype.removerTabelasCodigos = function(){
	/* Remoção das tabelas presentes no word */
	var tabelas = document.querySelectorAll('TABLE');
	for(var cont = 0; cont < tabelas.length; cont++){
		if(tabelas[cont].innerHTML.indexOf('class="Cdigo-fonte"') !== -1){
			tabelas[cont].outerHTML = '<on-code-box> <on-code [code]="onCodes[' + "''" + ']" identifier=" "></on-code></on-code-box>';
		}		
	}
};
DIAGRAMACAO.prototype.removerLegendas = function(){
	/* Remoção das legendas de figuras códigos e tabelas*/ 
	var legendas = document.querySelectorAll('.MsoCaption, .MsoCaptionCxSpFirst, .MsoCaptionCxSpMiddle, .MsoCaptionCxSpLast');
	this.removerElementos(legendas);
};
DIAGRAMACAO.prototype.removerEspacosEmBranco = function(elementos){
	/* Remoção das tags de espaço em branco */
	for(var cont = 0; cont < elementos.length; cont++){
		/* Verificação das tags que não possuem nenhum conteúdo além de espaço em branco */
		if(elementos[cont].textContent.trim() === ""){
			elementos[cont].outerHTML = "";
		}
	}
};
DIAGRAMACAO.prototype.removerNaoConteudoTitulos = function(titulos){
	/* Remover o que não for conteúdo utilizável das tags H1, H2, H3 */
	for(cont = 0; cont < titulos.length; cont++){
		titulos[cont].innerHTML = titulos[cont].textContent;
	}	
};
DIAGRAMACAO.prototype.removerAtributosTags = function(){
	/* Remover todos os atributos das tags de conteúdo */
	allElements = document.querySelectorAll('body *');
	for(cont = 0; cont < allElements.length; cont++){
		allElements[cont].removeAttribute("class");
		allElements[cont].removeAttribute("style");
		allElements[cont].removeAttribute("align");
		allElements[cont].removeAttribute("width");
		allElements[cont].removeAttribute("height");
		allElements[cont].removeAttribute("border");
		allElements[cont].removeAttribute("cellspacing");
		allElements[cont].removeAttribute("cellpadding");
		allElements[cont].removeAttribute("valign");
	}
};
DIAGRAMACAO.prototype.atribuirTextContent = function(elementos){
	if(typeof(elementos) !== "undefined" && elementos !== null){
		if(elementos.length === 1 || typeof(elementos.length) === "undefined"){
			elementos.outerHTML = elementos.textContent;
		}else{
			for(var cont = 0; cont < elementos.length; cont++){
				elementos[cont].outerHTML = elementos[cont].textContent;
			}
		}
	}
};
DIAGRAMACAO.prototype.removerWingdings = function(){
	var wingdings = document.querySelectorAll('span[style="font-family:Wingdings"]');
	this.removerElementos(wingdings);
}; 
DIAGRAMACAO.prototype.removerGlossario = function(){
	var elementos = document.querySelectorAll('body *');
	var titulos = document.getElementsByTagName("H1");
	var tabelaGlossario = null;
	for(var cont = 0; cont < elementos.length; cont++){
		if(elementos[cont].outerHTML.indexOf("<h1") === 0 && elementos[cont] == titulos[titulos.length-1]){
			if(elementos[cont].textContent.trim().toLowerCase() == "glossário" || elementos[cont].textContent.trim().toLowerCase() == "glossario"){
				elementos[cont].outerHTML="";
				tabelaGlossario = cont;
				for(; tabelaGlossario < elementos.length; tabelaGlossario++){
					if(elementos[tabelaGlossario].outerHTML.indexOf("<table") === 0){
						elementos[tabelaGlossario].outerHTML="";
					}
				}				
			}
		}
	}		
}; 
DIAGRAMACAO.prototype.removerComentarios = function(){
	var comentarios = document.querySelectorAll(".MsoCommentReference");
	this.removerElementos(comentarios);		
};
DIAGRAMACAO.prototype.removerBr = function(){
	var br = document.querySelectorAll("BR");
	this.removerElementos(br);		
};
DIAGRAMACAO.prototype.init = function(){
	this.criarOnCodes();
	this.removerComentarios();
	this.removerBr();	
	this.removerGlossario();
	this.removerSecoesNaoConteudo();
	this.criarOnFigures();
	this.removerFiguras();
	this.removerFontesFiguras();
	this.removerTabelasCodigos();
	this.removerLegendas();
	this.removerWingdings();
		
	var titulos = document.querySelectorAll('H1');
	this.removerNaoConteudoTitulos(titulos);
	titulos = document.querySelectorAll('H2');
	this.removerNaoConteudoTitulos(titulos);
	titulos = document.querySelectorAll('H3');
	this.removerNaoConteudoTitulos(titulos);
	var spans = document.querySelectorAll('P SPAN');
	this.atribuirTextContent(spans);
	var tagsU = document.querySelectorAll('U');
	this.atribuirTextContent(tagsU);	
	var tagsA = document.querySelectorAll('a');
	this.atribuirTextContent(tagsA);
	
	
	var espacos = document.querySelectorAll('.MsoBodyText');
	this.removerEspacosEmBranco(espacos);
	espacos = document.querySelectorAll('.MsoBibliography');
	this.removerEspacosEmBranco(espacos);
	espacos = document.querySelectorAll('.MsoNormal');
	this.removerEspacosEmBranco(espacos);
	espacos = document.querySelectorAll('p');
	this.removerEspacosEmBranco(espacos);	
		
	this.removerAtributosTags();
	var documentTitle = document.title;
	var conteudoHTML = document.getElementsByTagName("HTML")[0].innerHTML = document.querySelector("DIV").innerHTML;
	console.save(conteudoHTML, "" + documentTitle + ".txt");	
};
(function(){var d = new DIAGRAMACAO(); d.init();})();
/* Gabriel Tessarini */


//function DIAGRAMACAO(){}/* ----------- CONSOLE SALVAR COMO ARQUIVO ----------- */(function(console){console.save=function(data, filename){if(!data){console.error('Console.save: No data');return;}if(!filename) filename='console.json';if(typeof data==="object"){data=JSON.stringify(data, undefined, 4);}var blob=new Blob([data],{type: 'text/json'}),e=document.createEvent('MouseEvents'),a=document.createElement('a');a.download=filename;a.href=window.URL.createObjectURL(blob);a.dataset.downloadurl=['text/json', a.download, a.href].join(':');e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);a.dispatchEvent(e);}})(console);/* --///////- http://bgrins.github.io/devtools-snippets/#console-save -\\\\\\\-- */DIAGRAMACAO.prototype.removerElementos=function(elementos){if(typeof(elementos) !=="undefined" && elementos !==null){if(elementos.length===1 || typeof(elementos.length)==="undefined"){elementos.outerHTML="";}else{for(var cont=0; cont < elementos.length; cont++){elementos[cont].outerHTML="";}}}};DIAGRAMACAO.prototype.removerSecoesNaoConteudo=function(){/* Remoção de todo conteúdo do word até a primeira seção de conteúdo real */var divWordSection=document.querySelectorAll('div[class^="WordSection"]');var allElements=document.querySelectorAll('body > *');for(var cont=0; cont < allElements.length; cont++){if(allElements[cont] !=divWordSection[divWordSection.length-1]){allElements[cont].outerHTML="";}}/* Remoção de todos os elementos da primeira seção até o primeiro título H1 de conteúdo*/var firstH1=document.querySelector('div[class^="WordSection"] > h1');allElements=document.querySelectorAll('div[class^="WordSection"] > *');for(cont=0; cont < allElements.length; cont++){if(allElements[cont] !=firstH1){allElements[cont].outerHTML="";}else{break;}}};DIAGRAMACAO.prototype.criarOnFigures=function(){/* Captura das legendas das figuras e aribuição destas na criação das tags on-figure*/var legendasFiguras=document.querySelectorAll('.Figura ~ p[class^="MsoCaption"]');var textoLegenda="";for(var cont=0; cont < legendasFiguras.length; cont++){/*Se parte da legenda é a primeira seguida pela parte do meio*/if(legendasFiguras[cont].classList.contains("MsoCaption") || (legendasFiguras[cont].classList.contains("MsoCaptionCxSpFirst") && typeof(legendasFiguras[cont+1]) !=="undefined" && legendasFiguras[cont+1].classList.contains("MsoCaptionCxSpMiddle"))){textoLegenda=((legendasFiguras[cont].textContent.substring(((legendasFiguras[cont].textContent.indexOf("–"))), legendasFiguras[cont].textContent.length)).replace("–", "").trim() + " " + legendasFiguras[cont+1].textContent.trim()).trim();legendasFiguras[cont].outerHTML='<on-figure img="assets/public/on-image-.jpg" description="' + textoLegenda + '"></on-figure>';}else{/*Se parte da legenda não é seguida pela parte do meio*//*Se é a primeira e se é seguida pela última*/if(legendasFiguras[cont].classList.contains("MsoCaption") || (legendasFiguras[cont].classList.contains("MsoCaptionCxSpFirst") && typeof(legendasFiguras[cont+1]) !=="undefined" && legendasFiguras[cont+1].classList.contains("MsoCaptionCxSpLast"))){textoLegenda=(legendasFiguras[cont].textContent.substring(((legendasFiguras[cont].textContent.indexOf("–"))), legendasFiguras[cont].textContent.length)).replace("–", "").trim();legendasFiguras[cont].outerHTML='<on-figure img="assets/public/on-image-.jpg" description="' + textoLegenda + '"></on-figure>';}}}};DIAGRAMACAO.prototype.removerFiguras=function(){/* Remoção das figuras presentes no word */var figuras=document.querySelectorAll(".Figura, img");this.removerElementos(figuras);};DIAGRAMACAO.prototype.removerFontesFiguras=function(){/* Remoção das fontes de figuras presentes no word */var fontesFiguras=document.querySelectorAll(".FonteFigura");this.removerElementos(fontesFiguras);};DIAGRAMACAO.prototype.criarOnCodes=function(){if(!document.querySelectorAll(".Cdigo-fonte").length){return;}/* Captura das legendas de códigos fontes e atribuição destas na criação dos onCodes junto com seus conteúdos*/var codigos="";var tabelas=document.querySelectorAll('div[class^="WordSection"]:last-child TABLE');var legendasTabelas=document.querySelectorAll('div[class^="WordSection"]:last-child TABLE + p[class^="MsoCaption"]');/* null=opção não selecionada, 0=nome do onCode é sua própria legenda, 1=nome do onCode é onCode seguido pelo sue número */var opcaoNome=null;var nomeOnCode="";for(var cont=0; cont < tabelas.length; cont++){if(tabelas[cont].getElementsByClassName("Cdigo-fonte").length && (legendasTabelas[cont].textContent.trim().toLowerCase().indexOf("código fonte")===0 || legendasTabelas[cont].textContent.trim().toLowerCase().indexOf("código-fonte")===0)){if(opcaoNome===null){opcaoNome=parseInt(window.prompt("Digite 0 para colocar a legenda do código como seu nome ou 1 para colocar seu número:"));if(opcaoNome !==0 && opcaoNome !==1){var msgErro="Opção inválida para nomeação de onCode. Padrão de nomeá-lo por sua legenda.";console.log(msgErro); alert(msgErro);}}nomeOnCode=(opcaoNome ? ("onCode" + (cont+1)) : (legendasTabelas[cont].innerHTML.replace(/ *\<a[^)]*\/a> */, "").replace(/\d/g, "").replace(/– /, "").trim()));codigos +=('"' + nomeOnCode + '": ' + '`' + tabelas[cont].textContent + '`,\n');}}if(codigos !==""){console.save(codigos, "codigos_" + document.title + ".txt");}};DIAGRAMACAO.prototype.removerTabelasCodigos=function(){/* Remoção das tabelas presentes no word */var tabelas=document.querySelectorAll('TABLE');for(var cont=0; cont < tabelas.length; cont++){if(tabelas[cont].innerHTML.indexOf('class="Cdigo-fonte"') !==-1){tabelas[cont].outerHTML='<on-code-box> <on-code [code]="onCodes[' + "''" + ']" identifier=" "></on-code></on-code-box>';}}};DIAGRAMACAO.prototype.removerLegendas=function(){/* Remoção das legendas de figuras códigos e tabelas*/ var legendas=document.querySelectorAll('.MsoCaption, .MsoCaptionCxSpFirst, .MsoCaptionCxSpMiddle, .MsoCaptionCxSpLast');this.removerElementos(legendas);};DIAGRAMACAO.prototype.removerEspacosEmBranco=function(elementos){/* Remoção das tags de espaço em branco */for(var cont=0; cont < elementos.length; cont++){/* Verificação das tags que não possuem nenhum conteúdo além de espaço em branco */if(elementos[cont].textContent.trim()===""){elementos[cont].outerHTML="";}}};DIAGRAMACAO.prototype.removerNaoConteudoTitulos=function(titulos){/* Remover o que não for conteúdo utilizável das tags H1, H2, H3 */for(cont=0; cont < titulos.length; cont++){titulos[cont].innerHTML=titulos[cont].textContent;}};DIAGRAMACAO.prototype.removerAtributosTags=function(){/* Remover todos os atributos das tags de conteúdo */allElements=document.querySelectorAll('body *');for(cont=0; cont < allElements.length; cont++){allElements[cont].removeAttribute("class");allElements[cont].removeAttribute("style");allElements[cont].removeAttribute("align");allElements[cont].removeAttribute("width");allElements[cont].removeAttribute("height");allElements[cont].removeAttribute("border");allElements[cont].removeAttribute("cellspacing");allElements[cont].removeAttribute("cellpadding");allElements[cont].removeAttribute("valign");}};DIAGRAMACAO.prototype.atribuirTextContent=function(elementos){if(typeof(elementos) !=="undefined" && elementos !==null){if(elementos.length===1 || typeof(elementos.length)==="undefined"){elementos.outerHTML=elementos.textContent;}else{for(var cont=0; cont < elementos.length; cont++){elementos[cont].outerHTML=elementos[cont].textContent;}}}};DIAGRAMACAO.prototype.removerWingdings=function(){var wingdings=document.querySelectorAll('span[style="font-family:Wingdings"]');this.removerElementos(wingdings);}; DIAGRAMACAO.prototype.removerGlossario=function(){var elementos=document.querySelectorAll('body *');var titulos=document.getElementsByTagName("H1");var tabelaGlossario=null;for(var cont=0; cont < elementos.length; cont++){if(elementos[cont].outerHTML.indexOf("<h1")===0 && elementos[cont]==titulos[titulos.length-1]){if(elementos[cont].textContent.trim().toLowerCase()=="glossário" || elementos[cont].textContent.trim().toLowerCase()=="glossario"){elementos[cont].outerHTML="";tabelaGlossario=cont;for(; tabelaGlossario < elementos.length; tabelaGlossario++){if(elementos[tabelaGlossario].outerHTML.indexOf("<table")===0){elementos[tabelaGlossario].outerHTML="";}}}}}}; DIAGRAMACAO.prototype.removerComentarios=function(){var comentarios=document.querySelectorAll(".MsoCommentReference");this.removerElementos(comentarios);};DIAGRAMACAO.prototype.removerBr=function(){var br=document.querySelectorAll("BR");this.removerElementos(br);};DIAGRAMACAO.prototype.init=function(){this.criarOnCodes();this.removerComentarios();this.removerBr();this.removerGlossario();this.removerSecoesNaoConteudo();this.criarOnFigures();this.removerFiguras();this.removerFontesFiguras();this.removerTabelasCodigos();this.removerLegendas();this.removerWingdings();var titulos=document.querySelectorAll('H1');this.removerNaoConteudoTitulos(titulos);titulos=document.querySelectorAll('H2');this.removerNaoConteudoTitulos(titulos);titulos=document.querySelectorAll('H3');this.removerNaoConteudoTitulos(titulos);var spans=document.querySelectorAll('P SPAN');this.atribuirTextContent(spans);var tagsU=document.querySelectorAll('U');this.atribuirTextContent(tagsU);var tagsA=document.querySelectorAll('a');this.atribuirTextContent(tagsA);var espacos=document.querySelectorAll('.MsoBodyText');this.removerEspacosEmBranco(espacos);espacos=document.querySelectorAll('.MsoBibliography');this.removerEspacosEmBranco(espacos);espacos=document.querySelectorAll('.MsoNormal');this.removerEspacosEmBranco(espacos);espacos=document.querySelectorAll('p');this.removerEspacosEmBranco(espacos);this.removerAtributosTags();var documentTitle=document.title;var conteudoHTML=document.getElementsByTagName("HTML")[0].innerHTML=document.querySelector("DIV").innerHTML;console.save(conteudoHTML, "" + documentTitle + ".txt");};(function(){var d=new DIAGRAMACAO(); d.init();})();/* Gabriel Tessarini */