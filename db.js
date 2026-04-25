// BASE DE DADOS — localStorage
const DB = {
  get(key) {
    try { return JSON.parse(localStorage.getItem('agro_' + key)) || null; }
    catch { return null; }
  },
  set(key, val) {
    localStorage.setItem('agro_' + key, JSON.stringify(val));
  },
  getAll(key) {
    return this.get(key) || [];
  },
  push(key, item) {
    const arr = this.getAll(key);
    arr.push(item);
    this.set(key, arr);
  },
  update(key, id, data) {
    const arr = this.getAll(key);
    const idx = arr.findIndex(i => i.id === id);
    if (idx !== -1) { Object.assign(arr[idx], data); this.set(key, arr); }
  },
  remove(key, id) {
    const arr = this.getAll(key).filter(i => i.id !== id);
    this.set(key, arr);
  },
  find(key, id) {
    return this.getAll(key).find(i => i.id === id);
  }
};

// ====================================================
// DADOS INICIAIS (Seed)
// ====================================================
function seedDatabase() {
  if (DB.get('seeded')) return;

  const channels = [
    { id:'ch1', name:'AgroTech BR', slug:'agrotech-br', description:'Tecnologia e inovação no campo. IoT, drones, IA e agricultura de precisão.', icon:'fa-microchip', color:'#10B981', cover:'https://picsum.photos/seed/agrotech/800/200', members:12400, category:'Agrotech', createdAt:'2024-01-15T10:00:00' },
    { id:'ch2', name:'Apicultura & Mel', slug:'apicultura-mel', description:'Mundo das abelhas: manejo, produção de mel, pólen, própolis e geleia real.', icon:'fa-dove', color:'#F59E0B', cover:'https://picsum.photos/seed/apis/800/200', members:7800, category:'Apicultura', createdAt:'2024-02-10T10:00:00' },
    { id:'ch3', name:'Pecuária Inteligente', slug:'pecuaria-inteligente', description:'Gestão do rebanho, saúde animal, nutrição e tecnologia na pecuária.', icon:'fa-cow', color:'#EF4444', cover:'https://picsum.photos/seed/cattle/800/200', members:9200, category:'Pecuária', createdAt:'2024-01-28T10:00:00' },
    { id:'ch4', name:'Grãos & Cereais', slug:'graos-cereais', description:'Soja, milho, trigo, arroz e algodão. Safra, mercador e estratégias.', icon:'fa-wheat-awn', color:'#8B5CF6', cover:'https://picsum.photos/seed/grains/800/200', members:15600, category:'Agricultura', createdAt:'2024-01-05T10:00:00' },
    { id:'ch5', name:'Agro Sustentável', slug:'agro-sustentavel', description:'Práticas sustentáveis, reflorestamento, ESG e agricultura regenerativa.', icon:'fa-leaf', color:'#06B6D4', cover:'https://picsum.photos/seed/sustain/800/200', members:6300, category:'Sustentabilidade', createdAt:'2024-03-01T10:00:00' },
    { id:'ch6', name:'Maquinário Agrícola', slug:'maquinario-agricola', description:'Tratores, colheitadeiras, implementos e manutenção de máquinas.', icon:'fa-tractor', color:'#F97316', cover:'https://picsum.photos/seed/machine/800/200', members:8900, category:'Maquinário', createdAt:'2024-02-20T10:00:00' }
  ];

  const users = [
    { id:'u1', name:'Carlos Mendes', username:'carlos.agro', avatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos', bio:'Agrônomo | Entusiasta AgroTech | Palestrante', location:'Ribeirão Preto, SP', area:'Agrotech', followers:2340, following:456, channels:['ch1','ch4','ch5'], joined:'2024-01-20T10:00:00' },
    { id:'u2', name:'Maria Oliveira', username:'maria.apis', avatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria', bio:'Apicultora há 15 anos | Mel orgânico certificada', location:'Viçosa, MG', area:'Apicultura', followers:1890, following:312, channels:['ch2','ch5'], joined:'2024-02-05T10:00:00' },
    { id:'u3', name:'João Silva', username:'joao.pecuaria', avatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=Joao', bio:'Pecuarista | Fazenda São Jorge | 2.000 cabeças', location:'Cuiabá, MT', area:'Pecuária', followers:3100, following:198, channels:['ch3','ch4'], joined:'2024-01-25T10:00:00' },
    { id:'u4', name:'Ana Costa', username:'ana.engenharia', avatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana', bio:'Engenheira Agrícola | Especialista em irrigação', location:'Londrina, PR', area:'Agricultura', followers:1560, following:420, channels:['ch1','ch6'], joined:'2024-02-15T10:00:00' },
    { id:'u5', name:'Pedro Santos', username:'pedro.graos', avatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro', bio:'Produtor de grãos | 3.000 ha | Soja e Milho', location:'Rio Verde, GO', area:'Agricultura', followers:2780, following:267, channels:['ch4','ch1'], joined:'2024-01-10T10:00:00' },
    { id:'u6', name:'Lucia Ferreira', username:'lucia.sustentavel', avatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucia', bio:'Consultora ESG | Agricultura regenerativa', location:'Porto Alegre, RS', area:'Consultoria', followers:1240, following:380, channels:['ch5','ch2'], joined:'2024-03-05T10:00:00' }
  ];

  const posts = [
    { id:'p1', userId:'u1', channelId:'ch1', content:'Novas tecnologias de irrigação por gotejamento estão reduzindo o consumo de água em até 60% nas lavouras do cerrado. A união entre IoT e agricultura está mudando o jogo! Sensores de umidade no solo conectados ao celular facilitam muito o manejo.', image:'https://picsum.photos/seed/irrigation/800/450', videoUrl:null, likes:['u2','u3','u5','u6'], bookmarks:['u3'], comments:[{id:'c1',userId:'u2',text:'Incrível! Na minha região ainda usa irrigação por aspersão, preciso migrar!',createdAt:'2024-11-20T12:00:00'},{id:'c2',userId:'u4',text:'Posso ajudar com o dimensionamento, faço consultoria nisso!',createdAt:'2024-11-20T13:30:00'}], shares:34, createdAt:'2024-11-20T10:30:00', type:'image' },
    { id:'p2', userId:'u2', channelId:'ch2', content:'Colheita excepcional de mel de laranjeira esta temporada! As abelhas trabalharam muito e o resultado é um mel clarinho com sabor cítrico incrível. Produção 40% maior que o ano passado. Quem quer provar?', image:'https://picsum.photos/seed/honey2/800/500', videoUrl:null, likes:['u1','u5','u6'], bookmarks:['u1'], comments:[{id:'c3',userId:'u6',text:'Mel de laranjeira é espetacular! Parabéns pela produção!',createdAt:'2024-11-19T15:00:00'}], shares:18, createdAt:'2024-11-19T14:00:00', type:'image' },
    { id:'p3', userId:'u3', channelId:'ch3', content:'Implementamos brincos inteligentes com GPS e monitoramento de saúde no rebanho. Em 3 meses, reduzimos a mortalidade em 23%. A tecnologia identifica febre e comportamento anômalo antes mesmo do vaqueiro notar. O futuro da pecuária é dados!', image:null, videoUrl:null, likes:['u1','u2','u4','u5','u6'], bookmarks:['u5','u1'], comments:[{id:'c4',userId:'u1',text:'Qual fornecedor dos brincos? Estou recomendando para uns produtores aqui!',createdAt:'2024-11-18T11:00:00'},{id:'c5',userId:'u4',text:'Também quero saber! Isso é revolução no manejo.',createdAt:'2024-11-18T12:00:00'}], shares:56, createdAt:'2024-11-18T09:00:00', type:'text' },
    { id:'p4', userId:'u4', channelId:'ch6', content:'O novo pulverizador com mapeamento por satélite integrado chegou na fazenda! A precisão na aplicação de defensivos aumentou 35% e o desperdício caiu pela metade. Alguém mais está testando esse tipo de equipamento?', image:'https://picsum.photos/seed/sprayer/800/450', videoUrl:null, likes:['u1','u3','u5'], bookmarks:[], comments:[{id:'c6',userId:'u5',text:'Estou entre comprar esse ou o drone pulverizador. Qual sua opinião?',createdAt:'2024-11-17T16:00:00'}], shares:22, createdAt:'2024-11-17T14:30:00', type:'image' },
    { id:'p5', userId:'u5', channelId:'ch4', content:'Previsão para a safra de soja 2024/25 é recorde! Estimamos 160 milhões de toneladas. Com o crescente interesse da China pelo nosso grão e o câmbio favorável, a oportunidade é enorme. Quem está preparado para aproveitar esse momento?', image:null, videoUrl:null, likes:['u1','u3','u6'], bookmarks:['u3','u6'], comments:[{id:'c7',userId:'u3',text:'Aqui em MT a expectativa é excelente! Chuvas regulares este ano.',createdAt:'2024-11-16T10:00:00'},{id:'c8',userId:'u1',text:'Fiquem atentos ao mercado futuro para travar preços bons!',createdAt:'2024-11-16T11:00:00'}], shares:41, createdAt:'2024-11-16T08:00:00', type:'text' },
    { id:'p6', userId:'u6', channelId:'ch5', content:'Nosso projeto de reflorestamento nas margens do rio está mostrando resultados incríveis após 2 anos. A qualidade da água melhorou, a biodiversidade voltou e até a produtividade das áreas adjacentes aumentou. Produção e conservação caminham juntas!', image:'https://picsum.photos/seed/reforest/800/500', videoUrl:null, likes:['u1','u2','u4','u5'], bookmarks:['u2','u4'], comments:[{id:'c9',userId:'u2',text:'Isso me inspira! As abelhas também agradecem mais flora nativa.',createdAt:'2024-11-15T14:00:00'}], shares:29, createdAt:'2024-11-15T11:00:00', type:'image' },
    { id:'p7', userId:'u1', channelId:'ch1', content:'Workshop gratuito sobre agricultura de precisão com drones! Vou apresentar cases reais de mapeamento de lavouras com drones multiespectrais. A detecção de pragas e falhas de plantio fica muito mais rápida. Inscrições abertas!', image:null, videoUrl:'https://www.youtube.com/watch?v=dQw4w9WgXcQ', likes:['u4','u5'], bookmarks:['u4'], comments:[], shares:15, createdAt:'2024-11-21T09:00:00', type:'video' },
    { id:'p8', userId:'u3', channelId:'ch3', content:'Dica de manejo: suplementação mineral no período seco faz toda a diferença. Depois que comecei com suplemento proteinado no cocho, o ganho de peso subiu 18% e a taxa de concepção melhorou significativamente. O custo-benefício é excelente.', image:null, videoUrl:null, likes:['u1','u5','u6'], bookmarks:[], comments:[{id:'c10',userId:'u6',text:'Ótima dica! E sobre bem-estar animal, algum protocolo novo?',createdAt:'2024-11-14T16:00:00'}], shares:12, createdAt:'2024-11-14T13:00:00', type:'text' },
    { id:'p9', userId:'u2', channelId:'ch2', content:'Atenção apicultores: a nova resolução do Mapa sobre registro de melarias está em consulta pública. É importante participar! As mudanças afetam todos os produtores, do pequeno ao grande. Link nos comentários.', image:null, videoUrl:null, likes:['u1','u6'], bookmarks:['u6'], comments:[{id:'c11',userId:'u6',text:'Obrigada por compartilhar! Vou participar da consulta.',createdAt:'2024-11-13T12:00:00'}], shares:8, createdAt:'2024-11-13T10:00:00', type:'text' },
    { id:'p10', userId:'u5', channelId:'ch4', content:'Plantio de milho safrinha adiantado este ano! Com o solo ainda úmido e a previsão de chuvas estáveis até abril, resolvemos antecipar em 2 semanas. Estratégia arriscada? Alguém já fez isso?', image:'https://picsum.photos/seed/cornfield/800/450', videoUrl:null, likes:['u1','u3','u4'], bookmarks:['u1'], comments:[{id:'c12',userId:'u4',text:'Faço isso há 3 anos e os resultados são positivos! Só cuidado com geada tardia.',createdAt:'2024-11-12T17:00:00'}], shares:16, createdAt:'2024-11-12T15:00:00', type:'image' }
  ];

  DB.set('channels', channels);
  DB.set('users', users);
  DB.set('posts', posts);
  DB.set('seeded', true);
}