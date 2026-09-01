"use strict";

const BIRTH_YEAR = 2000;
const BIRTH_MONTH = 10;
const BIRTH_DAY = 4;
const BIRTH_HOUR = 12;
const BIRTH_MINUTE = 16;
const COFFEE_ORACLE_REFERENCE_YEAR = 2000;
const MILLISECONDS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const MILLISECONDS_PER_DAY =
  MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY;
const NAME_VARIATIONS = [
  "amanda",
  "nana",
  "niasguts",
  "nia",
  "vito corleone de saia",
  "diabo loiro",
  "demonio de porto alegre",
  "barista de porto alegre",
  "don corleone de saia",
  "pobre lazarenta",
  "fernando collor de calcinha",
];
const DISPLAY_NAME_MAX_LENGTH = 32;
const DISPLAY_NAME_LONG_THRESHOLD = 24;
const COFFEE_ORACLE_MESSAGES = Object.freeze([
  // Janeiro: 31 mensagens.
  "Ano novo, fortuna antiga: o café renasceu, a riqueza ainda está carregando.",
  "A crema formou uma coroa; infelizmente, era só espuma com autoestima.",
  "Hoje Nana estará rica em cafeína e perigosamente pobre em bom senso.",
  "O coador aponta para o norte, onde aparentemente também não há dinheiro.",
  "Gojo previu cinco fichas e um elogio; o extrato ficou fora da visão.",
  "A nanaBet promete glória, mas o tigrinho já reservou o último espresso.",
  "Marin aprova o visual de milionária; o orçamento continua em modo cosplay.",
  "Uma moeda imaginária cairá no café. Não tente contabilizá-la.",
  "O universo recomenda torra média e expectativas financeiras baixíssimas.",
  "A riqueza passou por Porto Alegre, viu a fila do café e seguiu viagem.",
  "Hoje o latte art será perfeito e qualquer plano de enriquecimento, abstrato.",
  "O tigrinho sonhou com um jackpot e acordou abraçado numa xícara vazia.",
  "Presságio do dia: três cafés, duas ideias ruins e nenhum patrimônio novo.",
  "A calculadora pediu férias depois de estimar quando Nana ficará rica.",
  "A espuma desenhou um cifrão. Foi a contribuição financeira do leite.",
  "Gojo diz que Nana merece o mundo; a nanaBet oferece efeitos especiais.",
  "O caixa fechou certo, o cabelo está lindo e a fortuna continua em análise.",
  "Hoje a sorte virá moída na hora e será servida sem valor monetário.",
  "Um espresso duplo resolverá tudo, exceto a parte de ficar rica.",
  "A lua está em cappuccino, posição conhecida por causar compras de café.",
  "O oráculo viu ouro no horizonte; era o pacote metalizado dos grãos.",
  "Nana vencerá uma discussão e perderá para o preço de um docinho.",
  "A fortuna enviou um áudio de dois segundos e apagou antes de ser ouvido.",
  "O tigrinho está confiante demais. Proteja as fichas e o café.",
  "Hoje toda riqueza será emocional, aromática e impossível de sacar.",
  "Marin recomenda rosa, dourado e absoluta negação da planilha.",
  "O destino oferece um café grátis, desde que alguém imaginário pague.",
  "A cafeteira fará barulho de caixa registradora, sem produzir receita.",
  "Gojo trouxe esperança; o boleto trouxe documentação complementar.",
  "A previsão indica ganhos expressivos em charme e zero em liquidez.",
  "Janeiro termina com a conta pequena, valente e bem cafeinada.",

  // Fevereiro: 29 mensagens.
  "Fevereiro começa curto, mas ainda encontra tempo para negar a riqueza.",
  "Uma flor de latte surgirá; o dinheiro, tímido, não aparecerá na foto.",
  "Nana terá sorte no amor ao café e azar em qualquer gráfico financeiro.",
  "O tigrinho ensaiou uma dança de vitória sem verificar o resultado.",
  "Hoje o espresso será intenso como a vontade de ignorar responsabilidades.",
  "Gojo promete cuidar da Nana; a conta bancária não fez a mesma promessa.",
  "O oráculo detectou uma oportunidade: pedir o café antes que esfrie.",
  "A fortuna está em manutenção e deixou um cappuccino como desculpa.",
  "Marin escolheu o look perfeito para gastar uma riqueza inexistente.",
  "O leite vaporizado prevê nuvens, espuma e nenhuma chuva de dinheiro.",
  "A nanaBet viu três presentes; o universo viu três caixas vazias.",
  "Hoje Nana será diretora executiva do próprio intervalo para o café.",
  "O café coado lentamente trará clareza sobre decisões que serão ignoradas.",
  "Gojo enviará carinho suficiente para compensar qualquer saldo sem graça.",
  "Uma ficha poderá brilhar muito; isso continua não sendo investimento.",
  "O tigrinho beberá o café e culpará a volatilidade do mercado.",
  "A previsão financeira foi substituída por um desenho de xícara.",
  "Hoje a coragem vem em dose curta, quente e sem rendimentos.",
  "O caixa do universo está fechado para balanço e para Nana.",
  "Marin diz que confiança é o melhor acessório; ainda não aceita Pix.",
  "A sorte chegará atrasada porque parou para tomar um espresso.",
  "Nana encontrará riqueza entre duas xícaras: era apenas açúcar.",
  "O oráculo recomenda não discutir probabilidades com um tigre dançante.",
  "Um aroma promissor invadirá o ambiente e não pagará nenhuma conta.",
  "Gojo aprova todas as respostas, menos 'já fiquei rica'.",
  "Hoje haverá lucro líquido, se líquido significar café filtrado.",
  "A fortuna piscou para Nana e entrou no ônibus errado.",
  "Fevereiro fecha com espuma alta e expectativas devidamente aterradas.",
  "Dia raro, previsão rara: Nana quase ficou rica num ano que mal existe.",

  // Março: 31 mensagens.
  "Março chega marchando, mas a fortuna continua sentada tomando café.",
  "O vento de Porto Alegre trouxe aroma de grãos e levou qualquer orçamento.",
  "A moagem está fina; a chance de riqueza, ainda mais fina.",
  "Hoje Nana ganhará respeito, cafeína e um recibo muito comprido.",
  "Gojo prevê uma resposta correta e cinco fichas com valor sentimental.",
  "O tigrinho consultou as estrelas e cobrou a consulta em espresso.",
  "Marin escolheu tons de milionária para um saldo minimalista.",
  "Uma ideia brilhante surgirá depois do café e sumirá antes da planilha.",
  "O coado de hoje terá notas de chocolate e decisões questionáveis.",
  "A riqueza está a caminho, mas aparentemente escolheu entrega econômica.",
  "Nana dominará o vaporizador e será derrotada por uma tampa de copo.",
  "O universo mandou economizar; a cafeteria lançou um grão novo.",
  "A crema está estável, ao contrário do plano financeiro do dia.",
  "Gojo oferece apoio ilimitado e nenhuma consultoria contábil.",
  "A nanaBet acendeu todas as luzes para anunciar absolutamente nada.",
  "Hoje a xícara estará meio cheia e a carteira coerentemente meio vazia.",
  "O tigrinho fará charme até alguém esquecer que ele tomou a última ficha.",
  "Uma chuva de sorte está prevista, com baixa acumulação de patrimônio.",
  "Marin aprova a pose; o banco solicita menos confiança e mais números.",
  "O café gelado chega primeiro, seguido por uma responsabilidade quente.",
  "Nana encontrará um tesouro: o biscoito esquecido ao lado da máquina.",
  "O oráculo vê uma promoção, provavelmente de cappuccino.",
  "Hoje o dinheiro falará baixo e a cafeteira responderá gritando.",
  "Gojo garante que Nana já é preciosa; a riqueza material segue opcional.",
  "Três símbolos quase combinarão, por educação e nada além disso.",
  "A sorte foi moída grossa demais e passou direto pelo filtro.",
  "Nana terá uma vitória pequena, elegante e coberta de espuma.",
  "O destino pediu café sem açúcar e recebeu uma dívida doce.",
  "A lua cheia iluminará o extrato sem melhorar o conteúdo.",
  "O tigrinho promete responsabilidade logo depois desta dancinha.",
  "Março termina; a fortuna não veio, mas o café rendeu bem.",

  // Abril: 30 mensagens.
  "O oráculo disse SIM. Primeiro de abril; a resposta oficial continua NÃO.",
  "A verdade voltou: café forte, Nana linda e riqueza ausente.",
  "Hoje uma ficha aparecerá onde ninguém deixou nenhuma.",
  "Gojo ensinará matemática, mas evitará a divisão do patrimônio zero.",
  "A chuva combina com café e com planos financeiros adiados.",
  "O tigrinho trocará uma previsão ruim por duas igualmente decorativas.",
  "Marin recomenda um acessório dourado para confundir os credores imaginários.",
  "Nana terá energia de CEO e orçamento de intervalo de quinze minutos.",
  "A cafeteira prevê pressão alta, temperatura exata e lucro nenhum.",
  "O universo trouxe troco, mas era de uma compra que ainda será feita.",
  "Hoje o latte art parecerá um mapa até a riqueza; ele termina na borda.",
  "Gojo diz para confiar no processo. O processo pediu outro espresso.",
  "A nanaBet exibirá brilho suficiente para esconder qualquer estatística.",
  "Uma boa notícia chegará acompanhada de uma conta pequena.",
  "O tigrinho encontrou a fortuna e gastou tudo em iluminação rosa.",
  "Nana acertará o ponto do leite e errará o horário de dormir.",
  "O café de hoje tem corpo, doçura e nenhuma obrigação tributária.",
  "A riqueza fez check-in em Porto Alegre e cancelou a reserva.",
  "Marin prevê elogios; o extrato prevê silêncio respeitoso.",
  "O destino deixará uma ficha na mesa e levará duas expectativas.",
  "Hoje Nana ficará rica em histórias que parecem mentira porque são.",
  "Gojo sorri no horizonte; atrás dele, a planilha pega fogo discretamente.",
  "A crema formará um círculo perfeito, sem qualquer poder de compra.",
  "O oráculo recomenda cautela com tigres que conhecem probabilidades.",
  "Uma brisa trará cheiro de café e nenhuma documentação bancária.",
  "A sorte aceita pedidos até as seis, mas não garante entrega.",
  "Nana descobrirá que economizar café reduz muito a felicidade.",
  "O tigrinho declara falência emocional e pede colo.",
  "A lua está favorável para cappuccino e hostil para planilhas.",
  "Abril se despede com saldo de charme amplamente positivo.",

  // Maio: 31 mensagens.
  "Maio começa com café passado e fortuna passada direto por Nana.",
  "O oráculo prevê uma riqueza tão discreta que ninguém conseguirá encontrá-la.",
  "Hoje Gojo dará atenção premium sem cobrança de mensalidade.",
  "A nanaBet está otimista; isso nunca foi um bom sinal para as fichas.",
  "Marin aprova a maquiagem e reprova a sobriedade do orçamento.",
  "Nana servirá excelência em uma xícara e caos no restante do dia.",
  "O tigrinho contará até três e esquecerá por que começou.",
  "A espuma do leite guardará um segredo que vale exatamente nada.",
  "Hoje a fortuna virá em grãos e exigirá moagem adequada.",
  "O café será curto; a lista de vontades continuará longa.",
  "Gojo prevê cinco acertos e uma distração causada pelo próprio Gojo.",
  "A carteira respirou fundo antes de entrar na cafeteria.",
  "O universo recomenda investir tempo em beber o café ainda quente.",
  "Uma luz dourada cercará Nana; será o reflexo da máquina de espresso.",
  "O tigrinho promete devolver tudo em forma de coreografia.",
  "Hoje o coado terá sabor de vitória administrativa.",
  "Marin diz que repetir roupa economiza; Nana finge não ouvir.",
  "A riqueza perdeu o endereço, mas o entregador trouxe um cookie.",
  "O oráculo encontrou estabilidade no fundo de uma caneca pesada.",
  "Nana terá uma ideia milionária que prefere permanecer anônima.",
  "A nanaBet tocará uma fanfarra para celebrar o gasto de uma ficha.",
  "Gojo oferece proteção contra contas, exceto as que chegam por e-mail.",
  "O café da tarde trará paz até alguém mencionar dinheiro.",
  "A sorte vai sorrir, pedir um gole e desaparecer.",
  "Hoje uma cereja na roleta terá mais confiança que o planejamento inteiro.",
  "O tigrinho vestirá postura profissional por quase quatro segundos.",
  "Nana dominará o dia com uma colher pequena e ambição enorme.",
  "A crema desenhou uma seta apontando para outro café.",
  "Marin prevê fotos lindas e recibos cuidadosamente fora do enquadramento.",
  "O destino não trouxe riqueza, mas acertou a temperatura da bebida.",
  "Maio fecha a conta: muitos cafés, pouco ouro e excelente presença.",

  // Junho: 30 mensagens.
  "Junho abre frio; o café aquece, o patrimônio observa de longe.",
  "Nana será rica em cobertores e pobre em vontade de sair.",
  "O oráculo prevê vapor, neblina e um boleto usando cachecol.",
  "Gojo traz calor humano; a cafeteira cuida do restante.",
  "A nanaBet acendeu uma lareira virtual para queimar probabilidades.",
  "Hoje o tigrinho dançará para espantar o frio e as fichas.",
  "Marin escolheu camadas; a conta bancária escolheu se esconder.",
  "O espresso chegará quente e a fortuna continuará congelada.",
  "Nana encontrará conforto numa xícara maior que o orçamento.",
  "A espuma prevê um inverno de decisões financeiramente criativas.",
  "Gojo corrigirá a matemática e elogiará até os números negativos.",
  "O universo enviou uma promoção de café como teste de caráter.",
  "Hoje a riqueza será medida em meias quentes e doses duplas.",
  "O tigrinho afirma que o frio altera as chances. Ele inventou isso agora.",
  "A sorte baterá à porta, verá a temperatura e voltará para casa.",
  "Nana fará latte art com precisão e planos com entusiasmo.",
  "A máquina de espresso produzirá pressão suficiente para todo o mês.",
  "Marin prevê um casaco perfeito e nenhum bolso cheio.",
  "O café coado terá notas de caramelo e responsabilidade adiada.",
  "Gojo diz que Nana merece férias; a fortuna não respondeu ao formulário.",
  "A nanaBet oferece luzes quentes e resultados friamente previsíveis.",
  "Hoje um presente misterioso conterá outro mistério menor.",
  "O oráculo recomenda abraçar a caneca, não a planilha.",
  "Nana terá sorte suficiente para encontrar a tomada mais próxima.",
  "O tigrinho derrubará uma ficha e chamará isso de estratégia.",
  "A lua de inverno favorece café extra e compras nada extras.",
  "Marin ilumina o dia; o saldo prefere permanecer no escuro.",
  "A riqueza mandou lembranças de um lugar com clima melhor.",
  "Hoje o espresso será pequeno, poderoso e economicamente neutro.",
  "Junho termina aquecido por café e expectativas moderadas.",

  // Julho: 31 mensagens.
  "Julho começa com a fortuna de férias e a cafeteira de plantão.",
  "O tigrinho colocou óculos escuros para não encarar as probabilidades.",
  "Nana terá um dia brilhante, embora o brilho não seja ouro.",
  "Gojo prevê tranquilidade depois de uma conta simples e um café difícil.",
  "A nanaBet declarou temporada de presentes rigorosamente misteriosos.",
  "Marin recomenda confiança suficiente para entrar sem olhar o preço.",
  "Hoje a espuma ficará tão bonita que merecerá um salário próprio.",
  "O oráculo encontrou moedas no sofá; todas pertencem a outra dimensão.",
  "Nana vencerá o sono por decisão unânime da cafeína.",
  "A riqueza prometeu voltar depois do recesso e não deixou contato.",
  "O café de hoje terá acidez cítrica e consequências suaves.",
  "Gojo aprova o esforço, mesmo quando a calculadora não colabora.",
  "O tigrinho fará uma pirueta para distrair da ausência de reembolso.",
  "Marin prevê um dia cor-de-rosa com detalhes em dívida imaginária.",
  "A sorte virá embrulhada, mas esquecerá de trazer conteúdo.",
  "Nana encontrará equilíbrio segurando café em cada mão.",
  "A cafeteira emitirá três bipes proféticos e um pedido de limpeza.",
  "Hoje a nanaBet estará 100% confiante e 0% responsável.",
  "O universo recomenda uma pausa antes da próxima excelente má ideia.",
  "Gojo aparecerá na imaginação com cinco fichas e cabelo impecável.",
  "A crema indica caminhos; todos terminam no balcão da cafeteria.",
  "O tigrinho viu um diamante e perguntou se dava para trocar por café.",
  "Nana será promovida a baronesa honorária do espresso duplo.",
  "A fortuna cabe numa xícara hoje, mas a xícara está vazia.",
  "Marin diz que o segredo é combinar o look com a falta de planejamento.",
  "O oráculo prevê uma surpresa gentil e um recibo agressivo.",
  "A lua ilumina uma ficha solitária pedindo decisões melhores.",
  "Hoje o café terá aroma de produtividade que talvez nunca aconteça.",
  "Gojo oferece um elogio raro; raro mesmo seria um rendimento.",
  "A riqueza passou de casaco e não reconheceu Nana na rua.",
  "Julho termina com cafeína acumulada e patrimônio em fase conceitual.",

  // Agosto: 31 mensagens.
  "Agosto começa longo, ideal para adiar a riqueza com bastante calma.",
  "Nana terá trinta e uma oportunidades de pedir só mais um café.",
  "O tigrinho prevê vento forte vindo da direção das fichas.",
  "Gojo resolveu a equação: carinho infinito dividido por conta nenhuma.",
  "Marin recomenda dourado para manifestar uma riqueza cenográfica.",
  "A nanaBet prepara um espetáculo onde o orçamento é o figurante.",
  "Hoje a máquina de espresso falará mais alto que qualquer conselho.",
  "O oráculo encontrou um futuro próspero atrás de uma mancha de café.",
  "Nana vencerá a preguiça por poucos pontos e muita cafeína.",
  "A sorte virá de ônibus, descerá uma parada antes e mandará mensagem.",
  "Gojo promete repetir a explicação até a riqueza entender.",
  "O tigrinho organizará as fichas por cor e perderá a contagem.",
  "Hoje o café terá notas de frutas e uma nota fiscal surpreendente.",
  "Marin prevê acessórios caros; o oráculo sugere apenas admirar.",
  "A fortuna está tímida, mas a espuma vai aparecer bastante.",
  "Nana descobrirá uma nova forma de chamar pausa de reunião estratégica.",
  "A nanaBet mostrará um sete que se recusa a assumir compromisso.",
  "O coador segura os grãos; alguém precisa segurar as expectativas.",
  "Gojo diz que cinco de cinco já conta como riqueza acadêmica.",
  "O universo oferecerá uma chance única de lavar a própria caneca.",
  "Hoje o tigrinho terá energia de campeão e histórico de suspeito.",
  "Marin transforma qualquer corredor em passarela, menos o do banco.",
  "Nana receberá um sinal claro: a luz da cafeteira acendeu.",
  "A riqueza tentou ligar, mas o celular estava no silencioso.",
  "O café será equilibrado; a agenda fará oposição.",
  "O oráculo prevê uma tarde doce com cobertura de improviso.",
  "Gojo trará respostas; o dinheiro continuará fazendo perguntas.",
  "A nanaBet oferece mistério suficiente para preencher três rolos.",
  "Hoje uma ficha terá uma jornada curta e cinematográfica.",
  "O tigrinho acusa o mês de ser longo demais para poucas dancinhas.",
  "Agosto termina; Nana sobreviveu rica em experiência não conversível.",

  // Setembro: 30 mensagens.
  "Setembro traz flores, café fresco e finanças ainda em botão.",
  "Nana verá beleza no latte e ameaça no valor da sobremesa.",
  "O oráculo prevê primavera no humor e inverno no patrimônio.",
  "Gojo colherá elogios enquanto o tigrinho planta confusão.",
  "Marin recomenda cores claras para iluminar números pequenos.",
  "A nanaBet colocou flores no gabinete; as chances não mudaram.",
  "Hoje a fortuna florescerá num vaso que pertence a outra pessoa.",
  "A cafeteira anuncia a estação com um jato de vapor dramático.",
  "Nana terá sorte com plantas que não exigem planilha.",
  "O tigrinho oferecerá uma cereja como plano de aposentadoria.",
  "Gojo prevê cinco fichas e uma primavera inteira de carinho.",
  "A riqueza brotou, mas alguém confundiu com um grão de café.",
  "Hoje o espresso terá aroma floral e comportamento imprevisível.",
  "Marin montará um look capaz de valorizar até um cupom vencido.",
  "O universo recomenda regar sonhos e não derramar o coado.",
  "Nana encontrará uma pétala no balcão e chamará de bônus.",
  "A nanaBet prevê três flores; o tigrinho trouxe três presentes.",
  "O oráculo viu um jardim de oportunidades fechado para manutenção.",
  "Gojo garante que errar faz parte; perder ficha também, segundo o tigre.",
  "Hoje a espuma crescerá mais rápido que qualquer investimento fictício.",
  "Marin diz que brilho combina com tudo, inclusive com absoluta pobreza.",
  "A sorte deixará perfume de café e nenhuma pista adicional.",
  "Nana dominará a arte de parecer ocupada enquanto espera o espresso.",
  "O tigrinho plantou uma ficha esperando colher duas. Não conte a ele.",
  "A primavera chegou; a riqueza pediu mais alguns meses.",
  "Gojo trará uma equação fácil e um sorriso difícil de ignorar.",
  "Hoje o café gelado e o quente discutirão pela prioridade.",
  "A fortuna mandou flores sem cartão e sem valor declarado.",
  "O oráculo recomenda aproveitar a luz e ignorar o extrato.",
  "Setembro acaba florido, aromático e financeiramente consistente no NÃO.",

  // Outubro: 31 mensagens.
  "Outubro abre com café solene e expectativas usando roupa de festa.",
  "O tigrinho preparou confete, mas ainda não sabe para qual resultado.",
  "Gojo ensaia parabéns enquanto Nana finge não contar os minutos.",
  "Aniversário da Nana: mais maravilhosa, mais experiente e ainda não rica.",
  "O oráculo prevê bolo, café e uma riqueza totalmente decorativa.",
  "Marin escolheu o look da festa; o orçamento escolheu não comparecer.",
  "Hoje a nanaBet dará parabéns com luzes e cobrará uma ficha pelo show.",
  "Nana encontrará uma vela extra e fará um pedido financeiramente ousado.",
  "A fortuna enviou presente sem nota; dentro havia mais esperança.",
  "Gojo promete uma aula particular e atenção integral.",
  "O café de hoje terá gosto de comemoração fora de época.",
  "O tigrinho escondeu o bolo atrás dos rolos e esqueceu o plano.",
  "Marin prevê fotos lindas, luz perfeita e nenhum patrocinador.",
  "Nana será rica em sobras de doce por aproximadamente duas horas.",
  "A crema desenhou balões, ou talvez fossem apenas círculos.",
  "O universo recomenda celebrar qualquer vitória que caiba numa xícara.",
  "Gojo trouxe cinco fichas embrulhadas em elogios.",
  "Hoje a riqueza usará fantasia e ninguém descobrirá quem ela é.",
  "A nanaBet decorou o gabinete; as probabilidades vieram de preto.",
  "O oráculo prevê um susto: o preço de um café especial.",
  "Nana dominará o terror de encontrar a máquina em limpeza.",
  "O tigrinho jura que aquele barulho foi fantasma, não engrenagem.",
  "Marin aprova qualquer fantasia que tenha detalhes dourados.",
  "A lua cheia iluminará uma caneca esquecida na mesa.",
  "Gojo aparece no corredor e assusta apenas a concentração.",
  "Hoje o café será tão escuro quanto o futuro do último boleto.",
  "A fortuna bateu na porta fantasiada de entregador e foi embora.",
  "Nana encontrará coragem no fundo da segunda xícara.",
  "O tigrinho praticará um rugido assustador com voz de desenho.",
  "A nanaBet promete doces; entrega símbolos com ótima iluminação.",
  "Outubro termina com travessuras, café e patrimônio fantasma.",

  // Novembro: 30 mensagens.
  "Novembro chega discreto, como a riqueza tentando não ser cobrada.",
  "Nana terá um café honesto e uma previsão completamente suspeita.",
  "O tigrinho abriu uma reunião para discutir por que ninguém confia nele.",
  "Gojo prevê tranquilidade, desde que a matemática não envolva juros.",
  "Marin escolheu brilho suficiente para antecipar as festas.",
  "A nanaBet fará manutenção preventiva depois de perder a prevenção.",
  "Hoje a fortuna estará em modo avião e o espresso, em modo turbo.",
  "O oráculo recomenda revisar prioridades depois do próximo café.",
  "Nana achará uma ficha no bolso de uma roupa que não tem bolsos.",
  "A crema terá formato de nuvem, sem chuva de dinheiro prevista.",
  "Gojo elogia a persistência; o tigrinho chama de cliente recorrente.",
  "O universo oferecerá silêncio até a máquina começar a moer.",
  "Hoje Marin aprova o estilo e desaprova a iluminação do extrato.",
  "A riqueza marcou presença como talvez e saiu antes da chamada.",
  "Nana fará um café tão bom que esquecerá de querer ser milionária por um minuto.",
  "O tigrinho promete transparência atrás de três cilindros girando.",
  "A nanaBet encontrou estabilidade apoiando o gabinete na parede.",
  "O oráculo viu cinco fichas; Gojo provavelmente está por perto.",
  "Hoje o coado terá doçura natural e despesas artificiais.",
  "Marin prevê um elogio inesperado e uma compra muito esperada.",
  "Nana transformará cansaço em café com eficiência industrial.",
  "A fortuna está reservando energia para dezembro.",
  "Gojo diz que toda pergunta tem resposta; esta continua sendo NÃO.",
  "O tigrinho fará contas usando as próprias listras como ábaco.",
  "Hoje uma cereja surgirá longe demais das outras duas.",
  "O café trará foco suficiente para notar a falta de foco financeiro.",
  "A sorte fará escala em Porto Alegre e perderá a conexão.",
  "Nana receberá aplausos do vaporizador e vai aceitar.",
  "O universo recomenda guardar forças, não necessariamente dinheiro.",
  "Novembro fecha sem fortuna, mas com a xícara devidamente limpa.",

  // Dezembro: 31 mensagens.
  "Dezembro chegou com luzes douradas e orçamento em modo econômico.",
  "O tigrinho pediu presente antes de explicar o que fez com as fichas.",
  "Nana terá espírito festivo e uma fatura igualmente animada.",
  "Gojo prevê férias, carinho e cinco contas resolvidas na matemática.",
  "Marin montou um look de festa que parece mais rico que o oráculo.",
  "A nanaBet pendurou luzes; agora cada derrota pisca em três cores.",
  "Hoje o café terá canela e uma vaga sensação de planejamento.",
  "A fortuna está embrulhada, mas esqueceram de escrever o destinatário.",
  "Nana encontrará uma moeda de chocolate e respeitará sua utilidade.",
  "O oráculo recomenda presentes feitos com afeto e orçamento alheio imaginário.",
  "Gojo aparece sob as luzes e toda planilha perde importância.",
  "O tigrinho ensaiará uma música sem autorização para adicionar áudio.",
  "Hoje a crema parecerá neve para quem tiver muita boa vontade.",
  "Marin prevê brilho, fotos e uma sacola que não será comentada.",
  "A riqueza mandou cartão de boas festas sem endereço de retorno.",
  "Nana sobreviverá ao mês graças a café e calendários acabando.",
  "A nanaBet promete um milagre festivo, sujeito às mesmas probabilidades.",
  "O universo oferece uma pausa entre dois espressos igualmente necessários.",
  "Gojo embrulhou cinco fichas e esqueceu de esconder o sorriso.",
  "O tigrinho declara que comportamento conta como presente. Ele está nervoso.",
  "Hoje o café será compartilhado e a fortuna continuará individualmente ausente.",
  "Nana encontrará alegria numa sobremesa que cabia no orçamento ontem.",
  "Marin aprova o dourado; o banco prefere tons neutros e silêncio.",
  "A véspera traz café, luzes e nenhuma confirmação oficial de riqueza.",
  "O oráculo prevê cinco fichas perto de alguém de cabelo branco.",
  "A última semana chega com energia de sexta e saldo de segunda.",
  "O tigrinho guardou uma cereja para a ceia e perdeu as outras duas.",
  "Hoje a fortuna fará retrospectiva sem cenas inéditas.",
  "Nana encerrará pendências ou mudará seus nomes para metas futuras.",
  "O penúltimo café do ano será seguido por vários cafés não contabilizados.",
  "Fim do ano: Nana não ficou rica, mas acumulou café, histórias e cinco fichas.",
]);
const CASINO_ART_ROOT = "assets/images/casino/";
const PRIZE_CARD_ROOT = CASINO_ART_ROOT + "prize-cards/";
const MYSTERY_PRIZE_CARD_SOURCE =
  PRIZE_CARD_ROOT + "card-verso-misterioso.png";
const CASINO_NORMAL_SYMBOLS = [
  {
    character: "☕",
    label: "café",
    imageSource: CASINO_ART_ROOT + "symbol-coffee.png",
  },
  {
    character: "🐯",
    label: "tigre",
    imageSource: CASINO_ART_ROOT + "symbol-tiger.png",
  },
  {
    character: "💎",
    label: "diamante",
    imageSource: CASINO_ART_ROOT + "symbol-diamond.png",
  },
  {
    character: "🍒",
    label: "cerejas",
    imageSource: CASINO_ART_ROOT + "symbol-cherries.png",
  },
  {
    character: "7",
    label: "sete",
    imageSource: CASINO_ART_ROOT + "symbol-seven.png",
  },
];
const CASINO_PRIZE_SYMBOL = {
  character: "🎁",
  label: "presente",
  imageSource: CASINO_ART_ROOT + "symbol-gift.png",
};
const SLOT_SYMBOLS = [
  ...CASINO_NORMAL_SYMBOLS,
  CASINO_PRIZE_SYMBOL,
];
const CASINO_PRIZES = [
  {
    id: "esposa-nenepira",
    name: "esposa do nenepira",
    cardSource: PRIZE_CARD_ROOT + "card-esposa-nenepira.png",
  },
  {
    id: "prima-vaper",
    name: "pé da prima do vaper",
    cardSource: PRIZE_CARD_ROOT + "card-pe-prima-vaper.png",
  },
  {
    id: "bolos",
    name: "bólos",
    cardSource: PRIZE_CARD_ROOT + "card-bolos.png",
  },
  {
    id: "350-reais",
    name: "355 reais + juros",
    cardSource: PRIZE_CARD_ROOT + "card-355-reais-juros.png",
  },
  {
    id: "lanche-subway",
    name: "lanche do subway",
    cardSource: PRIZE_CARD_ROOT + "card-lanche-subway.png",
  },
];
const ACHIEVEMENTS_STORAGE_KEY = "niasguts-achievements-v1";
const CASINO_TOKENS_STORAGE_KEY = "niasguts-casino-fichas-v1";
const CASINO_BAIT_STORAGE_KEY = "niasguts-casino-bait-v1";
const ACHIEVEMENT_CHEAT_CODE = "gojopelado";
const INITIAL_CASINO_TOKENS = 5;
const INITIAL_REEL_SYMBOL_INDICES = [0, 1, 4];
const CASINO_REEL_FULL_TURNS = [5, 6, 7];
const CASINO_REEL_DURATIONS_MS = [1400, 1750, 2100];
const CASINO_SETTLE_DELAY_MS = 180;
const CASINO_RESULT_FLASH_DURATION_MS = 2000;
const CASINO_PRIZE_CHANCE = 0.125;
const CLASSROOM_QUESTION_COUNT = 5;
const CLASSROOM_REWARD_TOKENS = 5;
const CLASSROOM_TYPE_INTERVAL_MS = 28;
const CLASSROOM_INTRO_LINES = [
  "Então você ficou sem fichas, Nana? Tudo bem. Vem cá, eu cuido de você.",
  "Se for uma boa garota e responder cinco perguntinhas corretamente, eu te dou cinco fichas.",
  "Não precisa ficar nervosa. Eu vou estar aqui com você em cada uma delas.",
];
const CLASSROOM_CORRECT_LINES = [
  "Muito bem, Nana. Eu sabia que você conseguiria.",
  "Isso mesmo, boa garota. Continue assim para mim.",
  "Perfeita. Você fica ainda mais adorável quando se concentra.",
  "Exatamente. Estou orgulhoso de você, Nana.",
  "Cinco de cinco. Você foi uma ótima garota, Nana. Como prometido, estas cinco fichas são suas.",
];
const CLASSROOM_POSE_SOURCES = {
  neutral: "assets/images/gojo/gojo-neutral.png",
  caring: "assets/images/gojo/gojo-caring.png",
  teaching: "assets/images/gojo/gojo-teaching.png",
  praise: "assets/images/gojo/gojo-praise.png",
  reassuring: "assets/images/gojo/gojo-reassuring.png",
  reward: "assets/images/gojo/gojo-reward.png",
};
const CLASSROOM_INTRO_POSES = ["caring", "neutral", "reassuring"];
const RELEASES_PER_PAGE = 3;
const DRAMATIC_NO_RESET_DELAY_MS = 3000;
const DRAMATIC_NO_STEPS = Object.freeze([
  "consultando o saldo...",
  "chamando a auditoria da nanaBet...",
  "revistando o cofrinho e a jarra de gorjetas...",
  "pedindo uma segunda opinião ao tigrinho...",
  "VERIFICAMOS NOVAMENTE: NÃO.",
]);
const CERTIFICATE_CANVAS_WIDTH = 1600;
const CERTIFICATE_CANVAS_HEIGHT = 1131;
const CERTIFICATE_FILE_NAME = "certificado-oficial-de-nao-riqueza.png";
const CASINO_FAILURE_MESSAGES = [
  "quase! mas o tigrinho ficou com tudo.",
  "a banca venceu. continua não rica.",
  "deu green... para a casa.",
  "o prêmio foi um café imaginário.",
  "resultado oficial: zero reais e muita experiência.",
];
const MARIN_GIFS = [
  {
    src: "assets/gifs/marin-chibi.gif",
    sourceUrl: "https://tenor.com/pt-BR/view/my-dress-up-darling-my-dress-up-darling-season-2-marin-kitagawa-my-dress-up-darling-chibi-marin-chibi-gif-15174917057877362565",
    description: "Marin Kitagawa chibi",
    width: 487,
    height: 498,
  },
  {
    src: "assets/gifs/marin-cry.gif",
    sourceUrl: "https://tenor.com/pt-BR/view/marin-cry-marin-sad-marin-kitagawa-marin-kitagawa-gif-24940756",
    description: "Marin Kitagawa chorando",
    width: 640,
    height: 576,
  },
  {
    src: "assets/gifs/marin-love.gif",
    sourceUrl: "https://tenor.com/pt-BR/view/my-dress-up-darling-sono-bisque-doll-wa-koi-wo-suru-sono-bisque-doll-marin-kitagawa-love-gif-5644360806955828657",
    description: "Marin Kitagawa apaixonada",
    width: 426,
    height: 320,
  },
  {
    src: "assets/gifs/marin-bisque.gif",
    sourceUrl: "https://tenor.com/pt-BR/view/marin-marin-kitagawa-kitagawa-bisque-bisque-doll-gif-14798750337503680499",
    description: "Marin Kitagawa em My Dress-Up Darling",
    width: 498,
    height: 281,
  },
  {
    src: "assets/gifs/marin-peak.gif",
    sourceUrl: "https://tenor.com/pt-BR/view/marin-kitagawa-marin-peak-my-dress-up-darling-its-peak-gif-18353529066937443852",
    description: "Marin Kitagawa dizendo que chegou ao auge",
    width: 422,
    height: 498,
  },
  {
    src: "assets/gifs/marin-square.gif",
    sourceUrl: "https://tenor.com/pt-BR/view/marin-kitagawa-gif-2131086954871040042",
    description: "Marin Kitagawa",
    width: 498,
    height: 498,
  },
  {
    src: "assets/gifs/marin-bisque-doll.gif",
    sourceUrl: "https://tenor.com/pt-BR/view/marin-kitagawa-marin-kitagawa-kitagawa-marin-bisque-doll-gif-24693857",
    description: "Marin Kitagawa em Bisque Doll",
    width: 636,
    height: 640,
  },
  {
    src: "assets/gifs/marin-sono-bisque.gif",
    sourceUrl: "https://tenor.com/pt-BR/view/marin-kitagawa-marin-kitagawa-kitagawa-marin-sono-bisque-gif-24864114",
    description: "Marin Kitagawa em Sono Bisque Doll",
    width: 401,
    height: 498,
  },
];
const MOBILE_GIF_MAX_WIDTH_REM = 34;
const mobileGifMediaQuery = window.matchMedia(
  "(max-width: " + MOBILE_GIF_MAX_WIDTH_REM + "rem)",
);
const reducedMotionMediaQuery = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
);

const selectedMarinGifs = [];
const unlockedAchievementIds = new Set();
const classroomPoseCache = new Map();
const casinoSymbolImageCache = new Map();
const loadedCasinoSymbolImages = new Map();
const prizeCardImageCache = new Map();
let pendingCasinoOutcome = [];
let pendingCasinoPrize = null;
let pendingCasinoOutcomeType = "loss";
let pendingAchievementAnimation = null;
let casinoTokenBalance = INITIAL_CASINO_TOKENS;
let casinoTokensArePersistent = true;
let casinoBaitConsumed = false;
let casinoBaitIsPersistent = true;
let achievementsArePersistent = true;
let casinoSpinInProgress = false;
let casinoJackpotOpen = false;
let casinoMusicWanted = true;
let casinoIsOpen = false;
let casinoMusicCommandId = 0;
let casino3D = null;
let shared3DModulePromise = null;
let casino3DLoadPromise = null;
let casinoSymbolImagesPromise = null;
let casino3DFailed = false;
let casinoArtInitialized = false;
let achievementsBackgroundInitialized = false;
let achievementCardsInitialized = false;
let jackpotCardRequestId = 0;
let releasePage = 0;
let selectedName = "";
let displayNameBeforeEdit = "";
let coffeeOracleReading = null;
let dramaticNoStage = 0;
let dramaticNoResetTimerId = null;
let certificateRecord = null;
let certificateBlobPromise = null;
let casinoResultFlashTimerId = null;
let classroomQuestions = [];
let classroomIntroIndex = 0;
let classroomQuestionIndex = 0;
let classroomPhase = "closed";
let classroomTypewriterTimerId = null;
let classroomDialogueFullText = "";
let classroomVisibleCharacterCount = 0;
let classroomIsTyping = false;
let classroomRewardClaimed = false;
let classroomShouldReturnToCasino = false;
let classroomArtInitialized = false;
let classroomPoseRequestId = 0;
let classroomFinaleLoadPromise = null;
let classroomFinaleRequestId = 0;

function loadSavedProgress() {
  // Restore known prizes, a valid chip balance, and the one-time bait state.
  try {
    const savedAchievementJson = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);

    if (savedAchievementJson !== null) {
      let parsedAchievementIds = [];
      try {
        const parsedValue = JSON.parse(savedAchievementJson);
        if (Array.isArray(parsedValue)) {
          parsedAchievementIds = parsedValue;
        }
      } catch {
        // Invalid local data is reset without treating storage as unavailable.
      }

      const knownAchievementIds = [];
      for (const prize of CASINO_PRIZES) {
        if (parsedAchievementIds.includes(prize.id)) {
          unlockedAchievementIds.add(prize.id);
          knownAchievementIds.push(prize.id);
        }
      }
      const sanitizedAchievementJson = JSON.stringify(knownAchievementIds);
      if (sanitizedAchievementJson !== savedAchievementJson) {
        localStorage.setItem(
          ACHIEVEMENTS_STORAGE_KEY,
          sanitizedAchievementJson,
        );
      }
    }
  } catch {
    achievementsArePersistent = false;
  }

  try {
    const savedTokenValue = localStorage.getItem(CASINO_TOKENS_STORAGE_KEY);

    if (savedTokenValue === null) {
      localStorage.setItem(
        CASINO_TOKENS_STORAGE_KEY,
        String(INITIAL_CASINO_TOKENS),
      );
    } else if (/^\d+$/.test(savedTokenValue)) {
      const parsedTokenBalance = Number(savedTokenValue);

      if (Number.isSafeInteger(parsedTokenBalance)) {
        casinoTokenBalance = parsedTokenBalance;
      } else {
        localStorage.setItem(
          CASINO_TOKENS_STORAGE_KEY,
          String(INITIAL_CASINO_TOKENS),
        );
      }
    } else {
      localStorage.setItem(
        CASINO_TOKENS_STORAGE_KEY,
        String(INITIAL_CASINO_TOKENS),
      );
    }
  } catch {
    casinoTokensArePersistent = false;
    casinoTokenBalance = INITIAL_CASINO_TOKENS;
  }

  try {
    casinoBaitConsumed =
      localStorage.getItem(CASINO_BAIT_STORAGE_KEY) === "true";
  } catch {
    casinoBaitIsPersistent = false;
  }
}

loadSavedProgress();

// IANA groups Rio Grande do Sul under the America/Sao_Paulo ruleset.
const PORTO_ALEGRE_TIME_ZONE = "America/Sao_Paulo";
const portoAlegreFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: PORTO_ALEGRE_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});
const coffeeOracleDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: PORTO_ALEGRE_TIME_ZONE,
  day: "numeric",
  month: "long",
});
const certificateDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: PORTO_ALEGRE_TIME_ZONE,
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const counter = document.querySelector("#age-counter");
const counterValues = {
  years: document.querySelector("#years"),
  days: document.querySelector("#days"),
  hours: document.querySelector("#hours"),
  minutes: document.querySelector("#minutes"),
  seconds: document.querySelector("#seconds"),
};
const question = document.querySelector("#question");
const displayNameEditor = document.querySelector("#display-name");
const coffeeOracleButton = document.querySelector("#toggle-coffee-oracle");
const coffeeOraclePanel = document.querySelector("#coffee-oracle-panel");
const coffeeOracleDate = document.querySelector("#coffee-oracle-date");
const coffeeOracleMessage = document.querySelector("#coffee-oracle-message");
const dramaticVerdict = document.querySelector("#dramatic-verdict");
const dramaticNoButton = document.querySelector("#dramatic-no");
const dramaticNoStatus = document.querySelector("#dramatic-no-status");
const certificateDialog = document.querySelector("#certificate-dialog");
const certificateOpenButton = document.querySelector("#open-certificate");
const certificateName = document.querySelector("#certificate-name");
const certificateDate = document.querySelector("#certificate-date");
const certificateProtocol = document.querySelector("#certificate-protocol");
const certificateCanvas = document.querySelector("#certificate-canvas");
const certificateDownloadButton = document.querySelector(
  "#download-certificate",
);
const certificateShareButton = document.querySelector("#share-certificate");
const certificateStatus = document.querySelector("#certificate-status");
const casinoDialog = document.querySelector("#casino-dialog");
const casinoOpenButton = document.querySelector("#open-casino");
const casinoLever = document.querySelector("#spin-casino");
const slotMachine = document.querySelector("#slot-machine");
const casinoMarquee = document.querySelector("#casino-marquee");
const casinoLogo = document.querySelector("#casino-logo");
const casinoCanvas = document.querySelector("#casino-canvas");
const casinoLoading = document.querySelector("#casino-loading");
const casinoReelFallback = document.querySelector("#casino-reel-fallback");
const fallbackReels = document.querySelectorAll(".fallback-reel");
const casinoResult = document.querySelector("#casino-result");
const casinoResultFlash = document.querySelector("#casino-result-flash");
const casinoTokenBalanceElement = document.querySelector(
  "#casino-token-balance",
);
const casinoChipBalance = document.querySelector("#casino-chip-balance");
const casinoChipRule = document.querySelector("#casino-chip-rule");
const casinoGiftRule = document.querySelector("#casino-gift-rule");
const casinoGiftRuleFallback = document.querySelector(
  "#casino-gift-rule-fallback",
);
const casinoTokenStorageNote = document.querySelector(
  "#casino-token-storage-note",
);
const casinoEmpty = document.querySelector("#casino-empty");
const classroomOpenButton = document.querySelector("#open-classroom");
const classroomDialog = document.querySelector("#classroom-dialog");
const classroomScreen = document.querySelector("#classroom-screen");
const classroomProgress = document.querySelector("#classroom-progress");
const classroomDialogueText = document.querySelector(
  "#classroom-dialogue-text",
);
const classroomDialogueAnnouncement = document.querySelector(
  "#classroom-dialogue-announcement",
);
const classroomAnswers = document.querySelector("#classroom-answers");
const classroomAnswerButtons = document.querySelectorAll(".classroom-answer");
const classroomContinue = document.querySelector("#classroom-continue");
const classroomBackgroundPortrait = document.querySelector(
  "#classroom-background-portrait",
);
const classroomBackgroundImage = document.querySelector(
  "#classroom-background-image",
);
const classroomFinale = document.querySelector("#classroom-finale");
const classroomFinalePortrait = document.querySelector(
  "#classroom-finale-portrait",
);
const classroomFinaleImage = document.querySelector(
  "#classroom-finale-image",
);
const classroomArtStatus = document.querySelector("#classroom-art-status");
const classroomCharacter = document.querySelector("#gojo-character");
const casinoJackpot = document.querySelector("#casino-jackpot");
const casinoJackpotBadge = document.querySelector("#casino-jackpot-badge");
const casinoJackpotCard = document.querySelector("#casino-jackpot-card");
const casinoJackpotCardImage = document.querySelector(
  "#casino-jackpot-card-image",
);
const casinoJackpotPrize = document.querySelector("#casino-jackpot-prize");
const casinoJackpotContinue = document.querySelector(
  "#casino-jackpot-continue",
);
const casinoMusic = document.querySelector("#casino-music");
const casinoMusicToggle = document.querySelector("#toggle-casino-music");
const casinoVolume = document.querySelector("#casino-volume");
const achievementsDialog = document.querySelector("#achievements-dialog");
const achievementsOpenButton = document.querySelector("#open-achievements");
const achievementsCount = document.querySelector("#achievements-count");
const achievementsProgress = document.querySelector("#achievements-progress");
const achievementSlots = document.querySelectorAll(".achievement-slot");
const achievementsScreen = document.querySelector("#achievements-screen");
const achievementsBackgroundPortrait = document.querySelector(
  "#achievements-background-portrait",
);
const achievementsBackgroundImage = document.querySelector(
  "#achievements-background-image",
);
const achievementCompletePlaque = document.querySelector(
  "#achievement-complete-plaque",
);
const achievementStorageNote = document.querySelector(
  "#achievement-storage-note",
);
const cheatDialog = document.querySelector("#cheat-dialog");
const cheatForm = document.querySelector("#cheat-form");
const cheatCodeInput = document.querySelector("#cheat-code");
const cheatStatus = document.querySelector("#cheat-status");
const patchNotesDialog = document.querySelector("#patch-notes-dialog");
const releaseEntries = document.querySelectorAll(".release-entry");
const releasePrevious = document.querySelector("#release-previous");
const releaseNext = document.querySelector("#release-next");
const releasePageStatus = document.querySelector("#release-page-status");
const marinGifFrames = document.querySelectorAll(".marin-gif-frame");

function showRandomMarinGifs() {
  // Do not create or request GIF images on small viewports.
  for (const frame of marinGifFrames) {
    frame.replaceChildren();
  }

  if (mobileGifMediaQuery.matches) {
    return;
  }

  if (selectedMarinGifs.length === 0) {
    const firstIndex = Math.floor(Math.random() * MARIN_GIFS.length);
    let secondIndex = Math.floor(Math.random() * (MARIN_GIFS.length - 1));

    if (secondIndex >= firstIndex) {
      secondIndex += 1;
    }

    selectedMarinGifs.push(MARIN_GIFS[firstIndex], MARIN_GIFS[secondIndex]);
  }

  for (let frameIndex = 0; frameIndex < marinGifFrames.length; frameIndex += 1) {
    const gif = selectedMarinGifs[frameIndex];

    if (gif === undefined) {
      continue;
    }

    const link = document.createElement("a");
    link.href = gif.sourceUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", gif.description + " no Tenor");

    const image = document.createElement("img");
    image.src = gif.src;
    image.alt = gif.description;
    image.width = gif.width;
    image.height = gif.height;
    image.decoding = "async";
    link.append(image);
    marinGifFrames[frameIndex].append(link);
  }
}

function saveAchievements() {
  // Persist the known prize IDs while retaining in-memory progress on failure.
  if (!achievementsArePersistent) {
    return;
  }

  try {
    const orderedIds = CASINO_PRIZES
      .filter((prize) => unlockedAchievementIds.has(prize.id))
      .map((prize) => prize.id);
    localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(orderedIds));
  } catch {
    achievementsArePersistent = false;
  }
}

function saveCasinoTokens() {
  // Persist the virtual chip balance while retaining it for the current visit.
  if (!casinoTokensArePersistent) {
    return;
  }

  try {
    localStorage.setItem(
      CASINO_TOKENS_STORAGE_KEY,
      String(casinoTokenBalance),
    );
  } catch {
    casinoTokensArePersistent = false;
  }
}

function randomIntegerInclusive(minimum, maximum) {
  // Keep generated classroom arithmetic integral and easy to read.
  return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

function shuffleClassroomValues(values) {
  // Shuffle a copy so the correct choice does not stay in one position.
  const shuffledValues = [...values];

  for (let index = shuffledValues.length - 1; index > 0; index -= 1) {
    const targetIndex = randomIntegerInclusive(0, index);
    const heldValue = shuffledValues[index];
    shuffledValues[index] = shuffledValues[targetIndex];
    shuffledValues[targetIndex] = heldValue;
  }

  return shuffledValues;
}

function createClassroomChoices(correctAnswer) {
  // Produce two unique, non-negative nearby distractors without retry loops.
  const maximumOffset = Math.max(
    2,
    Math.min(9, Math.ceil((correctAnswer + 1) / 7)),
  );
  const offset = randomIntegerInclusive(1, maximumOffset);
  const candidates = [
    correctAnswer - offset,
    correctAnswer + offset,
    correctAnswer + offset + 1,
    correctAnswer - offset - 1,
  ];
  const distractors = [];

  for (const candidate of candidates) {
    if (
      candidate >= 0 &&
      candidate !== correctAnswer &&
      !distractors.includes(candidate)
    ) {
      distractors.push(candidate);
    }

    if (distractors.length === 2) {
      break;
    }
  }

  let fallbackOffset = 1;
  while (distractors.length < 2) {
    const candidate = correctAnswer + maximumOffset + fallbackOffset;
    if (!distractors.includes(candidate)) {
      distractors.push(candidate);
    }
    fallbackOffset += 1;
  }

  return shuffleClassroomValues([correctAnswer, ...distractors]);
}

function createClassroomQuestion(questionIndex) {
  // Give every lesson all four operations, with a mixed fourth question.
  let expression = "";
  let answer = 0;
  let hint = "";

  if (questionIndex === 0) {
    const left = randomIntegerInclusive(2, 12);
    const right = randomIntegerInclusive(2, 12);
    expression = left + " + " + right;
    answer = left + right;
    hint = "Some os dois números por partes.";
  } else if (questionIndex === 1) {
    const left = randomIntegerInclusive(10, 30);
    const right = randomIntegerInclusive(2, left);
    expression = left + " − " + right;
    answer = left - right;
    hint = "Comece pelo maior número e retire o menor.";
  } else if (questionIndex === 2) {
    const left = randomIntegerInclusive(2, 9);
    const right = randomIntegerInclusive(2, 9);
    expression = left + " × " + right;
    answer = left * right;
    hint = "Pense na multiplicação como uma soma repetida.";
  } else if (questionIndex === 3) {
    const operationIndex = randomIntegerInclusive(0, 2);

    if (operationIndex === 0) {
      const left = randomIntegerInclusive(18, 60);
      const right = randomIntegerInclusive(10, 45);
      expression = left + " + " + right;
      answer = left + right;
      hint = "Separe dezenas e unidades antes de somar.";
    } else if (operationIndex === 1) {
      const left = randomIntegerInclusive(35, 80);
      const right = randomIntegerInclusive(10, 34);
      expression = left + " − " + right;
      answer = left - right;
      hint = "Retire primeiro as dezenas e depois as unidades.";
    } else {
      const left = randomIntegerInclusive(6, 12);
      const right = randomIntegerInclusive(6, 12);
      expression = left + " × " + right;
      answer = left * right;
      hint = "Quebre um dos fatores em partes menores e multiplique.";
    }
  } else {
    const divisor = randomIntegerInclusive(2, 12);
    const quotient = randomIntegerInclusive(2, 12);
    const dividend = divisor * quotient;
    expression = dividend + " ÷ " + divisor;
    answer = quotient;
    hint =
      "Pense em qual número multiplicado por " + divisor +
      " resulta em " + dividend + ".";
  }

  return {
    answer,
    choices: createClassroomChoices(answer),
    expression,
    hint,
    prompt:
      "Pergunta " + (questionIndex + 1) +
      ", Nana: quanto é " + expression + "?",
  };
}

function createClassroomQuestions() {
  // Generate a fresh five-question class whenever the visitor runs out again.
  return Array.from(
    { length: CLASSROOM_QUESTION_COUNT },
    (_, questionIndex) => createClassroomQuestion(questionIndex),
  );
}

function preloadClassroomPose(poseId) {
  // Cache one transparent sprite and its decode promise for flicker-free swaps.
  if (classroomPoseCache.has(poseId)) {
    return classroomPoseCache.get(poseId);
  }

  const source = CLASSROOM_POSE_SOURCES[poseId];
  const image = new Image();
  image.decoding = "async";
  const loaded = new Promise((resolveImage, rejectImage) => {
    image.addEventListener("load", () => resolveImage(image), { once: true });
    image.addEventListener(
      "error",
      () => rejectImage(new Error("Falha ao carregar a pose " + poseId)),
      { once: true },
    );
  });
  const ready = loaded.then(async (loadedImage) => {
    if (typeof loadedImage.decode === "function") {
      try {
        await loadedImage.decode();
      } catch {
        // A successful load remains usable when decode() is unavailable or fails.
      }
    }
    return loadedImage;
  });
  const cachedPose = { image, ready };
  classroomPoseCache.set(poseId, cachedPose);
  image.src = source;
  return cachedPose;
}

function initializeClassroomArt() {
  // Keep every large classroom PNG out of the initial page request.
  if (classroomArtInitialized) {
    return;
  }

  classroomArtInitialized = true;
  classroomBackgroundPortrait.srcset =
    classroomBackgroundPortrait.dataset.srcset;
  classroomBackgroundImage.src = classroomBackgroundImage.dataset.src;

  for (const poseId of Object.keys(CLASSROOM_POSE_SOURCES)) {
    const cachedPose = preloadClassroomPose(poseId);
    void cachedPose.ready.catch(() => {
      // The CSS classroom remains as a functional fallback for a missing sprite.
    });
  }
}

async function showClassroomPose(poseId, { animate = true } = {}) {
  // Keep the previous decoded pose visible until the requested one is ready.
  initializeClassroomArt();
  const requestId = ++classroomPoseRequestId;
  const hasVisiblePose = classroomCharacter.classList.contains("is-visible");

  if (!animate) {
    classroomCharacter.classList.remove("is-entering");
  }

  if (!hasVisiblePose) {
    classroomArtStatus.textContent = "preparando a arte da aula...";
    classroomArtStatus.hidden = false;
  }

  try {
    const cachedPose = preloadClassroomPose(poseId);
    const loadedImage = await cachedPose.ready;

    if (requestId !== classroomPoseRequestId || !classroomDialog.open) {
      return false;
    }

    classroomCharacter.src = loadedImage.src;
    classroomCharacter.dataset.pose = poseId;
    classroomCharacter.classList.remove("is-entering");
    classroomCharacter.classList.add("is-visible");

    if (animate && !reducedMotionMediaQuery.matches) {
      void classroomCharacter.offsetWidth;
      classroomCharacter.classList.add("is-entering");
    }

    classroomArtStatus.hidden = true;
    return true;
  } catch {
    if (
      requestId === classroomPoseRequestId &&
      !classroomCharacter.classList.contains("is-visible")
    ) {
      classroomArtStatus.textContent = "arte indisponível";
      classroomArtStatus.hidden = false;
    }
    return false;
  }
}

function loadClassroomFinaleArt() {
  // Request the orientation-aware CG only after the fifth correct answer.
  if (classroomFinaleLoadPromise !== null) {
    return classroomFinaleLoadPromise;
  }

  classroomFinaleLoadPromise = new Promise((resolveImage, rejectImage) => {
    classroomFinaleImage.addEventListener(
      "load",
      () => resolveImage(classroomFinaleImage),
      { once: true },
    );
    classroomFinaleImage.addEventListener(
      "error",
      () => rejectImage(new Error("Falha ao carregar a CG final")),
      { once: true },
    );
    classroomFinalePortrait.srcset =
      classroomFinalePortrait.dataset.srcset;
    classroomFinaleImage.src = classroomFinaleImage.dataset.src;
  }).then(async (loadedImage) => {
    if (typeof loadedImage.decode === "function") {
      try {
        await loadedImage.decode();
      } catch {
        // A successful load remains usable if decode() is unavailable or fails.
      }
    }
    return loadedImage;
  });

  return classroomFinaleLoadPromise;
}

function waitForClassroomPaint() {
  // Give the hidden decoded CG two painted frames before starting its fade.
  return new Promise((resolvePaint) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(resolvePaint);
    });
  });
}

async function showClassroomFinale(rewardPoseReady = Promise.resolve()) {
  // Keep the reward sprite visible until the full-scene CG is decoded.
  const requestId = ++classroomFinaleRequestId;

  try {
    await Promise.all([rewardPoseReady, loadClassroomFinaleArt()]);

    if (
      requestId !== classroomFinaleRequestId ||
      !classroomDialog.open ||
      classroomPhase !== "reward"
    ) {
      return false;
    }

    classroomFinale.classList.remove("is-visible");
    classroomFinale.hidden = false;

    if (!reducedMotionMediaQuery.matches) {
      await waitForClassroomPaint();

      if (
        requestId !== classroomFinaleRequestId ||
        !classroomDialog.open ||
        classroomPhase !== "reward"
      ) {
        return false;
      }
    }

    classroomFinale.classList.add("is-visible");
    classroomArtStatus.hidden = true;
    return true;
  } catch {
    // The existing reward pose remains the complete visual fallback.
    if (requestId === classroomFinaleRequestId) {
      classroomFinale.classList.remove("is-visible");
      classroomFinale.hidden = true;
    }
    return false;
  }
}

function clearClassroomTypewriter() {
  // Stop a sentence that no longer belongs to the visible lesson state.
  if (classroomTypewriterTimerId !== null) {
    window.clearTimeout(classroomTypewriterTimerId);
    classroomTypewriterTimerId = null;
  }
  classroomIsTyping = false;
}

function renderClassroomInteraction() {
  // Reveal either the three answers or the next native action button.
  if (classroomPhase === "question") {
    const question = classroomQuestions[classroomQuestionIndex];

    for (let index = 0; index < classroomAnswerButtons.length; index += 1) {
      const answerButton = classroomAnswerButtons[index];
      const answerValue = question.choices[index];
      answerButton.textContent = String(answerValue);
      answerButton.dataset.answerValue = String(answerValue);
      answerButton.disabled = false;
    }

    classroomAnswers.hidden = false;
    classroomContinue.hidden = true;
    classroomAnswerButtons[0]?.focus();
    return;
  }

  classroomAnswers.hidden = true;
  classroomContinue.hidden = false;

  if (
    classroomPhase === "intro" &&
    classroomIntroIndex === CLASSROOM_INTRO_LINES.length - 1
  ) {
    classroomContinue.textContent = "COMEÇAR A AULA";
  } else if (classroomPhase === "wrong") {
    classroomContinue.textContent = "TENTAR DE NOVO";
  } else if (classroomPhase === "reward") {
    classroomContinue.textContent = "RECEBER 5 FICHAS";
  } else {
    classroomContinue.textContent = "CONTINUAR";
  }

  if (classroomDialog.open) {
    classroomContinue.focus();
  }
}

function finishClassroomTypewriter() {
  // A first activation reveals the whole sentence instead of skipping it.
  clearClassroomTypewriter();
  classroomVisibleCharacterCount = classroomDialogueFullText.length;
  classroomDialogueText.textContent = classroomDialogueFullText;
  renderClassroomInteraction();
}

function typeNextClassroomCharacter() {
  // Keep visual typing out of the live region to avoid character-by-character speech.
  if (!classroomIsTyping) {
    return;
  }

  classroomVisibleCharacterCount += 1;
  classroomDialogueText.textContent = classroomDialogueFullText.slice(
    0,
    classroomVisibleCharacterCount,
  );

  if (classroomVisibleCharacterCount >= classroomDialogueFullText.length) {
    classroomTypewriterTimerId = null;
    classroomIsTyping = false;
    renderClassroomInteraction();
    return;
  }

  classroomTypewriterTimerId = window.setTimeout(
    typeNextClassroomCharacter,
    CLASSROOM_TYPE_INTERVAL_MS,
  );
}

function showClassroomLine(text) {
  // Announce the complete line once while rendering its visual typewriter effect.
  clearClassroomTypewriter();
  classroomDialogueFullText = text;
  classroomVisibleCharacterCount = 0;
  classroomDialogueText.textContent = "";
  classroomDialogueAnnouncement.textContent = text;
  classroomAnswers.hidden = true;
  classroomContinue.hidden = false;
  classroomContinue.textContent = "CONTINUAR";

  if (classroomDialog.open) {
    classroomContinue.focus();
  }

  if (reducedMotionMediaQuery.matches || text.length === 0) {
    finishClassroomTypewriter();
    return;
  }

  classroomIsTyping = true;
  classroomTypewriterTimerId = window.setTimeout(
    typeNextClassroomCharacter,
    CLASSROOM_TYPE_INTERVAL_MS,
  );
}

function showClassroomIntro() {
  // Present the affectionate setup one sentence at a time.
  classroomPhase = "intro";
  classroomProgress.textContent = "5 perguntas · 5 fichas";
  void showClassroomPose(CLASSROOM_INTRO_POSES[classroomIntroIndex]);
  showClassroomLine(CLASSROOM_INTRO_LINES[classroomIntroIndex]);
}

function showClassroomQuestion() {
  // Reuse the generated question and choices when a wrong answer is retried.
  classroomPhase = "question";
  classroomProgress.textContent =
    "pergunta " + (classroomQuestionIndex + 1) +
    " de " + CLASSROOM_QUESTION_COUNT;
  void showClassroomPose("teaching");
  showClassroomLine(classroomQuestions[classroomQuestionIndex].prompt);
}

function handleClassroomAnswer(answerButton) {
  // A mistake gets a hint and keeps the learner on the same question.
  if (classroomPhase !== "question" || classroomIsTyping) {
    return;
  }

  const question = classroomQuestions[classroomQuestionIndex];
  const selectedAnswer = Number(answerButton.dataset.answerValue);
  classroomAnswers.hidden = true;

  for (const button of classroomAnswerButtons) {
    button.disabled = true;
  }

  if (selectedAnswer !== question.answer) {
    classroomPhase = "wrong";
    classroomProgress.textContent =
      "pergunta " + (classroomQuestionIndex + 1) +
      " de " + CLASSROOM_QUESTION_COUNT + " · tente de novo";
    void showClassroomPose("reassuring");
    showClassroomLine(
      "Quase, meu bem. " + question.hint +
      " Respira, olha com calma e tenta de novo para mim.",
    );
    return;
  }

  if (classroomQuestionIndex === CLASSROOM_QUESTION_COUNT - 1) {
    classroomPhase = "reward";
    classroomProgress.textContent = "aula concluída · 5/5";
    classroomScreen.classList.add("is-finale");
    const rewardPoseReady = showClassroomPose("reward", { animate: false });
    void showClassroomFinale(rewardPoseReady);
  } else {
    classroomPhase = "correct";
    classroomProgress.textContent =
      classroomQuestionIndex + 1 + " de " +
      CLASSROOM_QUESTION_COUNT + " corretas";
    void showClassroomPose("praise");
  }

  showClassroomLine(CLASSROOM_CORRECT_LINES[classroomQuestionIndex]);
}

function claimClassroomReward() {
  // Award once, persist the balance, and surface the result back in the casino.
  if (
    classroomPhase !== "reward" ||
    classroomRewardClaimed ||
    casinoTokenBalance !== 0
  ) {
    return;
  }

  classroomRewardClaimed = true;
  casinoTokenBalance += CLASSROOM_REWARD_TOKENS;
  saveCasinoTokens();
  renderCasinoTokens();
  showCasinoMessage("Gojo te deu 5 fichas. Boa garota.", "token", false);
  classroomDialog.close();
}

function handleClassroomContinue() {
  // Finish an active sentence first; only a second activation advances it.
  if (classroomIsTyping) {
    finishClassroomTypewriter();
    return;
  }

  if (classroomPhase === "intro") {
    if (classroomIntroIndex < CLASSROOM_INTRO_LINES.length - 1) {
      classroomIntroIndex += 1;
      showClassroomIntro();
    } else {
      classroomQuestionIndex = 0;
      showClassroomQuestion();
    }
  } else if (classroomPhase === "correct") {
    classroomQuestionIndex += 1;
    showClassroomQuestion();
  } else if (classroomPhase === "wrong") {
    showClassroomQuestion();
  } else if (classroomPhase === "reward") {
    claimClassroomReward();
  }
}

function resetClassroomLesson() {
  // Closing never grants chips and the next visit starts with new arithmetic.
  clearClassroomTypewriter();
  classroomPoseRequestId += 1;
  classroomFinaleRequestId += 1;
  classroomQuestions = [];
  classroomIntroIndex = 0;
  classroomQuestionIndex = 0;
  classroomPhase = "closed";
  classroomDialogueFullText = "";
  classroomVisibleCharacterCount = 0;
  classroomRewardClaimed = false;
  classroomProgress.textContent = "5 perguntas · 5 fichas";
  classroomDialogueText.textContent = CLASSROOM_INTRO_LINES[0];
  classroomDialogueAnnouncement.textContent = "";
  classroomAnswers.hidden = true;
  classroomContinue.hidden = false;
  classroomContinue.textContent = "CONTINUAR";
  classroomCharacter.classList.remove("is-visible", "is-entering");
  classroomCharacter.removeAttribute("src");
  delete classroomCharacter.dataset.pose;
  classroomScreen.classList.remove("is-finale");
  classroomFinale.classList.remove("is-visible");
  classroomFinale.hidden = true;
  classroomArtStatus.textContent = "preparando a arte da aula...";
  classroomArtStatus.hidden = false;

  for (const answerButton of classroomAnswerButtons) {
    answerButton.disabled = false;
    answerButton.textContent = "";
    delete answerButton.dataset.answerValue;
  }
}

function openClassroom() {
  // Leave the casino cleanly so its WebGL loop and music pause during class.
  if (
    casinoTokenBalance !== 0 ||
    casinoSpinInProgress ||
    casinoJackpotOpen ||
    classroomDialog.open
  ) {
    renderCasinoTokens();
    return;
  }

  classroomShouldReturnToCasino = true;
  if (casinoDialog.open) {
    casinoDialog.close();
  }

  resetClassroomLesson();
  classroomQuestions = createClassroomQuestions();
  classroomDialog.showModal();
  showClassroomIntro();
  classroomContinue.focus();
}

function handleClassroomClose() {
  // Return to the zero balance or to the freshly awarded five-chip balance.
  const shouldReturnToCasino = classroomShouldReturnToCasino;
  classroomShouldReturnToCasino = false;
  resetClassroomLesson();

  if (shouldReturnToCasino) {
    openCasino();
  }
}

function consumeCasinoBait() {
  // Guarantee the special first result only once per browser when possible.
  casinoBaitConsumed = true;

  if (!casinoBaitIsPersistent) {
    return;
  }

  try {
    localStorage.setItem(CASINO_BAIT_STORAGE_KEY, "true");
  } catch {
    casinoBaitIsPersistent = false;
  }
}

function loadPrizeCardImage(source) {
  // Decode each delivered card once without requesting it from the main page.
  if (prizeCardImageCache.has(source)) {
    return prizeCardImageCache.get(source);
  }

  const image = new Image();
  image.decoding = "async";
  const ready = new Promise((resolveImage) => {
    image.addEventListener("load", () => resolveImage(image), { once: true });
    image.addEventListener("error", () => resolveImage(null), { once: true });
  }).then(async (loadedImage) => {
    if (loadedImage === null) {
      return null;
    }

    if (typeof loadedImage.decode === "function") {
      try {
        await loadedImage.decode();
      } catch {
        // A completed local load remains usable if decode() cannot finish.
      }
    }

    return loadedImage;
  });
  prizeCardImageCache.set(source, ready);
  image.src = source;
  return ready;
}

function requestAchievementCard(slot, source) {
  // Retain the current decoded card until its requested replacement is ready.
  const image = slot.querySelector(".achievement-card-image");
  if (image.dataset.cardSource === source) {
    return loadPrizeCardImage(source);
  }

  image.dataset.cardSource = source;
  slot.classList.remove("is-card-ready", "is-card-error");
  slot.classList.add("is-card-loading");
  const ready = loadPrizeCardImage(source);
  void ready.then((loadedImage) => {
    if (image.dataset.cardSource !== source) {
      return;
    }

    slot.classList.remove("is-card-loading");
    if (loadedImage === null) {
      image.hidden = true;
      slot.classList.add("is-card-error");
      return;
    }

    image.src = source;
    image.hidden = false;
    slot.classList.add("is-card-ready");
  });
  return ready;
}

function renderAchievements() {
  // Keep each native label and lazily requested card synchronized.
  for (const slot of achievementSlots) {
    const prize = CASINO_PRIZES.find(
      (candidate) => candidate.id === slot.dataset.prizeId,
    );
    const isUnlocked =
      prize !== undefined && unlockedAchievementIds.has(prize.id);
    const name = slot.querySelector(".achievement-name");
    const fallback = slot.querySelector(".achievement-card-fallback");

    slot.classList.toggle("is-locked", !isUnlocked);
    slot.classList.toggle("is-unlocked", isUnlocked);
    slot.setAttribute(
      "aria-label",
      isUnlocked ? "Conquista desbloqueada: " + prize.name : "Conquista oculta",
    );
    name.textContent = isUnlocked ? prize.name : "conquista oculta";
    fallback.textContent = isUnlocked ? "PRÊMIO" : "?";

    if (achievementCardsInitialized) {
      requestAchievementCard(
        slot,
        isUnlocked ? prize.cardSource : MYSTERY_PRIZE_CARD_SOURCE,
      );
    }
  }

  const unlockedCount = unlockedAchievementIds.size;
  const totalCount = CASINO_PRIZES.length;
  const isComplete = unlockedCount === totalCount;
  achievementsCount.textContent = unlockedCount + "/" + totalCount;
  achievementsProgress.textContent =
    unlockedCount + " de " + totalCount + " desbloqueadas";
  achievementCompletePlaque.hidden = !isComplete;
  achievementStorageNote.hidden = achievementsArePersistent;
  achievementsScreen.classList.toggle("is-complete", isComplete);
  casino3D?.setCollectionComplete(isComplete);
}

function renderCasinoTokens() {
  // Show the current balance and prevent play when no chip remains.
  casinoTokenBalanceElement.textContent = String(casinoTokenBalance);
  casinoTokenStorageNote.hidden =
    casinoTokensArePersistent && casinoBaitIsPersistent;
  const canSpin =
    casinoTokenBalance > 0 &&
    !casinoSpinInProgress &&
    !casinoJackpotOpen;
  casinoLever.disabled = !canSpin;
  classroomOpenButton.disabled =
    casinoTokenBalance !== 0 || casinoSpinInProgress || casinoJackpotOpen;
  casino3D?.setLeverInteractive(canSpin);

  if (casinoSpinInProgress) {
    casinoLever.setAttribute("aria-label", "Alavanca acionada; rolos girando");
  } else if (casinoTokenBalance === 0) {
    casinoLever.setAttribute("aria-label", "Sem fichas; ganhe fichas na aula");
  } else {
    casinoLever.setAttribute(
      "aria-label",
      "Puxar alavanca tridimensional do cassino",
    );
  }

  casinoEmpty.hidden =
    casinoTokenBalance !== 0 ||
    casinoSpinInProgress ||
    casinoJackpotOpen ||
    !casinoResultFlash.hidden;
}

function clearCasinoResultFlash() {
  // Cancel stale cards so a newer message always owns the two-second window.
  if (casinoResultFlashTimerId !== null) {
    window.clearTimeout(casinoResultFlashTimerId);
    casinoResultFlashTimerId = null;
  }

  casinoResultFlash.hidden = true;
  casinoResultFlash.classList.remove("is-token", "is-spinning", "is-loss");
}

function showCasinoMessage(message, tone = "default", emphasize = true) {
  // Keep one accessible result below while briefly enlarging ordinary feedback.
  casinoResult.textContent = message;
  casinoResult.classList.toggle("is-prize", tone === "prize");
  casinoResult.classList.toggle("is-token", tone === "token");
  clearCasinoResultFlash();

  if (!emphasize || !casinoIsOpen || casinoJackpotOpen) {
    return;
  }

  casinoResultFlash.textContent = message;
  casinoResultFlash.classList.toggle("is-token", tone === "token");
  casinoResultFlash.classList.toggle("is-spinning", tone === "spinning");
  casinoResultFlash.classList.toggle("is-loss", tone === "loss");
  casinoResultFlash.hidden = false;
  casinoResultFlashTimerId = window.setTimeout(() => {
    casinoResultFlashTimerId = null;
    casinoResultFlash.hidden = true;
    casinoResultFlash.classList.remove("is-token", "is-spinning", "is-loss");
    renderCasinoTokens();
  }, CASINO_RESULT_FLASH_DURATION_MS);
}

function playPendingAchievementAnimation() {
  // Animate the most recently awarded card only when its gallery is visible.
  if (pendingAchievementAnimation === null || !achievementsDialog.open) {
    return;
  }

  const pendingAnimation = pendingAchievementAnimation;
  pendingAchievementAnimation = null;
  const slot = [...achievementSlots].find(
    (candidate) => candidate.dataset.prizeId === pendingAnimation.id,
  );
  const prize = CASINO_PRIZES.find(
    (candidate) => candidate.id === pendingAnimation.id,
  );
  if (slot === undefined || prize === undefined) {
    return;
  }

  const animationClass = pendingAnimation.isNew
    ? "is-new-reveal"
    : "is-repeat-reveal";
  void requestAchievementCard(slot, prize.cardSource).then(() => {
    if (!achievementsDialog.open || reducedMotionMediaQuery.matches) {
      return;
    }

    slot.classList.remove("is-new-reveal", "is-repeat-reveal");
    window.requestAnimationFrame(() => {
      if (!achievementsDialog.open) {
        return;
      }
      slot.classList.add(animationClass);
      window.setTimeout(
        () => slot.classList.remove(animationClass),
        pendingAnimation.isNew ? 1100 : 450,
      );
    });
  });
}

function readCasinoPalette() {
  // Read semantic CSS colors for matching Three.js materials.
  const rootStyles = getComputedStyle(document.documentElement);
  const readColor = (propertyName) =>
    rootStyles.getPropertyValue(propertyName).trim();
  return {
    navyDeep: readColor("--navy-deep"),
    navy: readColor("--navy"),
    shirt: readColor("--shirt"),
    white: readColor("--white"),
    hairBlonde: readColor("--hair-blonde"),
    hairBlondeSoft: readColor("--hair-blonde-soft"),
    hairPink: readColor("--hair-pink"),
    hairPinkDark: readColor("--hair-pink-dark"),
    hairPinkSoft: readColor("--hair-pink-soft"),
    tieRed: readColor("--tie-red"),
    skirtBlue: readColor("--skirt-blue"),
    skirtBlueSoft: readColor("--skirt-blue-soft"),
  };
}

function loadCasinoSymbolImage(symbol) {
  // Decode each local reel illustration once and keep its character fallback.
  if (casinoSymbolImageCache.has(symbol.imageSource)) {
    return casinoSymbolImageCache.get(symbol.imageSource);
  }

  const image = new Image();
  image.decoding = "async";
  const ready = new Promise((resolveImage) => {
    image.addEventListener("load", () => resolveImage(image), { once: true });
    image.addEventListener("error", () => resolveImage(null), { once: true });
  }).then(async (loadedImage) => {
    if (loadedImage === null) {
      return null;
    }

    if (typeof loadedImage.decode === "function") {
      try {
        await loadedImage.decode();
      } catch {
        // A completed load remains usable if decode() is unavailable or fails.
      }
    }

    loadedCasinoSymbolImages.set(symbol.imageSource, loadedImage);
    return loadedImage;
  });

  casinoSymbolImageCache.set(symbol.imageSource, ready);
  image.src = symbol.imageSource;
  return ready;
}

function renderFallbackSymbol(reel, symbol) {
  // Reuse the delivered art in HTML mode without sacrificing text fallback.
  const loadedImage = loadedCasinoSymbolImages.get(symbol.imageSource);
  if (loadedImage === undefined) {
    reel.replaceChildren();
    reel.textContent = symbol.character;
    return;
  }

  const image = document.createElement("img");
  image.className = "fallback-reel-image";
  image.src = symbol.imageSource;
  image.alt = "";
  image.width = 1254;
  image.height = 1254;
  image.setAttribute("aria-hidden", "true");
  reel.textContent = "";
  reel.replaceChildren(image);
}

function renderFallbackOutcome(symbols) {
  for (let reelIndex = 0; reelIndex < fallbackReels.length; reelIndex += 1) {
    renderFallbackSymbol(fallbackReels[reelIndex], symbols[reelIndex]);
  }
}

function currentFallbackOutcome() {
  if (pendingCasinoOutcome.length === fallbackReels.length) {
    return pendingCasinoOutcome;
  }

  return INITIAL_REEL_SYMBOL_INDICES.map(
    (symbolIndex) => SLOT_SYMBOLS[symbolIndex],
  );
}

function requestDeferredCasinoImage(image, onReady) {
  // Reveal decorative HTML art only after its local PNG has loaded.
  const source = image.dataset.src;
  if (typeof source !== "string" || source.length === 0) {
    return;
  }

  image.addEventListener(
    "load",
    () => {
      image.hidden = false;
      onReady();
    },
    { once: true },
  );
  image.addEventListener(
    "error",
    () => {
      image.hidden = true;
    },
    { once: true },
  );
  image.src = source;
}

function initializeCasinoArt() {
  // Keep every new casino PNG out of the initial page request.
  if (!casinoArtInitialized) {
    casinoArtInitialized = true;
    requestDeferredCasinoImage(casinoLogo, () => {
      casinoMarquee.classList.add("is-logo-ready");
    });
    requestDeferredCasinoImage(casinoChipBalance, () => {});
    requestDeferredCasinoImage(casinoChipRule, () => {});
    requestDeferredCasinoImage(casinoGiftRule, () => {
      casinoGiftRuleFallback.hidden = true;
    });
    casinoSymbolImagesPromise = Promise.all(
      SLOT_SYMBOLS.map((symbol) => loadCasinoSymbolImage(symbol)),
    );
    void casinoSymbolImagesPromise.then(() => {
      renderFallbackOutcome(currentFallbackOutcome());
    });
  }

  return casinoSymbolImagesPromise;
}

function initializeAchievementsBackground() {
  // Let the browser request only the orientation selected on first gallery use.
  if (achievementsBackgroundInitialized) {
    return;
  }

  achievementsBackgroundInitialized = true;
  achievementsBackgroundImage.addEventListener("load", () => {
    achievementsScreen.classList.add("is-background-ready");
  });
  achievementsBackgroundImage.addEventListener("error", () => {
    achievementsScreen.classList.remove("is-background-ready");
  });
  achievementsBackgroundPortrait.srcset =
    achievementsBackgroundPortrait.dataset.srcset;
  achievementsBackgroundImage.src = achievementsBackgroundImage.dataset.src;
}

function load3DModule() {
  // Load the pinned local Three.js presentation only when the casino opens.
  if (shared3DModulePromise === null) {
    shared3DModulePromise = import("./casino-3d.mjs");
  }

  return shared3DModulePromise;
}

function showCasinoFallback() {
  // Keep every rule playable when WebGL is unavailable.
  casino3DFailed = true;
  casino3D?.dispose();
  casino3D = null;
  slotMachine.classList.remove("is-loading", "is-ready");
  slotMachine.classList.add("is-fallback");
  casinoReelFallback.hidden = false;
  renderFallbackOutcome(currentFallbackOutcome());
  casinoLoading.textContent = "modo 3D indisponível; usando rolos simples.";
  renderCasinoTokens();
}

function syncCasino3DVisibility(view = casino3D) {
  // Match the existing casino renderer to the dialog and browser visibility.
  view?.setVisible(casinoIsOpen && casinoDialog.open && !document.hidden);
}

async function ensureCasino3D() {
  // Initialize the casino scene only on its first opening.
  const symbolImagesReady = initializeCasinoArt();
  if (casino3D !== null || casino3DFailed) {
    return casino3D;
  }

  if (casino3DLoadPromise === null) {
    casino3DLoadPromise = Promise.all([
      load3DModule(),
      symbolImagesReady,
    ])
      .then(([{ createCasino3D }, symbolImages]) => {
        casino3D = createCasino3D({
          canvas: casinoCanvas,
          palette: readCasinoPalette(),
          symbols: SLOT_SYMBOLS.map((symbol) => symbol.character),
          symbolImages,
          initialIndices: INITIAL_REEL_SYMBOL_INDICES,
          reducedMotion: reducedMotionMediaQuery.matches,
          onLeverActivate: startCasinoSpin,
          onContextFailure: showCasinoFallback,
        });
        slotMachine.classList.remove("is-loading", "is-fallback");
        slotMachine.classList.add("is-ready");
        casinoReelFallback.hidden = true;
        syncCasino3DVisibility(casino3D);
        casino3D.setLeverFocus(document.activeElement === casinoLever);
        casino3D.setCollectionComplete(
          unlockedAchievementIds.size === CASINO_PRIZES.length,
        );
        renderCasinoTokens();
        return casino3D;
      })
      .catch((error) => {
        console.warn("Não foi possível iniciar o cassino 3D.", error);
        showCasinoFallback();
        return null;
      });
  }

  return casino3DLoadPromise;
}

function updateCasinoMusicControl() {
  // Reflect actual media playback, never merely the requested state.
  const isActuallyPlaying = !casinoMusic.paused && !casinoMusic.ended;
  casinoMusicToggle.setAttribute(
    "aria-pressed",
    isActuallyPlaying ? "true" : "false",
  );
  casinoMusicToggle.textContent = isActuallyPlaying
    ? "⏸ PAUSAR"
    : "▶ MÚSICA";
}

async function reconcileCasinoMusic() {
  // Make only the newest play/pause request authoritative.
  const commandId = ++casinoMusicCommandId;
  const shouldPlay =
    casinoIsOpen && casinoMusicWanted && !document.hidden;

  if (shouldPlay) {
    try {
      await casinoMusic.play();
    } catch {
      if (commandId === casinoMusicCommandId) {
        casinoMusicWanted = false;
      }
    }
  }

  if (!casinoIsOpen || !casinoMusicWanted || document.hidden) {
    casinoMusic.pause();

    if (!casinoIsOpen) {
      casinoMusic.currentTime = 0;
    }
  }

  updateCasinoMusicControl();
}

function toggleCasinoMusic() {
  // Preserve the visitor's desired state across close and reopen.
  casinoMusicWanted = !casinoMusicWanted;
  void reconcileCasinoMusic();
}

function updateCasinoMusicVolume() {
  // Apply the selected casino-only volume immediately.
  casinoMusic.volume = Number(casinoVolume.value) / 100;
}

function handleCasinoMusicError() {
  // Expose a truthful retry button after a media error.
  casinoMusicWanted = false;
  casinoMusicCommandId += 1;
  updateCasinoMusicControl();
}

function handleCasinoVisibilityChange() {
  // Pause hidden work and resume only when the visitor still wants music.
  syncCasino3DVisibility();
  void reconcileCasinoMusic();
}

function handleCasinoLeverFocus() {
  // Put focus feedback on the rendered lever, not on a rectangular button.
  casino3D?.setLeverFocus(true);
}

function handleCasinoLeverBlur() {
  // Remove the rendered keyboard focus glow.
  casino3D?.setLeverFocus(false);
}

function openCasino() {
  // Open the full-screen casino and lazily start its presentation.
  if (!casinoDialog.open) {
    casinoDialog.showModal();
  }

  casinoIsOpen = true;
  void initializeCasinoArt();
  renderCasinoTokens();

  if (
    (casinoTokenBalance > 0 || casinoSpinInProgress) &&
    !casinoJackpotOpen &&
    !casinoResult.classList.contains("is-prize")
  ) {
    showCasinoMessage(
      casinoResult.textContent,
      casinoSpinInProgress
        ? "spinning"
        : casinoResult.classList.contains("is-token")
          ? "token"
          : "default",
    );
  } else {
    clearCasinoResultFlash();
  }

  renderCasinoTokens();

  syncCasino3DVisibility();
  void ensureCasino3D();
  void reconcileCasinoMusic();

  if (casinoTokenBalance > 0) {
    casinoLever.focus();
  } else {
    classroomOpenButton.focus();
  }
}

function closeCasinoJackpot() {
  // Keep a win on screen until the visitor explicitly acknowledges it.
  if (!casinoJackpotOpen) {
    return;
  }

  casinoJackpotOpen = false;
  jackpotCardRequestId += 1;
  casinoJackpot.hidden = true;
  slotMachine.classList.remove("is-jackpot");
  casinoJackpotCard.classList.remove(
    "is-card-loading",
    "is-card-ready",
    "is-card-error",
    "is-new-prize",
    "is-repeat-prize",
  );
  casinoJackpotCardImage.hidden = true;
  casino3D?.hideJackpot();
  renderCasinoTokens();

  if (casinoTokenBalance > 0) {
    casinoLever.focus();
  } else {
    classroomOpenButton.focus();
  }
}

function handleCasinoClose() {
  // Stop casino-only activity without overwriting the desired music state.
  clearCasinoResultFlash();

  if (casinoJackpotOpen) {
    closeCasinoJackpot();
  }

  casinoIsOpen = false;
  syncCasino3DVisibility();
  void reconcileCasinoMusic();
}

function handleCasinoCancel(event) {
  // Escape acknowledges a jackpot before it can close the surrounding dialog.
  if (casinoJackpotOpen) {
    event.preventDefault();
    closeCasinoJackpot();
  }
}

function handleCasinoKeydown(event) {
  // Keep keyboard focus inside the blocking jackpot acknowledgement.
  if (casinoJackpotOpen && event.key === "Tab") {
    event.preventDefault();
    casinoJackpotContinue.focus();
  }
}

function openAchievements() {
  // Open the full-screen gallery and lazily request its current cards.
  achievementCardsInitialized = true;
  renderAchievements();

  if (!achievementsDialog.open) {
    achievementsDialog.showModal();
  }

  initializeAchievementsBackground();
  playPendingAchievementAnimation();
}

function normalizeDisplayName(value, trimEdges = true) {
  // Convert editable text into one plain, single-spaced, bounded name.
  const singleSpacedName = String(value).replace(/\s+/gu, " ");
  const limitedName = Array.from(singleSpacedName)
    .slice(0, DISPLAY_NAME_MAX_LENGTH)
    .join("");
  return trimEdges ? limitedName.trim() : limitedName;
}

function setDisplayedName(value, updateEditor = false) {
  // Synchronize every dynamic identity consumer from one valid current name.
  const normalizedName = normalizeDisplayName(value);

  if (normalizedName.length === 0) {
    return false;
  }

  selectedName = normalizedName;
  if (updateEditor) {
    displayNameEditor.textContent = selectedName;
  }

  const questionText = selectedName + " já está rica?";
  document.title = questionText;
  question.dataset.nameSize =
    Array.from(selectedName).length > DISPLAY_NAME_LONG_THRESHOLD
      ? "long"
      : "regular";
  dramaticNoButton.setAttribute(
    "aria-label",
    "Verificar novamente se " + selectedName + " já está rica",
  );

  if (certificateRecord !== null && certificateRecord.name !== selectedName) {
    certificateRecord.name = selectedName;
    certificateBlobPromise = null;
    certificateShareButton.hidden = true;
    certificateStatus.textContent = "";
    renderCertificateRecord();
  }

  return true;
}

function handleDisplayNameFocus() {
  // Remember the current identity so Escape can cancel this editing session.
  displayNameBeforeEdit = selectedName;
}

function handleDisplayNameInput(event) {
  // Apply valid edits live while preserving an unfinished trailing space.
  if (event.isComposing) {
    return;
  }

  const rawName = displayNameEditor.textContent;
  const editableName = normalizeDisplayName(rawName, false);
  const containsFormatting = (displayNameEditor.children?.length ?? 0) > 0;

  if (rawName !== editableName || containsFormatting) {
    displayNameEditor.textContent = editableName;
    const selection = window.getSelection?.();
    const range = document.createRange?.();

    if (selection != null && range != null) {
      range.selectNodeContents(displayNameEditor);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  setDisplayedName(editableName);
}

function handleDisplayNameBeforeInput(event) {
  // Treat virtual-keyboard line breaks as confirmation instead of new content.
  if (
    event.inputType === "insertParagraph" ||
    event.inputType === "insertLineBreak"
  ) {
    event.preventDefault();
    displayNameEditor.blur();
  }
}

function handleDisplayNameBlur() {
  // Commit normalized text or restore the last non-empty live value.
  if (!setDisplayedName(displayNameEditor.textContent, true)) {
    displayNameEditor.textContent = selectedName;
  }
}

function handleDisplayNameKeydown(event) {
  // Confirm with Enter or restore the focus-time name with Escape.
  if (event.key === "Enter") {
    event.preventDefault();
    displayNameEditor.blur();
  } else if (event.key === "Escape") {
    event.preventDefault();
    setDisplayedName(displayNameBeforeEdit, true);
    displayNameEditor.blur();
  }
}

function resetDramaticNo() {
  // Return the replayable audit to its original verdict without changing it.
  if (dramaticNoResetTimerId !== null) {
    window.clearTimeout(dramaticNoResetTimerId);
    dramaticNoResetTimerId = null;
  }

  dramaticNoStage = 0;
  dramaticVerdict.dataset.stage = "0";
  dramaticNoStatus.textContent = "";
  dramaticNoButton.removeAttribute("aria-disabled");
}

function advanceDramaticNo() {
  // Escalate one deterministic audit step and hold the final stamp briefly.
  if (dramaticNoStage >= DRAMATIC_NO_STEPS.length) {
    return;
  }

  dramaticNoStage += 1;
  dramaticVerdict.dataset.stage = String(dramaticNoStage);
  dramaticNoStatus.textContent = DRAMATIC_NO_STEPS[dramaticNoStage - 1];

  if (dramaticNoStage === DRAMATIC_NO_STEPS.length) {
    dramaticNoButton.setAttribute("aria-disabled", "true");
    dramaticNoResetTimerId = window.setTimeout(
      resetDramaticNo,
      DRAMATIC_NO_RESET_DELAY_MS,
    );
  }
}

function createCertificateRecord(date = new Date()) {
  // Create one timestamped issue record whose current display name may be refreshed.
  const fields = getPortoAlegreParts(date);
  const year = String(fields.year);
  const month = String(fields.month).padStart(2, "0");
  const day = String(fields.day).padStart(2, "0");
  const hour = String(fields.hour).padStart(2, "0");
  const minute = String(fields.minute).padStart(2, "0");
  const second = String(fields.second).padStart(2, "0");
  const dateKey = year + "-" + month + "-" + day;
  const timeLabel = hour + ":" + minute + ":" + second;

  return {
    name: selectedName,
    dateTimeKey: dateKey + "T" + timeLabel,
    dateLabel: certificateDateFormatter.format(date),
    timeLabel,
    issuedAtLabel:
      certificateDateFormatter.format(date) +
      " às " +
      timeLabel +
      " · Porto Alegre",
    protocol: "NR-" + year + month + day + "-" + hour + minute + second,
  };
}

function renderCertificateRecord() {
  // Keep the responsive HTML preview and exported canvas on the same record.
  if (certificateRecord === null) {
    certificateRecord = createCertificateRecord();
  }

  certificateName.textContent = certificateRecord.name;
  certificateDate.textContent = certificateRecord.issuedAtLabel;
  certificateDate.dateTime = certificateRecord.dateTimeKey;
  certificateProtocol.textContent = certificateRecord.protocol;
}

function getCertificatePaletteColor(propertyName) {
  // Read the authoritative Marin palette directly from semantic CSS tokens.
  return getComputedStyle(document.documentElement)
    .getPropertyValue(propertyName)
    .trim();
}

function setFittedCertificateFont(context, text, maximumWidth, initialSize) {
  // Keep every approved randomized name on one crisp line in the PNG.
  let fontSize = initialSize;
  const fontFamily = '"Arial Rounded MT Bold", "Trebuchet MS", sans-serif';
  context.font = "1000 " + fontSize + "px " + fontFamily;

  while (fontSize > 48 && context.measureText(text).width > maximumWidth) {
    fontSize -= 4;
    context.font = "1000 " + fontSize + "px " + fontFamily;
  }
}

function drawCertificateSeal(context, centerX, centerY, colors) {
  // Draw a font-independent coffee seal for the exported document.
  context.save();
  context.fillStyle = colors.blonde;
  context.strokeStyle = colors.navyDeep;
  context.lineWidth = 12;
  context.beginPath();
  context.arc(centerX, centerY, 78, 0, Math.PI * 2);
  context.fill();
  context.stroke();

  context.fillStyle = colors.shirt;
  context.strokeStyle = colors.navyDeep;
  context.lineWidth = 9;
  context.fillRect(centerX - 39, centerY - 18, 72, 50);
  context.strokeRect(centerX - 39, centerY - 18, 72, 50);
  context.beginPath();
  context.arc(centerX + 35, centerY + 4, 23, -Math.PI / 2, Math.PI / 2);
  context.stroke();

  context.lineWidth = 7;
  for (const offset of [-22, 0, 22]) {
    context.beginPath();
    context.moveTo(centerX + offset, centerY - 34);
    context.lineTo(centerX + offset + 8, centerY - 57);
    context.stroke();
  }
  context.restore();
}

function drawCertificateCanvas() {
  // Reproduce the visible certificate as a high-resolution local PNG source.
  renderCertificateRecord();
  certificateCanvas.width = CERTIFICATE_CANVAS_WIDTH;
  certificateCanvas.height = CERTIFICATE_CANVAS_HEIGHT;
  const context = certificateCanvas.getContext("2d");

  if (context === null) {
    throw new Error("Canvas 2D indisponível");
  }

  const colors = {
    navyDeep: getCertificatePaletteColor("--navy-deep"),
    navy: getCertificatePaletteColor("--navy"),
    shirt: getCertificatePaletteColor("--shirt"),
    blonde: getCertificatePaletteColor("--hair-blonde"),
    blondeSoft: getCertificatePaletteColor("--hair-blonde-soft"),
    pink: getCertificatePaletteColor("--hair-pink"),
    pinkDark: getCertificatePaletteColor("--hair-pink-dark"),
    pinkSoft: getCertificatePaletteColor("--hair-pink-soft"),
    tieRed: getCertificatePaletteColor("--tie-red"),
    blueSoft: getCertificatePaletteColor("--skirt-blue-soft"),
  };

  context.fillStyle = colors.shirt;
  context.fillRect(0, 0, CERTIFICATE_CANVAS_WIDTH, CERTIFICATE_CANVAS_HEIGHT);
  context.fillStyle = colors.pinkSoft;
  context.fillRect(0, 0, CERTIFICATE_CANVAS_WIDTH, 72);
  context.fillStyle = colors.blueSoft;
  context.fillRect(0, CERTIFICATE_CANVAS_HEIGHT - 72, CERTIFICATE_CANVAS_WIDTH, 72);
  context.strokeStyle = colors.navyDeep;
  context.lineWidth = 26;
  context.strokeRect(28, 28, CERTIFICATE_CANVAS_WIDTH - 56, CERTIFICATE_CANVAS_HEIGHT - 56);
  context.strokeStyle = colors.pink;
  context.lineWidth = 8;
  context.strokeRect(62, 62, CERTIFICATE_CANVAS_WIDTH - 124, CERTIFICATE_CANVAS_HEIGHT - 124);

  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = colors.pinkDark;
  context.font = '900 28px "Trebuchet MS", sans-serif';
  context.fillText("MINISTÉRIO DA NANABET · PORTO ALEGRE", 800, 132);

  context.fillStyle = colors.navyDeep;
  context.font = '1000 68px "Arial Rounded MT Bold", "Trebuchet MS", sans-serif';
  context.fillText("CERTIFICADO OFICIAL", 800, 218);
  context.fillText("DE NÃO RIQUEZA", 800, 292);

  context.fillStyle = colors.navy;
  context.font = '700 30px "Trebuchet MS", sans-serif';
  context.fillText("Certificamos, para os devidos fins, que", 800, 378);

  context.fillStyle = colors.tieRed;
  setFittedCertificateFont(context, certificateRecord.name, 1230, 92);
  context.fillText(certificateRecord.name, 800, 466);
  context.fillStyle = colors.pink;
  context.fillRect(285, 524, 1030, 8);

  context.fillStyle = colors.navyDeep;
  context.font = '700 29px "Trebuchet MS", sans-serif';
  context.fillText(
    "foi submetida a uma auditoria rigorosamente duvidosa e,",
    800,
    584,
  );
  context.fillText(
    "até a presente data, ainda não está rica.",
    800,
    630,
  );

  context.fillStyle = colors.blondeSoft;
  context.fillRect(440, 684, 720, 112);
  context.strokeStyle = colors.navyDeep;
  context.lineWidth = 8;
  context.strokeRect(440, 684, 720, 112);
  context.fillStyle = colors.tieRed;
  context.font = '1000 62px "Arial Rounded MT Bold", "Trebuchet MS", sans-serif';
  context.fillText("VEREDITO: NÃO", 800, 742);

  context.fillStyle = colors.navy;
  context.font = '700 25px "Trebuchet MS", sans-serif';
  context.fillText("emitido em " + certificateRecord.issuedAtLabel, 800, 828);
  context.fillText("protocolo " + certificateRecord.protocol, 800, 866);

  drawCertificateSeal(context, 800, 977, colors);
  context.lineWidth = 3;
  context.strokeStyle = colors.navyDeep;
  context.beginPath();
  context.moveTo(170, 963);
  context.lineTo(590, 963);
  context.moveTo(1010, 963);
  context.lineTo(1430, 963);
  context.stroke();

  context.textAlign = "center";
  context.fillStyle = colors.tieRed;
  context.font = '700 46px "Segoe Script", "Brush Script MT", cursive';
  context.fillText("Tigrinho", 380, 946);
  context.fillStyle = colors.pinkDark;
  context.fillText("nanaBet", 1220, 946);

  context.fillStyle = colors.navyDeep;
  context.font = '700 23px "Trebuchet MS", sans-serif';
  context.fillText("Auditoria do Tigrinho", 380, 993);
  context.font = '600 18px "Trebuchet MS", sans-serif';
  context.fillText("auditor felino", 380, 1021);
  context.font = '700 23px "Trebuchet MS", sans-serif';
  context.fillText("Ministério da nanaBet", 1220, 993);
  context.font = '600 18px "Trebuchet MS", sans-serif';
  context.fillText("riqueza não localizada", 1220, 1021);
}

function getCertificateBlob() {
  // Encode once per current name and share the same file across both actions.
  if (certificateBlobPromise !== null) {
    return certificateBlobPromise;
  }

  try {
    drawCertificateCanvas();
  } catch (error) {
    return Promise.reject(error);
  }

  certificateBlobPromise = new Promise((resolve, reject) => {
    if (typeof certificateCanvas.toBlob !== "function") {
      reject(new Error("Exportação PNG indisponível"));
      return;
    }

    certificateCanvas.toBlob((blob) => {
      if (blob === null) {
        reject(new Error("Falha ao gerar o PNG"));
        return;
      }
      resolve(blob);
    }, "image/png");
  }).catch((error) => {
    certificateBlobPromise = null;
    throw error;
  });

  return certificateBlobPromise;
}

function createCertificateFile(blob) {
  // Build the browser-native file used only by the optional share sheet.
  if (typeof File !== "function") {
    return null;
  }

  return new File([blob], CERTIFICATE_FILE_NAME, { type: "image/png" });
}

function browserCanShareCertificate(file) {
  // Keep unsupported sharing out of the interface instead of showing an error.
  if (
    file === null ||
    typeof navigator === "undefined" ||
    typeof navigator.share !== "function" ||
    typeof navigator.canShare !== "function"
  ) {
    return false;
  }

  try {
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

async function prepareCertificateShare() {
  // Reveal sharing only after the real generated file passes capability checks.
  certificateShareButton.hidden = true;

  if (
    typeof navigator === "undefined" ||
    typeof navigator.share !== "function" ||
    typeof navigator.canShare !== "function" ||
    typeof File !== "function"
  ) {
    return;
  }

  try {
    const blob = await getCertificateBlob();
    const file = createCertificateFile(blob);
    certificateShareButton.hidden = !browserCanShareCertificate(file);
  } catch {
    certificateStatus.textContent =
      "não foi possível preparar o arquivo; a prévia continua disponível.";
  }
}

function openCertificate() {
  // Open one stable, personalized certificate and prepare optional sharing.
  renderCertificateRecord();
  certificateStatus.textContent = "";
  certificateDialog.showModal();
  void prepareCertificateShare();
}

function handleCertificateClose() {
  // Clear transient feedback while retaining this visit's official record.
  certificateStatus.textContent = "";
}

async function downloadCertificate() {
  // Create a temporary local URL and trigger a dependency-free PNG download.
  certificateDownloadButton.disabled = true;
  certificateStatus.textContent = "preparando o certificado...";

  try {
    const blob = await getCertificateBlob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = CERTIFICATE_FILE_NAME;
    link.hidden = true;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
    certificateStatus.textContent = "certificado baixado.";
  } catch {
    certificateStatus.textContent = "não foi possível gerar o certificado em PNG.";
  } finally {
    certificateDownloadButton.disabled = false;
  }
}

async function shareCertificate() {
  // Hand the generated PNG to the operating system's native share sheet.
  certificateShareButton.disabled = true;
  certificateStatus.textContent = "preparando o compartilhamento...";

  try {
    const blob = await getCertificateBlob();
    const file = createCertificateFile(blob);

    if (!browserCanShareCertificate(file)) {
      certificateShareButton.hidden = true;
      certificateStatus.textContent =
        "compartilhamento indisponível; você ainda pode baixar o PNG.";
      return;
    }

    await navigator.share({
      files: [file],
      title: "Certificado Oficial de Não Riqueza",
      text: certificateRecord.name + " ainda não está rica.",
    });
    certificateStatus.textContent = "certificado compartilhado.";
  } catch (error) {
    if (error?.name === "AbortError") {
      certificateStatus.textContent = "";
    } else {
      certificateStatus.textContent = "não foi possível compartilhar o certificado.";
    }
  } finally {
    certificateShareButton.disabled = false;
  }
}

function renderReleasePage() {
  // Show three releases at a time, newest page first.
  const pageCount = Math.ceil(releaseEntries.length / RELEASES_PER_PAGE);
  releasePage = Math.max(0, Math.min(releasePage, pageCount - 1));
  const firstVisibleIndex = releasePage * RELEASES_PER_PAGE;
  const lastVisibleIndex = firstVisibleIndex + RELEASES_PER_PAGE;

  for (let index = 0; index < releaseEntries.length; index += 1) {
    releaseEntries[index].hidden =
      index < firstVisibleIndex || index >= lastVisibleIndex;
  }

  releasePrevious.disabled = releasePage === 0;
  releaseNext.disabled = releasePage === pageCount - 1;
  releasePageStatus.textContent = releasePage + 1 + "/" + pageCount;
}

function changeReleasePage(direction) {
  // Advance by one bounded release page.
  releasePage += direction;
  renderReleasePage();
}

function handleAchievementCheatShortcut(event) {
  // Open the unadvertised terminal only from the unobstructed main page.
  if (
    event.key === "F3" &&
    !event.ctrlKey &&
    !event.altKey &&
    !event.shiftKey &&
    !event.metaKey &&
    !casinoDialog.open &&
    !achievementsDialog.open &&
    !classroomDialog.open &&
    !certificateDialog.open &&
    !patchNotesDialog.open &&
    !cheatDialog.open
  ) {
    event.preventDefault();
    cheatCodeInput.value = "";
    cheatStatus.textContent = "";
    cheatDialog.showModal();
    cheatCodeInput.focus();
  }
}

function handleAchievementCheatSubmit(event) {
  // Unlock the existing stable IDs without altering chips or casino odds.
  event.preventDefault();
  const submittedCode = cheatCodeInput.value.trim().toLocaleLowerCase("pt-BR");
  if (submittedCode !== ACHIEVEMENT_CHEAT_CODE) {
    cheatStatus.textContent = "código inválido.";
    cheatCodeInput.focus();
    cheatCodeInput.select?.();
    return;
  }

  for (const prize of CASINO_PRIZES) {
    unlockedAchievementIds.add(prize.id);
  }
  pendingAchievementAnimation = null;
  saveAchievements();
  renderAchievements();
  cheatDialog.close();
  openAchievements();
}

function handleAchievementCheatClose() {
  // Forget the typed code and any validation feedback after every exit.
  cheatCodeInput.value = "";
  cheatStatus.textContent = "";
}

function handlePatchNotesShortcut(event) {
  // Keep the release history secret behind an unmodified P key.
  const target = event.target;
  const isEditing =
    target?.isContentEditable ||
    target?.matches?.("input, textarea, select");

  if (
    event.key.toLowerCase() === "p" &&
    !event.ctrlKey &&
    !event.altKey &&
    !event.metaKey &&
    !isEditing &&
    !casinoDialog.open &&
    !achievementsDialog.open &&
    !classroomDialog.open &&
    !certificateDialog.open &&
    !cheatDialog.open
  ) {
    event.preventDefault();
    releasePage = 0;
    renderReleasePage();

    if (patchNotesDialog.open) {
      patchNotesDialog.close();
    } else {
      patchNotesDialog.showModal();
    }
    return;
  }

  if (!patchNotesDialog.open) {
    return;
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    changeReleasePage(-1);
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    changeReleasePage(1);
  }
}

function waitForCasinoAnimation(milliseconds) {
  // Avoid timers entirely when reduced motion requests an immediate result.
  if (milliseconds <= 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function createOrdinaryLosingOutcome() {
  // Choose three ordinary symbols and repair any accidental matching triple.
  const outcome = Array.from({ length: 3 }, () => {
    const symbolIndex = Math.floor(Math.random() * CASINO_NORMAL_SYMBOLS.length);
    return CASINO_NORMAL_SYMBOLS[symbolIndex];
  });

  if (outcome.every((symbol) => symbol === outcome[0])) {
    const currentIndex = CASINO_NORMAL_SYMBOLS.indexOf(outcome[2]);
    outcome[2] =
      CASINO_NORMAL_SYMBOLS[
        (currentIndex + 1) % CASINO_NORMAL_SYMBOLS.length
      ];
  }

  return outcome;
}

function chooseCasinoOutcome() {
  // Resolve the three exclusive outcomes from one uniformly random roll.
  pendingCasinoPrize = null;

  if (!casinoBaitConsumed) {
    consumeCasinoBait();
    pendingCasinoOutcomeType = "prize";
    pendingCasinoOutcome = Array(3).fill(CASINO_PRIZE_SYMBOL);
    pendingCasinoPrize = CASINO_PRIZES.find(
      (prize) => prize.id === "prima-vaper",
    );
    return;
  }

  const outcomeRoll = Math.random();

  if (outcomeRoll < CASINO_PRIZE_CHANCE) {
    pendingCasinoOutcomeType = "prize";
    pendingCasinoOutcome = Array(3).fill(CASINO_PRIZE_SYMBOL);
    const lockedPrizes = CASINO_PRIZES.filter(
      (prize) => !unlockedAchievementIds.has(prize.id),
    );
    const prizePool = lockedPrizes.length > 0 ? lockedPrizes : CASINO_PRIZES;
    pendingCasinoPrize =
      prizePool[Math.floor(Math.random() * prizePool.length)];
    return;
  }

  pendingCasinoOutcomeType = "loss";
  pendingCasinoOutcome = createOrdinaryLosingOutcome();
}

function requestJackpotCard(prize) {
  // Reveal only the decoded card for the current blocking jackpot.
  const requestId = jackpotCardRequestId + 1;
  jackpotCardRequestId = requestId;
  casinoJackpotCardImage.hidden = true;
  casinoJackpotCard.classList.remove("is-card-ready", "is-card-error");
  casinoJackpotCard.classList.add("is-card-loading");
  void loadPrizeCardImage(prize.cardSource).then((loadedImage) => {
    if (requestId !== jackpotCardRequestId || !casinoJackpotOpen) {
      return;
    }

    casinoJackpotCard.classList.remove("is-card-loading");
    if (loadedImage === null) {
      casinoJackpotCard.classList.add("is-card-error");
      return;
    }

    casinoJackpotCardImage.src = prize.cardSource;
    casinoJackpotCardImage.hidden = false;
    casinoJackpotCard.classList.add("is-card-ready");
  });
}

function showCasinoJackpot(prize, isNewPrize) {
  // Block the machine behind one crisp card and the retained 3D effects.
  clearCasinoResultFlash();
  casinoJackpotOpen = true;
  slotMachine.classList.add("is-jackpot");
  casinoJackpotBadge.textContent = isNewPrize
    ? "NOVA CONQUISTA"
    : "VOCÊ GANHOU DE NOVO";
  casinoJackpotPrize.textContent = prize.name;
  casinoJackpotCard.classList.remove("is-new-prize", "is-repeat-prize");
  casinoJackpotCard.classList.add(
    isNewPrize ? "is-new-prize" : "is-repeat-prize",
  );
  casinoJackpot.hidden = false;
  requestJackpotCard(prize);
  casino3D?.showJackpot(
    !isNewPrize,
    reducedMotionMediaQuery.matches,
  );
  renderCasinoTokens();
  casinoJackpotContinue.focus();
}

function finishCasinoSpin() {
  // Apply the authoritative payout only after every reel has stopped.
  casinoSpinInProgress = false;
  slotMachine.classList.remove("is-spinning");
  slotMachine.setAttribute("aria-busy", "false");
  casinoResult.classList.remove("is-prize", "is-token");

  if (pendingCasinoOutcomeType === "prize" && pendingCasinoPrize !== null) {
    const isNewPrize = !unlockedAchievementIds.has(pendingCasinoPrize.id);

    if (isNewPrize) {
      unlockedAchievementIds.add(pendingCasinoPrize.id);
      saveAchievements();
    }

    renderAchievements();
    pendingAchievementAnimation = {
      id: pendingCasinoPrize.id,
      isNew: isNewPrize,
    };
    showCasinoMessage(
      isNewPrize
        ? "NOVA CONQUISTA: " + pendingCasinoPrize.name + ". Continua não rica."
        : "PRÊMIO REPETIDO: " + pendingCasinoPrize.name + ".",
      "prize",
      false,
    );
    casino3D?.celebrate("prize", reducedMotionMediaQuery.matches);
    showCasinoJackpot(pendingCasinoPrize, isNewPrize);
    return;
  }

  const failureMessage =
    CASINO_FAILURE_MESSAGES[
      Math.floor(Math.random() * CASINO_FAILURE_MESSAGES.length)
    ];
  showCasinoMessage(failureMessage, "loss");
  casino3D?.celebrate("loss", reducedMotionMediaQuery.matches);
  renderCasinoTokens();
}

async function startCasinoSpin() {
  // Debit one chip, animate one authoritative outcome, then settle its payout.
  if (
    casinoSpinInProgress ||
    casinoJackpotOpen ||
    casinoTokenBalance <= 0
  ) {
    renderCasinoTokens();
    return;
  }

  casinoSpinInProgress = true;
  casinoTokenBalance -= 1;
  saveCasinoTokens();
  chooseCasinoOutcome();
  if (pendingCasinoOutcomeType === "prize" && pendingCasinoPrize !== null) {
    void loadPrizeCardImage(pendingCasinoPrize.cardSource);
  }
  renderCasinoTokens();
  showCasinoMessage("os rolos estão girando...", "spinning");
  slotMachine.classList.add("is-spinning");
  slotMachine.setAttribute("aria-busy", "true");

  const targetIndices = pendingCasinoOutcome.map((symbol) =>
    SLOT_SYMBOLS.indexOf(symbol),
  );
  const reducedMotion = reducedMotionMediaQuery.matches;
  const casinoView = await ensureCasino3D();

  if (casinoView !== null) {
    try {
      await casinoView.spinTo(targetIndices, {
        durations: CASINO_REEL_DURATIONS_MS,
        fullTurns: CASINO_REEL_FULL_TURNS,
        reducedMotion,
      });
    } catch (error) {
      console.warn("A animação 3D do cassino falhou.", error);
      showCasinoFallback();
      await waitForCasinoAnimation(
        reducedMotion ? 0 : Math.max(...CASINO_REEL_DURATIONS_MS),
      );
    }
  } else {
    // Render the authoritative result in the functional HTML fallback.
    renderFallbackOutcome(pendingCasinoOutcome);
    await waitForCasinoAnimation(
      reducedMotion ? 0 : Math.max(...CASINO_REEL_DURATIONS_MS),
    );
  }

  await waitForCasinoAnimation(reducedMotion ? 0 : CASINO_SETTLE_DELAY_MS);
  finishCasinoSpin();
}

function getPortoAlegreParts(date) {
  // Read an instant as calendar fields in Porto Alegre.
  const fields = {};

  for (const part of portoAlegreFormatter.formatToParts(date)) {
    if (part.type !== "literal") {
      fields[part.type] = Number(part.value);
    }
  }

  return fields;
}

function getCoffeeOracleMessageIndex(month, day) {
  // Map every calendar date onto the fixed leap-year catalogue.
  const referenceDate = new Date(
    Date.UTC(COFFEE_ORACLE_REFERENCE_YEAR, month - 1, day),
  );

  if (
    referenceDate.getUTCMonth() !== month - 1 ||
    referenceDate.getUTCDate() !== day
  ) {
    throw new RangeError("Data inválida para o Oráculo do Café");
  }

  const referenceYearStart = Date.UTC(COFFEE_ORACLE_REFERENCE_YEAR, 0, 1);
  return Math.floor(
    (referenceDate.getTime() - referenceYearStart) / MILLISECONDS_PER_DAY,
  );
}

function getCoffeeOracleReading(date) {
  // Select the stable month-and-day message under Porto Alegre calendar rules.
  const fields = getPortoAlegreParts(date);
  const messageIndex = getCoffeeOracleMessageIndex(fields.month, fields.day);
  return {
    dateKey:
      fields.year + "-" + String(fields.month).padStart(2, "0") + "-" +
      String(fields.day).padStart(2, "0"),
    dateLabel: coffeeOracleDateFormatter.format(date),
    message: COFFEE_ORACLE_MESSAGES[messageIndex],
    messageIndex,
  };
}

function renderCoffeeOracleReading() {
  // Fill the expanded inline panel without moving focus away from its toggle.
  if (coffeeOracleReading === null) {
    return;
  }

  coffeeOracleDate.textContent = coffeeOracleReading.dateLabel;
  coffeeOracleDate.dateTime = coffeeOracleReading.dateKey;
  coffeeOracleMessage.textContent = coffeeOracleReading.message;
}

function updateCoffeeOracle(date = new Date()) {
  // Change the visible prophecy only when Porto Alegre reaches a new date.
  const nextReading = getCoffeeOracleReading(date);

  if (
    coffeeOracleReading !== null &&
    coffeeOracleReading.dateKey === nextReading.dateKey
  ) {
    return false;
  }

  coffeeOracleReading = nextReading;
  if (!coffeeOraclePanel.hidden) {
    renderCoffeeOracleReading();
  }
  return true;
}

function toggleCoffeeOracle() {
  // Reveal or collapse today's single fixed reading without persistence.
  const shouldOpen = coffeeOraclePanel.hidden;
  coffeeOraclePanel.hidden = !shouldOpen;
  coffeeOracleButton.setAttribute("aria-expanded", String(shouldOpen));

  if (shouldOpen) {
    if (coffeeOracleReading === null) {
      updateCoffeeOracle();
    }
    renderCoffeeOracleReading();
  } else {
    coffeeOracleMessage.textContent = "";
  }
}

function getPortoAlegreBirthday(year) {
  // Convert the birthday time in Porto Alegre into an exact instant.
  const targetAsUtc = Date.UTC(
    year,
    BIRTH_MONTH - 1,
    BIRTH_DAY,
    BIRTH_HOUR,
    BIRTH_MINUTE,
  );
  let instant = targetAsUtc;
  const offsetCorrectionPasses = 3;

  for (let pass = 0; pass < offsetCorrectionPasses; pass += 1) {
    const fields = getPortoAlegreParts(new Date(instant));
    const displayedAsUtc = Date.UTC(
      fields.year,
      fields.month - 1,
      fields.day,
      fields.hour,
      fields.minute,
      fields.second,
    );
    instant -= displayedAsUtc - targetAsUtc;
  }

  return new Date(instant);
}

const birthInstant = getPortoAlegreBirthday(BIRTH_YEAR);

function updateCounter() {
  // Show completed years and elapsed time since the latest birthday.
  const now = new Date();
  updateCoffeeOracle(now);

  if (now < birthInstant) {
    for (const value of Object.values(counterValues)) {
      value.textContent = "0";
    }
    counter.setAttribute("aria-label", "A data atual é anterior ao nascimento");
    return;
  }

  let latestBirthdayYear = getPortoAlegreParts(now).year;
  let latestBirthday = getPortoAlegreBirthday(latestBirthdayYear);

  if (now < latestBirthday) {
    latestBirthdayYear -= 1;
    latestBirthday = getPortoAlegreBirthday(latestBirthdayYear);
  }

  let remainingMilliseconds = now - latestBirthday;
  const years = latestBirthdayYear - BIRTH_YEAR;
  const days = Math.floor(remainingMilliseconds / MILLISECONDS_PER_DAY);
  remainingMilliseconds %= MILLISECONDS_PER_DAY;
  const hours = Math.floor(
    remainingMilliseconds /
      (MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE * MINUTES_PER_HOUR),
  );
  remainingMilliseconds %=
    MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE * MINUTES_PER_HOUR;
  const minutes = Math.floor(
    remainingMilliseconds / (MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE),
  );
  const seconds = Math.floor(
    (remainingMilliseconds %
      (MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE)) /
      MILLISECONDS_PER_SECOND,
  );

  counterValues.years.textContent = String(years).padStart(2, "0");
  counterValues.days.textContent = String(days).padStart(3, "0");
  counterValues.hours.textContent = String(hours).padStart(2, "0");
  counterValues.minutes.textContent = String(minutes).padStart(2, "0");
  counterValues.seconds.textContent = String(seconds).padStart(2, "0");
  counter.setAttribute(
    "aria-label",
    years + " anos, " + days + " dias, " + hours + " horas, " +
      minutes + " minutos, " + seconds + " segundos",
  );
}

function scheduleNextUpdate() {
  // Refresh now and align the next update with the next real clock second.
  updateCounter();
  const delay =
    MILLISECONDS_PER_SECOND - (Date.now() % MILLISECONDS_PER_SECOND);
  window.setTimeout(scheduleNextUpdate, delay);
}

updateCasinoMusicVolume();
updateCasinoMusicControl();
renderAchievements();
renderCasinoTokens();
renderReleasePage();
displayNameEditor.addEventListener("focus", handleDisplayNameFocus);
displayNameEditor.addEventListener("input", handleDisplayNameInput);
displayNameEditor.addEventListener("compositionend", handleDisplayNameInput);
displayNameEditor.addEventListener("beforeinput", handleDisplayNameBeforeInput);
displayNameEditor.addEventListener("blur", handleDisplayNameBlur);
displayNameEditor.addEventListener("keydown", handleDisplayNameKeydown);
dramaticNoButton.addEventListener("click", advanceDramaticNo);
casinoOpenButton.addEventListener("click", openCasino);
achievementsOpenButton.addEventListener("click", openAchievements);
coffeeOracleButton.addEventListener("click", toggleCoffeeOracle);
certificateOpenButton.addEventListener("click", openCertificate);
certificateDownloadButton.addEventListener("click", () => {
  void downloadCertificate();
});
certificateShareButton.addEventListener("click", () => {
  void shareCertificate();
});
certificateDialog.addEventListener("close", handleCertificateClose);
classroomOpenButton.addEventListener("click", openClassroom);
classroomContinue.addEventListener("click", handleClassroomContinue);
for (const answerButton of classroomAnswerButtons) {
  answerButton.addEventListener("click", () =>
    handleClassroomAnswer(answerButton),
  );
}
casinoLever.addEventListener("click", startCasinoSpin);
casinoLever.addEventListener("focus", handleCasinoLeverFocus);
casinoLever.addEventListener("blur", handleCasinoLeverBlur);
casinoMusicToggle.addEventListener("click", toggleCasinoMusic);
casinoVolume.addEventListener("input", updateCasinoMusicVolume);
casinoMusic.addEventListener("play", updateCasinoMusicControl);
casinoMusic.addEventListener("pause", updateCasinoMusicControl);
casinoMusic.addEventListener("ended", updateCasinoMusicControl);
casinoMusic.addEventListener("error", handleCasinoMusicError);
casinoDialog.addEventListener("close", handleCasinoClose);
casinoDialog.addEventListener("cancel", handleCasinoCancel);
casinoDialog.addEventListener("keydown", handleCasinoKeydown);
classroomDialog.addEventListener("close", handleClassroomClose);
casinoJackpotContinue.addEventListener("click", closeCasinoJackpot);
cheatForm.addEventListener("submit", handleAchievementCheatSubmit);
cheatDialog.addEventListener("close", handleAchievementCheatClose);
releasePrevious.addEventListener("click", () => changeReleasePage(-1));
releaseNext.addEventListener("click", () => changeReleasePage(1));
document.addEventListener("keydown", handleAchievementCheatShortcut);
document.addEventListener("keydown", handlePatchNotesShortcut);
document.addEventListener("visibilitychange", handleCasinoVisibilityChange);
mobileGifMediaQuery.addEventListener("change", showRandomMarinGifs);

// Pick one editable initial identity for this page visit.
setDisplayedName(
  NAME_VARIATIONS[Math.floor(Math.random() * NAME_VARIATIONS.length)],
  true,
);
displayNameBeforeEdit = selectedName;

showRandomMarinGifs();
scheduleNextUpdate();
