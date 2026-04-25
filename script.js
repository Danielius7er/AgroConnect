// ====================================================
// ESTADO DA APLICAÇÃO
// ====================================================
const App = {
  user: null,
  view: 'feed',
  viewData: null,
  selectedChIcon: 'fa-seedling'
};

// ====================================================
// UTILITÁRIOS
// ====================================================
function uid() { return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6); }

function timeAgo(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'agora';
  if (diff < 3600) return Math.floor(diff/60) + 'min';
  if (diff < 86400) return Math.floor(diff/3600) + 'h';
  if (diff < 2592000) return Math.floor(diff/86400) + 'd';
  return d.toLocaleDateString('pt-BR');
}

function fmtNum(n) {
  if (n >= 1000000) return (n/1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n/1000).toFixed(1) + 'K';
  return n.toString();
}

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function getYTId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);
  return m ? m[1] : null;
}

function showToast(msg, type='success') {
  const c = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  const icons = { success:'fa-check-circle', error:'fa-exclamation-circle', info:'fa-info-circle' };
  t.innerHTML = `<i class="fa-solid ${icons[type]||icons.info}"></i>${escapeHtml(msg)}`;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateY(20px)'; t.style.transition = 'all .3s'; setTimeout(() => t.remove(), 300); }, 3000);
}

// ====================================================
// AUTENTICAÇÃO
// ====================================================
function switchAuthTab(tab) {
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-register').classList.toggle('active', tab === 'register');
  document.getElementById('form-login').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('form-register').style.display = tab === 'register' ? 'block' : 'none';
}

function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('login-user').value.trim();
  const pass = document.getElementById('login-pass').value;
  if (!username || !pass) return showToast('Preencha todos os campos', 'error');

  // Busca usuário existente ou cria
  let user = DB.getAll('users').find(u => u.username === username);
  if (!user) {
    // Cria automaticamente para demo
    user = {
      id: uid(), name: username, username: username,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      bio: 'Produtor rural entusiasta', location: 'Brasil',
      area: 'Agricultura', followers: 0, following: 0,
      channels: ['ch1','ch4'], joined: new Date().toISOString()
    };
    DB.push('users', user);
  }

  App.user = user;
  DB.set('currentUser', user.id);
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('main-app').style.display = 'block';
  renderApp();
  showToast(`Bem-vindo, ${user.name}!`, 'success');
}

function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const username = document.getElementById('reg-user').value.trim().replace(/\s/g,'.');
  const pass = document.getElementById('reg-pass').value;
  const area = document.getElementById('reg-area').value;
  const location = document.getElementById('reg-location').value.trim();

  if (!name || !username || !pass) return showToast('Preencha todos os campos obrigatórios', 'error');
  if (DB.getAll('users').find(u => u.username === username)) return showToast('Nome de usuário já existe', 'error');

  const user = {
    id: uid(), name, username,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    bio: `Atuação em ${area}`, location: location || 'Brasil',
    area, followers: 0, following: 0,
    channels: ['ch1'], joined: new Date().toISOString()
  };
  DB.push('users', user);
  App.user = user;
  DB.set('currentUser', user.id);
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('main-app').style.display = 'block';
  renderApp();
  showToast(`Conta criada com sucesso! Bem-vindo, ${name}!`, 'success');
}

// ====================================================
// NAVEGAÇÃO
// ====================================================
function navigate(view, data) {
  App.view = view;
  App.viewData = data || null;
  // Atualiza nav ativa
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.view === view);
  });
  document.querySelectorAll('.mobile-nav button').forEach(b => {
    b.classList.toggle('active', b.dataset.mob === view);
  });
  renderContent();
  window.scrollTo(0, 0);
}

// ====================================================
// RENDERIZAÇÃO PRINCIPAL
// ====================================================
function renderApp() {
  renderSidebarChannels();
  renderSidebarUser();
  renderRightSidebar();
  renderContent();
}

function renderSidebarChannels() {
  const el = document.getElementById('sidebar-channels');
  const userChannels = App.user.channels || [];
  const channels = DB.getAll('channels').filter(c => userChannels.includes(c.id));
  el.innerHTML = channels.map(ch => `
    <div class="channel-item ${App.view==='channel'&&App.viewData===ch.id?'active':''}" onclick="navigate('channel','${ch.id}')">
      <div style="width:30px;height:30px;border-radius:8px;background:${ch.color}20;display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <i class="fa-solid ${ch.icon}" style="font-size:13px;color:${ch.color}"></i>
      </div>
      <span style="font-size:13px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(ch.name)}</span>
    </div>
  `).join('');
}

function renderSidebarUser() {
  const el = document.getElementById('sidebar-user');
  const u = App.user;
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;cursor:pointer" onclick="navigate('profile')">
      <img src="${u.avatar}" class="avatar" style="width:38px;height:38px" alt="Avatar">
      <div style="overflow:hidden">
        <div style="font-size:14px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(u.name)}</div>
        <div style="font-size:12px;color:var(--mut)">@${escapeHtml(u.username)}</div>
      </div>
      <button onclick="event.stopPropagation();handleLogout()" style="margin-left:auto;background:none;border:none;color:var(--mut);cursor:pointer;font-size:14px" title="Sair"><i class="fa-solid fa-right-from-bracket"></i></button>
    </div>
  `;
}

function renderRightSidebar() {
  // Cotações
  const cotEl = document.getElementById('cotacoes');
  const cots = [
    { name:'Soja', price:'R$ 142,50', change:'+2,3%', up:true },
    { name:'Milho', price:'R$ 68,90', change:'-0,8%', up:false },
    { name:'Café', price:'R$ 1.240,00', change:'+5,1%', up:true },
    { name:'Boi Gordo', price:'R$ 298,00', change:'+1,2%', up:true },
    { name:'Algodão', price:'R$ 85,40', change:'-1,5%', up:false }
  ];
  cotEl.innerHTML = cots.map(c => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">
      <span style="font-size:13px;font-weight:500">${c.name}</span>
      <div style="text-align:right">
        <div style="font-size:13px;font-weight:600">${c.price}</div>
        <div style="font-size:11px;color:${c.up?'var(--pri)':'var(--dan)'}">${c.change}</div>
      </div>
    </div>
  `).join('');

  // Trending
  const trendEl = document.getElementById('trending');
  const trends = [
    { tag:'#Safra2025', posts:'2.3K publicações' },
    { tag:'#AgroTech', posts:'1.8K publicações' },
    { tag:'#MelOrgânico', posts:'890 publicações' },
    { tag:'#PecuáriaSustentável', posts:'1.2K publicações' },
    { tag:'#IrrigaçãoInteligente', posts:'670 publicações' }
  ];
  trendEl.innerHTML = trends.map(t => `
    <div style="padding:8px 0;border-bottom:1px solid var(--border);cursor:pointer" onclick="navigate('explore')">
      <div style="font-size:14px;font-weight:600;color:var(--pri)">${t.tag}</div>
      <div style="font-size:12px;color:var(--mut)">${t.posts}</div>
    </div>
  `).join('');

  // Sugestões
  const sugEl = document.getElementById('suggestions');
  const allUsers = DB.getAll('users');
  const otherUsers = allUsers.filter(u => u.id !== App.user.id).slice(0, 4);
  sugEl.innerHTML = otherUsers.map(u => `
    <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
      <img src="${u.avatar}" class="avatar" style="width:36px;height:36px" alt="">
      <div style="overflow:hidden;flex:1">
        <div style="font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(u.name)}</div>
        <div style="font-size:11px;color:var(--mut)">${u.area}</div>
      </div>
      <button class="btn-ghost btn-sm" style="padding:4px 10px;font-size:11px" onclick="navigate('profile','${u.id}')">Ver</button>
    </div>
  `).join('');
}

function renderContent() {
  const area = document.getElementById('content-area');
  switch(App.view) {
    case 'feed': area.innerHTML = renderFeed(); break;
    case 'explore': area.innerHTML = renderExplore(); break;
    case 'channels': area.innerHTML = renderChannelsList(); break;
    case 'channel': area.innerHTML = renderChannelDetail(App.viewData); break;
    case 'profile': area.innerHTML = renderProfile(App.viewData); break;
    case 'bookmarks': area.innerHTML = renderBookmarks(); break;
    default: area.innerHTML = renderFeed();
  }
  // Anima entrada
  area.querySelectorAll('.anim-target').forEach((el, i) => {
    el.style.animationDelay = (i * 0.06) + 's';
  });
}

// ====================================================
// RENDERIZAÇÃO: FEED
// ====================================================
function renderFeed() {
  const posts = DB.getAll('posts').sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  return `
    <div style="margin-bottom:20px">
      <h1 style="font-size:26px;font-weight:800">Feed</h1>
      <p style="color:var(--txt2);font-size:14px;margin-top:4px">Publicações dos canais que você segue</p>
    </div>
    <!-- Criar post rápido -->
    <div class="card" style="padding:16px;margin-bottom:20px;cursor:pointer" onclick="showModal('create-post')">
      <div style="display:flex;align-items:center;gap:12px">
        <img src="${App.user.avatar}" class="avatar" style="width:42px;height:42px" alt="">
        <div style="flex:1;color:var(--mut);font-size:15px">Compartilhe algo com a comunidade...</div>
        <button class="btn-pri btn-sm">Publicar</button>
      </div>
    </div>
    ${posts.map((p, i) => renderPostCard(p, i)).join('')}
  `;
}

function renderPostCard(post, idx) {
  const author = DB.find('users', post.userId) || App.user;
  const channel = DB.find('channels', post.channelId);
  const isLiked = post.likes.includes(App.user.id);
  const isBookmarked = (post.bookmarks || []).includes(App.user.id);
  const likeCount = post.likes.length;
  const commentCount = post.comments.length;

  let mediaHtml = '';
  if (post.type === 'image' && post.image) {
    mediaHtml = `<img src="${post.image}" class="post-image" onclick="showPostDetail('${post.id}')" alt="Imagem do post" loading="lazy">`;
  } else if (post.type === 'video' && post.videoUrl) {
    const ytId = getYTId(post.videoUrl);
    if (ytId) {
      mediaHtml = `<div class="yt-embed"><iframe src="https://www.youtube.com/embed/${ytId}" allowfullscreen loading="lazy"></iframe></div>`;
    }
  }

  return `
    <div class="card anim-target anim-fade-up" style="padding:18px;margin-bottom:14px;animation-delay:${(idx||0)*0.06}s" id="post-${post.id}">
      <div style="display:flex;align-items:flex-start;gap:12px">
        <img src="${author.avatar}" class="avatar" style="width:44px;height:44px;cursor:pointer" onclick="navigate('profile','${author.id}')" alt="Avatar">
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            <span style="font-weight:700;font-size:15px;cursor:pointer" onclick="navigate('profile','${author.id}')">${escapeHtml(author.name)}</span>
            <span style="color:var(--mut);font-size:13px">@${escapeHtml(author.username)}</span>
            <span style="color:var(--mut);font-size:12px">&middot;</span>
            <span style="color:var(--mut);font-size:13px">${timeAgo(post.createdAt)}</span>
          </div>
          ${channel ? `<div style="display:inline-flex;align-items:center;gap:4px;margin-top:4px;cursor:pointer" onclick="navigate('channel','${channel.id}')">
            <span class="tag" style="background:${channel.color}18;color:${channel.color}"><i class="fa-solid ${channel.icon}" style="font-size:10px"></i>${escapeHtml(channel.name)}</span>
          </div>` : ''}
          <p style="margin-top:8px;font-size:14px;line-height:1.65;color:var(--txt)">${escapeHtml(post.content)}</p>
          ${mediaHtml}
          <!-- Ações -->
          <div style="display:flex;gap:4px;margin-top:12px;flex-wrap:wrap">
            <div class="post-action ${isLiked?'liked':''}" onclick="toggleLike('${post.id}')">
              <i class="fa-${isLiked?'solid':'regular'} fa-heart"></i>
              <span>${likeCount || ''}</span>
            </div>
            <div class="post-action" onclick="showPostDetail('${post.id}')">
              <i class="fa-regular fa-comment"></i>
              <span>${commentCount || ''}</span>
            </div>
            <div class="post-action" onclick="sharePost('${post.id}')">
              <i class="fa-solid fa-share-nodes"></i>
              <span>${post.shares || ''}</span>
            </div>
            <div class="post-action ${isBookmarked?'bookmarked':''}" onclick="toggleBookmark('${post.id}')">
              <i class="fa-${isBookmarked?'solid':'regular'} fa-bookmark"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ====================================================
// RENDERIZAÇÃO: EXPLORAR
// ====================================================
function renderExplore() {
  const channels = DB.getAll('channels');
  const posts = DB.getAll('posts').sort((a,b) => b.likes.length - a.likes.length).slice(0, 6);
  return `
    <div style="margin-bottom:24px">
      <h1 style="font-size:26px;font-weight:800">Explorar</h1>
      <p style="color:var(--txt2);font-size:14px;margin-top:4px">Descubra canais, produtores e conteúdos em destaque</p>
    </div>

    <!-- Categorias -->
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:24px">
      ${['Todos','Agrotech','Agricultura','Pecuária','Apicultura','Maquinário','Sustentabilidade','Mercado'].map((cat, i) => `
        <button class="btn-ghost btn-sm ${i===0?'active':''}" style="${i===0?'border-color:var(--pri);color:var(--pri);background:var(--pri-g)':''}" onclick="filterExplore(this,'${cat}')">${cat}</button>
      `).join('')}
    </div>

    <!-- Canais em destaque -->
    <h2 style="font-size:18px;font-weight:700;margin-bottom:14px">Canais em Destaque</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px;margin-bottom:32px">
      ${channels.map(ch => {
        const isSub = (App.user.channels || []).includes(ch.id);
        return `
        <div class="card anim-target anim-fade-up" style="padding:0;overflow:hidden;cursor:pointer" onclick="navigate('channel','${ch.id}')">
          <div style="height:70px;background:linear-gradient(135deg,${ch.color}40,${ch.color}10);display:flex;align-items:center;justify-content:center">
            <i class="fa-solid ${ch.icon}" style="font-size:28px;color:${ch.color}"></i>
          </div>
          <div style="padding:14px">
            <div style="font-weight:700;font-size:15px;margin-bottom:2px">${escapeHtml(ch.name)}</div>
            <div style="font-size:12px;color:var(--mut);margin-bottom:8px">${fmtNum(ch.members)} membros &middot; ${ch.category}</div>
            <div style="font-size:13px;color:var(--txt2);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${escapeHtml(ch.description)}</div>
            <button class="${isSub?'btn-ghost':'btn-pri'} btn-sm" style="width:100%;margin-top:10px" onclick="event.stopPropagation();toggleSubscribe('${ch.id}')">${isSub?'Inscrito':'Inscrever-se'}</button>
          </div>
        </div>`;
      }).join('')}
    </div>

    <!-- Posts em destaque -->
    <h2 style="font-size:18px;font-weight:700;margin-bottom:14px">Publicações em Destaque</h2>
    ${posts.map((p, i) => renderPostCard(p, i)).join('')}
  `;
}

// ====================================================
// RENDERIZAÇÃO: LISTA DE CANAIS
// ====================================================
function renderChannelsList() {
  const channels = DB.getAll('channels');
  return `
    <div style="margin-bottom:24px">
      <h1 style="font-size:26px;font-weight:800">Canais</h1>
      <p style="color:var(--txt2);font-size:14px;margin-top:4px">Comunidades temáticas do agronegócio brasileiro</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px">
      ${channels.map(ch => {
        const isSub = (App.user.channels || []).includes(ch.id);
        const postsCount = DB.getAll('posts').filter(p => p.channelId === ch.id).length;
        return `
        <div class="card anim-target anim-fade-up" style="padding:0;overflow:hidden">
          <div style="height:90px;background:linear-gradient(135deg,${ch.color}50,${ch.color}15);position:relative;display:flex;align-items:center;justify-content:center">
            <i class="fa-solid ${ch.icon}" style="font-size:36px;color:${ch.color}"></i>
            <div style="position:absolute;top:10px;right:10px">
              <button class="btn-ghost btn-sm" style="padding:4px 8px;font-size:11px;background:rgba(0,0,0,.4);border-color:transparent;color:#fff" onclick="shareChannel('${ch.id}')"><i class="fa-solid fa-share-nodes"></i></button>
            </div>
          </div>
          <div style="padding:16px">
            <div style="font-weight:700;font-size:17px;margin-bottom:4px;cursor:pointer" onclick="navigate('channel','${ch.id}')">${escapeHtml(ch.name)}</div>
            <div style="font-size:12px;color:var(--mut);margin-bottom:10px">${fmtNum(ch.members)} membros &middot; ${postsCount} publicações</div>
            <div style="font-size:13px;color:var(--txt2);margin-bottom:14px;line-height:1.5">${escapeHtml(ch.description)}</div>
            <div style="display:flex;gap:8px">
              <button class="${isSub?'btn-ghost':'btn-pri'} btn-sm" style="flex:1" onclick="toggleSubscribe('${ch.id}')">${isSub?'Inscrito':'Inscrever-se'}</button>
              <button class="btn-ghost btn-sm" onclick="navigate('channel','${ch.id}')">Abrir</button>
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>
  `;
}

// ====================================================
// RENDERIZAÇÃO: DETALHE DO CANAL
// ====================================================
function renderChannelDetail(channelId) {
  const ch = DB.find('channels', channelId);
  if (!ch) return '<p style="color:var(--mut)">Canal não encontrado</p>';
  const isSub = (App.user.channels || []).includes(ch.id);
  const posts = DB.getAll('posts').filter(p => p.channelId === channelId).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  return `
    <div style="margin-bottom:20px">
      <button class="btn-ghost btn-sm" onclick="navigate('channels')" style="margin-bottom:12px"><i class="fa-solid fa-arrow-left" style="margin-right:6px"></i>Voltar</button>
    </div>
    <!-- Header do canal -->
    <div class="card" style="padding:0;overflow:hidden;margin-bottom:20px">
      <div style="height:120px;background:linear-gradient(135deg,${ch.color}60,${ch.color}20);display:flex;align-items:center;justify-content:center;position:relative">
        <i class="fa-solid ${ch.icon}" style="font-size:48px;color:${ch.color}"></i>
      </div>
      <div style="padding:20px">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
          <div>
            <h1 style="font-size:24px;font-weight:800">${escapeHtml(ch.name)}</h1>
            <div style="font-size:13px;color:var(--mut);margin-top:4px">${fmtNum(ch.members)} membros &middot; ${ch.category} &middot; Criado em ${new Date(ch.createdAt).toLocaleDateString('pt-BR')}</div>
          </div>
          <div style="display:flex;gap:8px">
            <button class="${isSub?'btn-ghost':'btn-pri'}" onclick="toggleSubscribe('${ch.id}')" style="font-size:14px">${isSub?'Inscrito':'Inscrever-se'}</button>
            <button class="btn-ghost" onclick="shareChannel('${ch.id}')" style="font-size:14px"><i class="fa-solid fa-share-nodes"></i></button>
          </div>
        </div>
        <p style="margin-top:12px;font-size:14px;color:var(--txt2);line-height:1.6">${escapeHtml(ch.description)}</p>
      </div>
    </div>

    <!-- Criar post no canal -->
    <div class="card" style="padding:14px;margin-bottom:16px;cursor:pointer" onclick="showModal('create-post','${ch.id}')">
      <div style="display:flex;align-items:center;gap:10px">
        <img src="${App.user.avatar}" class="avatar" style="width:38px;height:38px" alt="">
        <span style="color:var(--mut);font-size:14px">Publicar em ${escapeHtml(ch.name)}...</span>
      </div>
    </div>

    <!-- Posts do canal -->
    ${posts.length > 0 ? posts.map((p, i) => renderPostCard(p, i)).join('') : `
      <div style="text-align:center;padding:60px 20px;color:var(--mut)">
        <i class="fa-solid fa-seedling" style="font-size:40px;margin-bottom:12px;opacity:.4"></i>
        <p>Nenhuma publicação ainda. Seja o primeiro!</p>
      </div>
    `}
  `;
}

// ====================================================
// RENDERIZAÇÃO: PERFIL
// ====================================================
function renderProfile(userId) {
  const u = userId ? DB.find('users', userId) : App.user;
  if (!u) return '<p style="color:var(--mut)">Usuário não encontrado</p>';
  const isOwn = u.id === App.user.id;
  const userPosts = DB.getAll('posts').filter(p => p.userId === u.id).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  const subChannels = DB.getAll('channels').filter(c => (u.channels || []).includes(c.id));

  return `
    <div style="margin-bottom:20px">
      <button class="btn-ghost btn-sm" onclick="navigate('feed')" style="margin-bottom:12px"><i class="fa-solid fa-arrow-left" style="margin-right:6px"></i>Voltar</button>
    </div>
    <!-- Header do perfil -->
    <div class="card" style="padding:0;overflow:hidden;margin-bottom:20px">
      <div style="height:130px;background:linear-gradient(135deg,${u.area==='Apicultura'?'#F59E0B':u.area==='Pecuária'?'#EF4444':u.area==='Agrotech'?'#10B981':'#34D399'}50,#0A1F10);display:flex;align-items:flex-end;padding:0 24px">
      </div>
      <div style="padding:20px 24px;position:relative">
        <img src="${u.avatar}" class="avatar" style="width:80px;height:80px;border:4px solid var(--card);margin-top:-50px;position:relative;z-index:2" alt="">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-top:10px">
          <div>
            <h1 style="font-size:22px;font-weight:800">${escapeHtml(u.name)}</h1>
            <div style="font-size:14px;color:var(--mut)">@${escapeHtml(u.username)}</div>
          </div>
          ${isOwn ? `<button class="btn-ghost btn-sm" onclick="showEditProfile()"><i class="fa-solid fa-pen" style="margin-right:4px"></i>Editar</button>` : `<button class="btn-pri btn-sm" onclick="showToast('Você seguiu ${escapeHtml(u.name)}')"><i class="fa-solid fa-user-plus" style="margin-right:4px"></i>Seguir</button>`}
        </div>
        <p style="margin-top:10px;font-size:14px;color:var(--txt2);line-height:1.5">${escapeHtml(u.bio)}</p>
        <div style="display:flex;gap:16px;margin-top:12px;flex-wrap:wrap">
          ${u.location ? `<span style="font-size:13px;color:var(--mut)"><i class="fa-solid fa-location-dot" style="margin-right:4px"></i>${escapeHtml(u.location)}</span>` : ''}
          <span style="font-size:13px;color:var(--mut)"><i class="fa-solid fa-wheat-awn" style="margin-right:4px"></i>${u.area}</span>
          <span style="font-size:13px;color:var(--mut)"><i class="fa-solid fa-calendar" style="margin-right:4px"></i>Entrou em ${new Date(u.joined).toLocaleDateString('pt-BR')}</span>
        </div>
        <div style="display:flex;gap:20px;margin-top:14px">
          <span style="font-size:14px"><strong>${fmtNum(u.followers)}</strong> <span style="color:var(--mut)">seguidores</span></span>
          <span style="font-size:14px"><strong>${fmtNum(u.following)}</strong> <span style="color:var(--mut)">seguindo</span></span>
        </div>
      </div>
    </div>

    <!-- Canais inscritos -->
    ${subChannels.length > 0 ? `
    <div style="margin-bottom:24px">
      <h2 style="font-size:16px;font-weight:700;margin-bottom:10px">Canais Inscritos</h2>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${subChannels.map(ch => `
          <span class="tag" style="background:${ch.color}18;color:${ch.color};cursor:pointer;padding:6px 12px;font-size:13px" onclick="navigate('channel','${ch.id}')"><i class="fa-solid ${ch.icon}" style="margin-right:4px"></i>${escapeHtml(ch.name)}</span>
        `).join('')}
      </div>
    </div>` : ''}

    <!-- Posts do usuário -->
    <h2 style="font-size:16px;font-weight:700;margin-bottom:10px">Publicações</h2>
    ${userPosts.length > 0 ? userPosts.map((p, i) => renderPostCard(p, i)).join('') : `
      <div class="card" style="padding:40px;text-align:center;color:var(--mut)">
        <i class="fa-solid fa-seedling" style="font-size:32px;margin-bottom:8px;opacity:.3"></i>
        <p>Nenhuma publicação ainda</p>
      </div>
    `}
  `;
}

// ====================================================
// RENDERIZAÇÃO: SALVOS
// ====================================================
function renderBookmarks() {
  const bookmarked = DB.getAll('posts').filter(p => (p.bookmarks || []).includes(App.user.id));
  return `
    <div style="margin-bottom:24px">
      <h1 style="font-size:26px;font-weight:800">Salvos</h1>
      <p style="color:var(--txt2);font-size:14px;margin-top:4px">Publicações que você salvou para ler depois</p>
    </div>
    ${bookmarked.length > 0 ? bookmarked.map((p, i) => renderPostCard(p, i)).join('') : `
      <div class="card" style="padding:60px 20px;text-align:center;color:var(--mut)">
        <i class="fa-solid fa-bookmark" style="font-size:40px;margin-bottom:12px;opacity:.3"></i>
        <p style="font-size:16px">Nenhuma publicação salva</p>
        <p style="font-size:13px;margin-top:4px">Clique no ícone de favoritar para salvar publicações</p>
      </div>
    `}
  `;
}

// ====================================================
// AÇÕES EM POSTS
// ====================================================
function toggleLike(postId) {
  const posts = DB.getAll('posts');
  const post = posts.find(p => p.id === postId);
  if (!post) return;
  const idx = post.likes.indexOf(App.user.id);
  if (idx === -1) post.likes.push(App.user.id);
  else post.likes.splice(idx, 1);
  DB.set('posts', posts);
  renderContent();
}

function toggleBookmark(postId) {
  const posts = DB.getAll('posts');
  const post = posts.find(p => p.id === postId);
  if (!post) return;
  if (!post.bookmarks) post.bookmarks = [];
  const idx = post.bookmarks.indexOf(App.user.id);
  if (idx === -1) { post.bookmarks.push(App.user.id); showToast('Publicação salva!'); }
  else { post.bookmarks.splice(idx, 1); showToast('Removido dos salvos', 'info'); }
  DB.set('posts', posts);
  renderContent();
}

function sharePost(postId) {
  const post = DB.getAll('posts').find(p => p.id === postId);
  if (!post) return;
  post.shares = (post.shares || 0) + 1;
  DB.set('posts', DB.getAll('posts'));
  // Copia link simulado
  navigator.clipboard?.writeText(`https://agroconnect.com.br/post/${postId}`).then(() => {
    showToast('Link copiado para a área de transferência!');
  }).catch(() => {
    showToast('Link compartilhado!');
  });
  renderContent();
}

function shareChannel(channelId) {
  navigator.clipboard?.writeText(`https://agroconnect.com.br/channel/${channelId}`).then(() => {
    showToast('Link do canal copiado!');
  }).catch(() => {
    showToast('Link do canal compartilhado!');
  });
}

// ====================================================
// DETALHE DO POST (Modal)
// ====================================================
function showPostDetail(postId) {
  const post = DB.getAll('posts').find(p => p.id === postId);
  if (!post) return;
  const author = DB.find('users', post.userId) || App.user;
  const channel = DB.find('channels', post.channelId);
  const isLiked = post.likes.includes(App.user.id);

  let mediaHtml = '';
  if (post.type === 'image' && post.image) {
    mediaHtml = `<img src="${post.image}" style="width:100%;border-radius:12px;margin-top:12px" alt="" loading="lazy">`;
  } else if (post.type === 'video' && post.videoUrl) {
    const ytId = getYTId(post.videoUrl);
    if (ytId) mediaHtml = `<div class="yt-embed" style="margin-top:12px"><iframe src="https://www.youtube.com/embed/${ytId}" allowfullscreen loading="lazy"></iframe></div>`;
  }

  const commentsHtml = post.comments.map(c => {
    const ca = DB.find('users', c.userId) || App.user;
    return `<div class="comment-item" style="display:flex;gap:10px">
      <img src="${ca.avatar}" class="avatar" style="width:32px;height:32px" alt="">
      <div>
        <span style="font-weight:600;font-size:13px">${escapeHtml(ca.name)}</span>
        <span style="color:var(--mut);font-size:12px;margin-left:6px">${timeAgo(c.createdAt)}</span>
        <p style="font-size:13px;color:var(--txt2);margin-top:2px">${escapeHtml(c.text)}</p>
      </div>
    </div>`;
  }).join('');

  document.getElementById('post-detail-content').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <div style="display:flex;align-items:center;gap:10px">
        <img src="${author.avatar}" class="avatar" style="width:40px;height:40px;cursor:pointer" onclick="closeModal('post-detail');navigate('profile','${author.id}')" alt="">
        <div>
          <div style="font-weight:700;font-size:15px">${escapeHtml(author.name)}</div>
          <div style="font-size:12px;color:var(--mut)">@${escapeHtml(author.username)} &middot; ${timeAgo(post.createdAt)}</div>
        </div>
      </div>
      <button onclick="closeModal('post-detail')" style="background:none;border:none;color:var(--txt2);font-size:20px;cursor:pointer"><i class="fa-solid fa-xmark"></i></button>
    </div>
    ${channel ? `<span class="tag" style="background:${channel.color}18;color:${channel.color};margin-bottom:8px"><i class="fa-solid ${channel.icon}" style="font-size:10px"></i>${escapeHtml(channel.name)}</span>` : ''}
    <p style="font-size:15px;line-height:1.7;margin-top:8px">${escapeHtml(post.content)}</p>
    ${mediaHtml}
    <div style="display:flex;gap:16px;margin-top:16px;padding:10px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border)">
      <span style="font-size:13px;color:var(--txt2)"><i class="fa-${isLiked?'solid':'regular'} fa-heart" style="color:${isLiked?'var(--dan)':''};margin-right:4px"></i>${post.likes.length} curtidas</span>
      <span style="font-size:13px;color:var(--txt2)"><i class="fa-regular fa-comment" style="margin-right:4px"></i>${post.comments.length} comentários</span>
      <span style="font-size:13px;color:var(--txt2)"><i class="fa-solid fa-share-nodes" style="margin-right:4px"></i>${post.shares || 0} compartilhamentos</span>
    </div>
    <!-- Comentários -->
    <div style="margin-top:12px">
      <h3 style="font-size:15px;font-weight:700;margin-bottom:10px">Comentários</h3>
      ${commentsHtml || '<p style="color:var(--mut);font-size:13px">Nenhum comentário ainda</p>'}
    </div>
    <!-- Adicionar comentário -->
    <div style="display:flex;gap:10px;margin-top:14px;padding-top:14px;border-top:1px solid var(--border)">
      <img src="${App.user.avatar}" class="avatar" style="width:32px;height:32px" alt="">
      <input class="input-field" id="comment-input" placeholder="Escreva um comentário..." style="flex:1;padding:8px 12px;font-size:13px" onkeydown="if(event.key==='Enter')addComment('${post.id}')">
      <button class="btn-pri btn-sm" onclick="addComment('${post.id}')">Enviar</button>
    </div>
  `;
  showModal('post-detail');
}

function addComment(postId) {
  const input = document.getElementById('comment-input');
  const text = input.value.trim();
  if (!text) return;
  const posts = DB.getAll('posts');
  const post = posts.find(p => p.id === postId);
  if (!post) return;
  post.comments.push({
    id: uid(), userId: App.user.id, text, createdAt: new Date().toISOString()
  });
  DB.set('posts', posts);
  showToast('Comentário adicionado!');
  showPostDetail(postId);
}

// ====================================================
// AÇÕES EM CANAIS
// ====================================================
function toggleSubscribe(channelId) {
  const user = App.user;
  if (!user.channels) user.channels = [];
  const idx = user.channels.indexOf(channelId);
  if (idx === -1) {
    user.channels.push(channelId);
    // Atualiza membro do canal
    const ch = DB.find('channels', channelId);
    if (ch) { ch.members = (ch.members || 0) + 1; DB.update('channels', channelId, { members: ch.members }); }
    showToast('Inscrito no canal!');
  } else {
    user.channels.splice(idx, 1);
    const ch = DB.find('channels', channelId);
    if (ch) { ch.members = Math.max(0, (ch.members || 0) - 1); DB.update('channels', channelId, { members: ch.members }); }
    showToast('Desinscrito do canal', 'info');
  }
  // Atualiza user no DB
  const allUsers = DB.getAll('users');
  const uIdx = allUsers.findIndex(u => u.id === user.id);
  if (uIdx !== -1) { allUsers[uIdx] = user; DB.set('users', allUsers); }
  renderApp();
}

// ====================================================
// CRIAR POST
// ====================================================
function handleCreatePost(e) {
  e.preventDefault();
  const channelId = document.getElementById('post-channel').value;
  const content = document.getElementById('post-content').value.trim();
  const videoUrl = document.getElementById('post-video').value.trim();
  const fileInput = document.getElementById('post-image');

  if (!content) return showToast('Escreva algo na publicação', 'error');

  // Processa imagem
  const processPost = (imageData) => {
    let type = 'text';
    if (imageData) type = 'image';
    else if (videoUrl && getYTId(videoUrl)) type = 'video';

    const post = {
      id: uid(), userId: App.user.id, channelId,
      content, image: imageData, videoUrl: getYTId(videoUrl) ? videoUrl : null,
      likes: [], bookmarks: [], comments: [], shares: 0,
      createdAt: new Date().toISOString(), type
    };
    DB.push('posts', post);
    closeModal('create-post');
    // Limpa form
    document.getElementById('post-content').value = '';
    document.getElementById('post-video').value = '';
    document.getElementById('img-preview').innerHTML = '';
    fileInput.value = '';
    renderContent();
    showToast('Publicação criada com sucesso!');
  };

  if (fileInput.files && fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => processPost(e.target.result);
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    processPost(null);
  }
}

// ====================================================
// CRIAR CANAL
// ====================================================
function handleCreateChannel(e) {
  e.preventDefault();
  const name = document.getElementById('ch-name').value.trim();
  const description = document.getElementById('ch-desc').value.trim();
  const category = document.getElementById('ch-category').value;
  const icon = document.getElementById('ch-icon').value;

  if (!name || !description) return showToast('Preencha todos os campos', 'error');

  const colors = ['#10B981','#F59E0B','#EF4444','#8B5CF6','#06B6D4','#F97316','#EC4899','#14B8A6'];
  const channel = {
    id: uid(), name, slug: name.toLowerCase().replace(/\s+/g,'-'),
    description, icon, color: colors[Math.floor(Math.random()*colors.length)],
    cover: `https://picsum.photos/seed/${name.replace(/\s/g,'')}/800/200`,
    members: 1, category, createdAt: new Date().toISOString()
  };
  DB.push('channels', channel);
  // Auto-inscreve
  if (!App.user.channels) App.user.channels = [];
  App.user.channels.push(channel.id);
  const allUsers = DB.getAll('users');
  const uIdx = allUsers.findIndex(u => u.id === App.user.id);
  if (uIdx !== -1) { allUsers[uIdx] = App.user; DB.set('users', allUsers); }

  closeModal('create-channel');
  document.getElementById('ch-name').value = '';
  document.getElementById('ch-desc').value = '';
  renderApp();
  navigate('channel', channel.id);
  showToast('Canal criado com sucesso!');
}

// ====================================================
// MODAIS
// ====================================================
function showModal(name, data) {
  const modal = document.getElementById('modal-' + name);
  if (!modal) return;

  if (name === 'create-post') {
    // Popula select de canais
    const sel = document.getElementById('post-channel');
    const channels = DB.getAll('channels');
    sel.innerHTML = channels.map(ch => `<option value="${ch.id}" ${data===ch.id?'selected':''}>${ch.name}</option>`).join('');
  }

  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function closeModal(name) {
  const modal = document.getElementById('modal-' + name);
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

// ====================================================
// UTILIDADES DE FORMULÁRIO
// ====================================================
function updateCharCount() {
  const c = document.getElementById('post-content');
  document.getElementById('char-count').textContent = c.value.length;
}

function previewImage(input, previewId) {
  const preview = document.getElementById(previewId);
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.innerHTML = `<img src="${e.target.result}" style="max-width:100%;max-height:200px;border-radius:10px;object-fit:cover" alt="Preview">`;
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function pickChIcon(el) {
  document.querySelectorAll('.ch-icon-pick').forEach(e => {
    e.style.borderColor = 'var(--border)';
    e.style.background = 'var(--surface)';
  });
  el.style.borderColor = 'var(--pri)';
  el.style.background = 'var(--pri-g)';
  document.getElementById('ch-icon').value = el.dataset.icon;
}

// ====================================================
// BUSCA
// ====================================================
function handleSearch(query) {
  const resultsEl = document.getElementById('search-results');
  if (!query.trim()) { resultsEl.style.display = 'none'; return; }
  const q = query.toLowerCase();
  const users = DB.getAll('users').filter(u => u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q));
  const channels = DB.getAll('channels').filter(c => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
  const posts = DB.getAll('posts').filter(p => p.content.toLowerCase().includes(q));

  if (users.length === 0 && channels.length === 0 && posts.length === 0) {
    resultsEl.style.display = 'block';
    resultsEl.innerHTML = '<div style="padding:16px;text-align:center;color:var(--mut);font-size:13px">Nenhum resultado encontrado</div>';
    return;
  }

  let html = '';
  if (channels.length > 0) {
    html += '<div style="padding:8px 12px;font-size:11px;color:var(--mut);font-weight:700;text-transform:uppercase">Canais</div>';
    channels.slice(0,3).forEach(ch => {
      html += `<div style="padding:8px 12px;cursor:pointer;display:flex;align-items:center;gap:8px;transition:background .15s" onmouseover="this.style.background='var(--surface)'" onmouseout="this.style.background=''" onclick="document.getElementById('search-results').style.display='none';navigate('channel','${ch.id}')">
        <div style="width:28px;height:28px;border-radius:6px;background:${ch.color}20;display:flex;align-items:center;justify-content:center"><i class="fa-solid ${ch.icon}" style="font-size:12px;color:${ch.color}"></i></div>
        <span style="font-size:13px;font-weight:500">${escapeHtml(ch.name)}</span>
      </div>`;
    });
  }
  if (users.length > 0) {
    html += '<div style="padding:8px 12px;font-size:11px;color:var(--mut);font-weight:700;text-transform:uppercase">Pessoas</div>';
    users.slice(0,3).forEach(u => {
      html += `<div style="padding:8px 12px;cursor:pointer;display:flex;align-items:center;gap:8px;transition:background .15s" onmouseover="this.style.background='var(--surface)'" onmouseout="this.style.background=''" onclick="document.getElementById('search-results').style.display='none';navigate('profile','${u.id}')">
        <img src="${u.avatar}" class="avatar" style="width:28px;height:28px" alt="">
        <span style="font-size:13px;font-weight:500">${escapeHtml(u.name)}</span>
      </div>`;
    });
  }
  if (posts.length > 0) {
    html += '<div style="padding:8px 12px;font-size:11px;color:var(--mut);font-weight:700;text-transform:uppercase">Publicações</div>';
    posts.slice(0,3).forEach(p => {
      html += `<div style="padding:8px 12px;cursor:pointer;font-size:13px;color:var(--txt2);transition:background .15s" onmouseover="this.style.background='var(--surface)'" onmouseout="this.style.background=''" onclick="document.getElementById('search-results').style.display='none';showPostDetail('${p.id}')">${escapeHtml(p.content.substring(0,60))}...</div>`;
    });
  }

  resultsEl.style.display = 'block';
  resultsEl.innerHTML = html;
}

// Fecha busca ao clicar fora
document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-box')) {
    document.getElementById('search-results').style.display = 'none';
  }
});

// ====================================================
// FILTRO DO EXPLORAR
// ====================================================
function filterExplore(btn, category) {
  document.querySelectorAll('.btn-ghost.active, .btn-ghost[style*="border-color: var(--pri)"]').forEach(b => {
    b.classList.remove('active');
    b.style.borderColor = '';
    b.style.color = '';
    b.style.background = '';
  });
  btn.style.borderColor = 'var(--pri)';
  btn.style.color = 'var(--pri)';
  btn.style.background = 'var(--pri-g)';

  const channels = DB.getAll('channels');
  const cards = document.querySelectorAll('#content-area .card');
  // Refilter
  if (category === 'Todos') {
    navigate('explore');
  } else {
    const filtered = channels.filter(c => c.category === category);
    // Atualiza a seção de canais
    const chSection = document.querySelector('#content-area div[style*="grid-template-columns"]');
    if (chSection) {
      chSection.innerHTML = filtered.map(ch => {
        const isSub = (App.user.channels || []).includes(ch.id);
        return `
        <div class="card" style="padding:0;overflow:hidden;cursor:pointer" onclick="navigate('channel','${ch.id}')">
          <div style="height:70px;background:linear-gradient(135deg,${ch.color}40,${ch.color}10);display:flex;align-items:center;justify-content:center">
            <i class="fa-solid ${ch.icon}" style="font-size:28px;color:${ch.color}"></i>
          </div>
          <div style="padding:14px">
            <div style="font-weight:700;font-size:15px;margin-bottom:2px">${escapeHtml(ch.name)}</div>
            <div style="font-size:12px;color:var(--mut);margin-bottom:8px">${fmtNum(ch.members)} membros</div>
            <button class="${isSub?'btn-ghost':'btn-pri'} btn-sm" style="width:100%;margin-top:6px" onclick="event.stopPropagation();toggleSubscribe('${ch.id}')">${isSub?'Inscrito':'Inscrever-se'}</button>
          </div>
        </div>`;
      }).join('') || '<div style="grid-column:1/-1;text-align:center;color:var(--mut);padding:40px">Nenhum canal nesta categoria</div>';
    }
  }
}

// ====================================================
// EDITAR PERFIL
// ====================================================
function showEditProfile() {
  const u = App.user;
  const modal = document.getElementById('modal-post-detail');
  document.getElementById('post-detail-content').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
      <h2 style="font-size:20px;font-weight:800">Editar Perfil</h2>
      <button onclick="closeModal('post-detail')" style="background:none;border:none;color:var(--txt2);font-size:20px;cursor:pointer"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <form onsubmit="handleEditProfile(event)">
      <div style="margin-bottom:14px">
        <label style="font-size:13px;font-weight:600;color:var(--txt2);margin-bottom:6px;display:block">Nome</label>
        <input class="input-field" id="edit-name" value="${escapeHtml(u.name)}" required>
      </div>
      <div style="margin-bottom:14px">
        <label style="font-size:13px;font-weight:600;color:var(--txt2);margin-bottom:6px;display:block">Bio</label>
        <textarea class="input-field" id="edit-bio">${escapeHtml(u.bio)}</textarea>
      </div>
      <div style="margin-bottom:14px">
        <label style="font-size:13px;font-weight:600;color:var(--txt2);margin-bottom:6px;display:block">Localização</label>
        <input class="input-field" id="edit-location" value="${escapeHtml(u.location || '')}">
      </div>
      <button class="btn-pri" type="submit" style="width:100%;padding:12px;font-size:15px">Salvar Alterações</button>
    </form>
  `;
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function handleEditProfile(e) {
  e.preventDefault();
  const name = document.getElementById('edit-name').value.trim();
  const bio = document.getElementById('edit-bio').value.trim();
  const location = document.getElementById('edit-location').value.trim();
  if (!name) return showToast('Nome é obrigatório', 'error');

  App.user.name = name;
  App.user.bio = bio;
  App.user.location = location;

  const users = DB.getAll('users');
  const idx = users.findIndex(u => u.id === App.user.id);
  if (idx !== -1) { users[idx] = App.user; DB.set('users', users); }

  closeModal('post-detail');
  renderApp();
  showToast('Perfil atualizado!');
}

// ====================================================
// LOGOUT
// ====================================================
function handleLogout() {
  App.user = null;
  DB.set('currentUser', null);
  // Recarrega a página para voltar à tela de autenticação
  location.reload();
}

// ====================================================
// INICIALIZAÇÃO
// ====================================================
document.addEventListener('DOMContentLoaded', () => {
  seedDatabase();
  const currentUser = DB.get('currentUser');
  if (currentUser) {
    App.user = DB.find('users', currentUser);
    if (App.user) {
      document.getElementById('auth-screen').style.display = 'none';
      document.getElementById('main-app').style.display = 'block';
      renderApp();
    } else {
      // Usuário não encontrado, limpa o currentUser
      DB.set('currentUser', null);
    }
  }
});