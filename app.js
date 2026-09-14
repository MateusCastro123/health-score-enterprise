// DADOS INICIAIS
const INITIAL_USERS = [
  { id: 'u1', name: 'Administrador', email: 'admin@healthscore.com', password: 'admin123', role: 'ADMIN', department: '' },
  { id: 'u2', name: 'Gestor RH', email: 'rh@healthscore.com', password: 'rh123', role: 'RH', department: '' },
  { id: 'u3', name: 'Gestor Desenvolvimento', email: 'gestor@healthscore.com', password: 'gest123', role: 'MANAGER', department: 'TI' },
  { id: 'u4', name: 'Colaborador', email: 'colaborador@healthscore.com', password: 'col123', role: 'EMPLOYEE', department: 'TI' }
];

const INITIAL_DEPARTMENTS = [
  {
    id: 'd1',
    name: 'Tecnologia & Inovação (TI)',
    description: 'Equipe de desenvolvimento e infraestrutura',
    manager: 'u3',
    target: 85,
    healthScore: 82
  },
  {
    id: 'd2',
    name: 'Recursos Humanos',
    description: 'Gestão de pessoas e desenvolvimento organizacional',
    manager: 'u2',
    target: 88,
    healthScore: 90
  },
  {
    id: 'd3',
    name: 'Vendas & Comercial',
    description: 'Equipe comercial e relacionamento com clientes',
    manager: '',
    target: 80,
    healthScore: 78
  },
  {
    id: 'd4',
    name: 'Marketing & Comunicação',
    description: 'Branding, comunicação e estratégia digital',
    manager: '',
    target: 82,
    healthScore: 75
  }
];

const INITIAL_EMPLOYEES = [
  { id: 'e1', name: 'Ana Silva', department: 'd1', position: 'Desenvolvedora Sênior', engagement: 90, satisfaction: 95, productivity: 92, status: 'ativo' },
  { id: 'e2', name: 'Carlos Santos', department: 'd1', position: 'Desenvolvedor', engagement: 75, satisfaction: 80, productivity: 85, status: 'ativo' },
  { id: 'e3', name: 'Marina Costa', department: 'd2', position: 'Analista de Recursos Humanos', engagement: 88, satisfaction: 90, productivity: 87, status: 'ativo' },
  { id: 'e4', name: 'Paulo Mendes', department: 'd3', position: 'Gerente de Vendas', engagement: 70, satisfaction: 72, productivity: 75, status: 'ativo' },
  { id: 'e5', name: 'Juliana Oliveira', department: 'd4', position: 'Coordenadora de Marketing', engagement: 82, satisfaction: 85, productivity: 88, status: 'ativo' },
  { id: 'e6', name: 'Roberto Alves', department: 'd1', position: 'DevOps', engagement: 68, satisfaction: 65, productivity: 70, status: 'afastado' }
];

const INITIAL_SURVEYS = [
  {
    id: 'srv1',
    title: 'Pesquisa de Clima Organizacional',
    department: '',
    description: 'Avaliação geral de clima e satisfação',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    responses: 18,
    totalEmployees: 20
  },
  {
    id: 'srv2',
    title: 'Satisfação com Benefícios',
    department: 'd1',
    description: 'Avaliação dos benefícios oferecidos',
    startDate: '2026-09-05',
    endDate: '2026-09-20',
    responses: 8,
    totalEmployees: 10
  }
];

// INDICADORES DE SAÚDE
const HEALTH_INDICATORS = [
  { name: 'Engajamento', current: 80, target: 85, variation: 2.5, departments: ['d1', 'd2'] },
  { name: 'Satisfação', current: 84, target: 88, variation: -1.2, departments: ['d2', 'd3'] },
  { name: 'Retenção', current: 92, target: 95, variation: 0.5, departments: ['d1'] },
  { name: 'Produtividade', current: 83, target: 85, variation: 3.1, departments: ['d1', 'd4'] },
  { name: 'Clima Organizacional', current: 76, target: 80, variation: 2.8, departments: ['d3', 'd4'] },
  { name: 'Equilíbrio Vida-Trabalho', current: 72, target: 80, variation: 1.5, departments: ['d1', 'd2', 'd3'] }
];

// ESTADO GLOBAL
let users = JSON.parse(localStorage.getItem('healthscore_users')) || INITIAL_USERS;
let departments = JSON.parse(localStorage.getItem('healthscore_departments')) || INITIAL_DEPARTMENTS;
let employees = JSON.parse(localStorage.getItem('healthscore_employees')) || INITIAL_EMPLOYEES;
let surveys = JSON.parse(localStorage.getItem('healthscore_surveys')) || INITIAL_SURVEYS;
let currentUser = JSON.parse(localStorage.getItem('healthscore_session')) || null;

let chartDepartmentsInstance = null;
let chartTrendInstance = null;

// FUNÇÕES UTILITÁRIAS
function saveAllData() {
  localStorage.setItem('healthscore_users', JSON.stringify(users));
  localStorage.setItem('healthscore_departments', JSON.stringify(departments));
  localStorage.setItem('healthscore_employees', JSON.stringify(employees));
  localStorage.setItem('healthscore_surveys', JSON.stringify(surveys));
  if (currentUser) {
    localStorage.setItem('healthscore_session', JSON.stringify(currentUser));
  } else {
    localStorage.removeItem('healthscore_session');
  }
}

function calculateOverallHealth() {
  if (departments.length === 0) return 0;
  const avg = departments.reduce((sum, dept) => sum + dept.healthScore, 0) / departments.length;
  return Math.round(avg * 10) / 10;
}

function calculateEngagement() {
  if (employees.length === 0) return 0;
  const activeEmps = employees.filter(e => e.status === 'ativo');
  if (activeEmps.length === 0) return 0;
  const avg = activeEmps.reduce((sum, emp) => sum + emp.engagement, 0) / activeEmps.length;
  return Math.round(avg);
}

function calculateRetention() {
  if (employees.length === 0) return 0;
  const active = employees.filter(e => e.status === 'ativo').length;
  return Math.round((active / employees.length) * 100);
}

function getHealthStatus(score) {
  if (score >= 80) return { label: 'Saudável', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: '✅' };
  if (score >= 60) return { label: 'Atenção', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: '⚠️' };
  return { label: 'Crítico', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: '❌' };
}

// LOGIN
function fillLogin(email, password) {
  document.getElementById('loginEmail').value = email;
  document.getElementById('loginPassword').value = password;
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPassword').value.trim();

  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);

  if (user) {
    currentUser = user;
    saveAllData();
    document.getElementById('loginError').classList.add('hidden');
    initApp();
  } else {
    document.getElementById('loginError').classList.remove('hidden');
  }
}

function handleLogout() {
  currentUser = null;
  saveAllData();
  document.getElementById('appScreen').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
}

function initApp() {
  if (!currentUser) return;

  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('appScreen').classList.remove('hidden');

  document.getElementById('currentUserDisplay').innerText = currentUser.name;
  document.getElementById('currentRoleDisplay').innerText = getRoleLabel(currentUser.role);

  const tabDashboard = document.getElementById('tabDashboard');
  const tabDepartments = document.getElementById('tabDepartments');
  const tabEmployees = document.getElementById('tabEmployees');
  const tabSurveys = document.getElementById('tabSurveys');
  const tabUsers = document.getElementById('tabUsers');

  // Reset todas as abas
  [tabDashboard, tabDepartments, tabEmployees, tabSurveys, tabUsers].forEach(t => t.classList.add('hidden'));

  if (currentUser.role === 'ADMIN') {
    tabDashboard.classList.remove('hidden');
    tabDepartments.classList.remove('hidden');
    tabEmployees.classList.remove('hidden');
    tabSurveys.classList.remove('hidden');
    tabUsers.classList.remove('hidden');
    switchTab('dashboard');
  } else if (currentUser.role === 'RH') {
    tabDashboard.classList.remove('hidden');
    tabDepartments.classList.remove('hidden');
    tabEmployees.classList.remove('hidden');
    tabSurveys.classList.remove('hidden');
    switchTab('dashboard');
  } else if (currentUser.role === 'MANAGER') {
    tabDashboard.classList.remove('hidden');
    tabEmployees.classList.remove('hidden');
    switchTab('dashboard');
  } else {
    tabDashboard.classList.remove('hidden');
    switchTab('dashboard');
  }

  lucide.createIcons();
}

function getRoleLabel(role) {
  const labels = { ADMIN: 'Administrador', RH: 'Gestor de RH', MANAGER: 'Gestor', EMPLOYEE: 'Colaborador' };
  return labels[role] || 'Usuário';
}

function switchTab(tabName) {
  const views = ['viewDashboard', 'viewDepartments', 'viewEmployees', 'viewSurveys', 'viewUsers'];
  views.forEach(view => document.getElementById(view).classList.add('hidden'));

  const tabs = ['tabDashboard', 'tabDepartments', 'tabEmployees', 'tabSurveys', 'tabUsers'];
  tabs.forEach(tab => {
    const el = document.getElementById(tab);
    if (el) el.className = "px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-slate-400 hover:text-white";
  });

  if (tabName === 'dashboard') {
    document.getElementById('viewDashboard').classList.remove('hidden');
    document.getElementById('tabDashboard').className = "px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-indigo-600 text-white";
    renderDashboard();
  } else if (tabName === 'departments') {
    document.getElementById('viewDepartments').classList.remove('hidden');
    document.getElementById('tabDepartments').className = "px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-indigo-600 text-white";
    renderDepartments();
  } else if (tabName === 'employees') {
    document.getElementById('viewEmployees').classList.remove('hidden');
    document.getElementById('tabEmployees').className = "px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-indigo-600 text-white";
    renderEmployees();
  } else if (tabName === 'surveys') {
    document.getElementById('viewSurveys').classList.remove('hidden');
    document.getElementById('tabSurveys').className = "px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-indigo-600 text-white";
    renderSurveys();
  } else if (tabName === 'users') {
    document.getElementById('viewUsers').classList.remove('hidden');
    document.getElementById('tabUsers').className = "px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-indigo-600 text-white";
    renderUsers();
  }

  lucide.createIcons();
}

// DASHBOARD
function renderDashboard() {
  const overall = calculateOverallHealth();
  const engagement = calculateEngagement();
  const retention = calculateRetention();
  const empCount = employees.filter(e => e.status === 'ativo').length;

  document.getElementById('metricOverallHealth').innerText = overall;
  document.getElementById('metricEngagement').innerText = engagement;
  document.getElementById('metricRetention').innerText = retention;
  document.getElementById('metricEmployees').innerText = empCount;

  renderMetricsTable();
  updateCharts();
}

function renderMetricsTable() {
  const tbody = document.getElementById('metricsTableBody');
  tbody.innerHTML = '';

  HEALTH_INDICATORS.forEach(indicator => {
    const status = getHealthStatus(indicator.current);
    const deptNames = indicator.departments.map(d => departments.find(x => x.id === d)?.name || '').join(', ');
    const variationColor = indicator.variation >= 0 ? 'text-emerald-400' : 'text-rose-400';

    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-800/30 transition-all';
    tr.innerHTML = `
      <td class="p-4 font-bold text-white">${indicator.name}</td>
      <td class="p-4 text-center font-black text-lg">${indicator.current}%</td>
      <td class="p-4 text-center font-bold text-slate-300">${indicator.target}%</td>
      <td class="p-4 text-center ${variationColor} font-bold">${indicator.variation > 0 ? '+' : ''}${indicator.variation}%</td>
      <td class="p-4 text-center">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${status.bg} ${status.color} ${status.border}">
          ${status.icon} ${status.label}
        </span>
      </td>
      <td class="p-4 text-xs text-slate-400">${deptNames}</td>
    `;
    tbody.appendChild(tr);
  });
}

function updateCharts() {
  // Gráfico de Departamentos
  const ctxDept = document.getElementById('chartDepartments').getContext('2d');
  if (chartDepartmentsInstance) chartDepartmentsInstance.destroy();

  const deptLabels = departments.map(d => d.name);
  const deptScores = departments.map(d => d.healthScore);

  chartDepartmentsInstance = new Chart(ctxDept, {
    type: 'doughnut',
    data: {
      labels: deptLabels,
      datasets: [{
        data: deptScores,
        backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#f43f5e'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 } } } }
    }
  });

  // Gráfico de Tendência
  const ctxTrend = document.getElementById('chartTrend').getContext('2d');
  if (chartTrendInstance) chartTrendInstance.destroy();

  const months = ['Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago'];
  const dataEngagement = [72, 74, 76, 78, 79, 80];
  const dataSatisfaction = [78, 80, 81, 82, 83, 84];
  const dataProductivity = [75, 77, 79, 81, 82, 83];

  chartTrendInstance = new Chart(ctxTrend, {
    type: 'line',
    data: {
      labels: months,
      datasets: [
        {
          label: 'Engajamento',
          data: dataEngagement,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Satisfação',
          data: dataSatisfaction,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Produtividade',
          data: dataProductivity,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { min: 0, max: 100, ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } },
        x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
      },
      plugins: { legend: { labels: { color: '#94a3b8', font: { size: 10 } } } }
    }
  });
}

// DEPARTAMENTOS
function renderDepartments() {
  const container = document.getElementById('departmentList');
  container.innerHTML = '';

  departments.forEach(dept => {
    const manager = users.find(u => u.id === dept.manager);
    const status = getHealthStatus(dept.healthScore);
    const empCount = employees.filter(e => e.department === dept.id && e.status === 'ativo').length;

    const card = document.createElement('div');
    card.className = "bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition-all";
    card.innerHTML = `
      <div class="flex justify-between items-start gap-2">
        <div>
          <h3 class="font-bold text-white text-base">${dept.name}</h3>
          <p class="text-xs text-slate-400 mt-0.5">${dept.description}</p>
        </div>
        <span class="px-2 py-1 rounded-full text-[11px] font-extrabold border ${status.bg} ${status.color} ${status.border}">
          ${dept.healthScore}%
        </span>
      </div>

      <div class="grid grid-cols-3 gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
        <div>
          <span class="text-[10px] text-slate-500 font-bold block">COLABORADORES</span>
          <span class="text-sm font-black text-indigo-400">${empCount}</span>
        </div>
        <div>
          <span class="text-[10px] text-slate-500 font-bold block">META</span>
          <span class="text-sm font-black text-emerald-400">${dept.target}%</span>
        </div>
        <div>
          <span class="text-[10px] text-slate-500 font-bold block">GESTOR</span>
          <span class="text-[10px] font-bold text-slate-200">${manager?.name || 'Não atribuído'}</span>
        </div>
      </div>

      <div class="flex gap-2 pt-2">
        <button onclick="editDepartment('${dept.id}')" class="flex-1 px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-bold rounded-lg text-xs transition-all">
          Editar
        </button>
        <button onclick="deleteDepartment('${dept.id}')" class="flex-1 px-3 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-bold rounded-lg text-xs transition-all">
          Remover
        </button>
      </div>
    `;

    container.appendChild(card);
  });

  lucide.createIcons();
}

function openDepartmentModal() {
  document.getElementById('departmentId').value = '';
  document.getElementById('departmentForm').reset();
  document.getElementById('deptModalTitle').innerText = 'Novo Departamento';

  const select = document.getElementById('departmentManager');
  select.innerHTML = '<option value="">Sem gestor atribuído</option>';
  users.filter(u => u.role === 'MANAGER' || u.role === 'ADMIN').forEach(u => {
    select.innerHTML += `<option value="${u.id}">${u.name}</option>`;
  });

  document.getElementById('departmentModal').classList.remove('hidden');
}

function closeDepartmentModal() {
  document.getElementById('departmentModal').classList.add('hidden');
}

function editDepartment(id) {
  const dept = departments.find(d => d.id === id);
  if (!dept) return;

  openDepartmentModal();
  document.getElementById('departmentId').value = dept.id;
  document.getElementById('departmentName').value = dept.name;
  document.getElementById('departmentDesc').value = dept.description;
  document.getElementById('departmentManager').value = dept.manager;
  document.getElementById('departmentTarget').value = dept.target;
  document.getElementById('deptModalTitle').innerText = 'Editar Departamento';
}

function saveDepartment(e) {
  e.preventDefault();
  const id = document.getElementById('departmentId').value;
  const name = document.getElementById('departmentName').value.trim();
  const desc = document.getElementById('departmentDesc').value.trim();
  const manager = document.getElementById('departmentManager').value;
  const target = parseInt(document.getElementById('departmentTarget').value) || 80;

  if (id) {
    const dept = departments.find(d => d.id === id);
    if (dept) {
      dept.name = name;
      dept.description = desc;
      dept.manager = manager;
      dept.target = target;
    }
  } else {
    departments.push({
      id: 'd' + Date.now(),
      name, description: desc, manager, target,
      healthScore: Math.round(Math.random() * 40 + 60)
    });
  }

  saveAllData();
  closeDepartmentModal();
  renderDepartments();
}

function deleteDepartment(id) {
  if (confirm('Tem certeza que deseja remover este departamento?')) {
    departments = departments.filter(d => d.id !== id);
    saveAllData();
    renderDepartments();
  }
}

// COLABORADORES
function renderEmployees() {
  const tbody = document.getElementById('employeeTableBody');
  tbody.innerHTML = '';

  employees.forEach(emp => {
    const dept = departments.find(d => d.id === emp.department);
    const engagement = emp.engagement;
    const status = emp.status === 'ativo' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400';

    const tr = document.createElement('tr');
    tr.className = `hover:bg-slate-800/30 transition-all ${emp.status !== 'ativo' ? 'opacity-60' : ''}`;
    tr.innerHTML = `
      <td class="p-4 font-bold text-white">${emp.name}</td>
      <td class="p-4 text-slate-300">${dept?.name || 'Sem departamento'}</td>
      <td class="p-4 text-slate-300 text-xs">${emp.position}</td>
      <td class="p-4 text-center font-black text-indigo-400">${emp.engagement}%</td>
      <td class="p-4 text-center font-bold text-emerald-400">${emp.satisfaction}%</td>
      <td class="p-4 text-center">
        <span class="px-2 py-1 rounded-full text-[10px] font-bold ${status}">
          ${emp.status === 'ativo' ? 'Ativo' : emp.status === 'afastado' ? 'Afastado' : 'Inativo'}
        </span>
      </td>
      <td class="p-4 text-right space-x-1">
        <button onclick="editEmployee('${emp.id}')" class="p-1 text-slate-400 hover:text-indigo-400"><i data-lucide="edit-3" class="w-4 h-4"></i></button>
        <button onclick="deleteEmployee('${emp.id}')" class="p-1 text-slate-400 hover:text-rose-400"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  lucide.createIcons();
}

function openEmployeeModal() {
  document.getElementById('employeeId').value = '';
  document.getElementById('employeeForm').reset();
  document.getElementById('empModalTitle').innerText = 'Novo Colaborador';

  const select = document.getElementById('employeeDept');
  select.innerHTML = '';
  departments.forEach(d => {
    select.innerHTML += `<option value="${d.id}">${d.name}</option>`;
  });

  document.getElementById('employeeModal').classList.remove('hidden');
}

function closeEmployeeModal() {
  document.getElementById('employeeModal').classList.add('hidden');
}

function editEmployee(id) {
  const emp = employees.find(e => e.id === id);
  if (!emp) return;

  openEmployeeModal();
  document.getElementById('employeeId').value = emp.id;
  document.getElementById('employeeName').value = emp.name;
  document.getElementById('employeeDept').value = emp.department;
  document.getElementById('employeePosition').value = emp.position;
  document.getElementById('employeeEngagement').value = emp.engagement;
  document.getElementById('employeeSatisfaction').value = emp.satisfaction;
  document.getElementById('employeeProductivity').value = emp.productivity;
  document.getElementById('employeeStatus').value = emp.status;
  document.getElementById('empModalTitle').innerText = 'Editar Colaborador';
}

function saveEmployee(e) {
  e.preventDefault();
  const id = document.getElementById('employeeId').value;
  const name = document.getElementById('employeeName').value.trim();
  const dept = document.getElementById('employeeDept').value;
  const position = document.getElementById('employeePosition').value.trim();
  const engagement = parseInt(document.getElementById('employeeEngagement').value);
  const satisfaction = parseInt(document.getElementById('employeeSatisfaction').value);
  const productivity = parseInt(document.getElementById('employeeProductivity').value);
  const status = document.getElementById('employeeStatus').value;

  if (id) {
    const emp = employees.find(e => e.id === id);
    if (emp) {
      emp.name = name;
      emp.department = dept;
      emp.position = position;
      emp.engagement = engagement;
      emp.satisfaction = satisfaction;
      emp.productivity = productivity;
      emp.status = status;
    }
  } else {
    employees.push({
      id: 'e' + Date.now(),
      name, department: dept, position, engagement, satisfaction, productivity, status
    });
  }

  saveAllData();
  closeEmployeeModal();
  renderEmployees();
}

function deleteEmployee(id) {
  if (confirm('Tem certeza que deseja remover este colaborador?')) {
    employees = employees.filter(e => e.id !== id);
    saveAllData();
    renderEmployees();
  }
}

// PESQUISAS
function renderSurveys() {
  const tbody = document.getElementById('surveyTableBody');
  tbody.innerHTML = '';

  surveys.forEach(survey => {
    const dept = survey.department ? departments.find(d => d.id === survey.department)?.name : 'Todas';
    const responseRate = Math.round((survey.responses / survey.totalEmployees) * 100);

    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-800/30 transition-all';
    tr.innerHTML = `
      <td class="p-4 font-bold text-white">${survey.title}</td>
      <td class="p-4 text-slate-300 text-xs">${dept}</td>
      <td class="p-4 text-center font-bold text-indigo-400">${survey.responses}/${survey.totalEmployees}</td>
      <td class="p-4 text-center">
        <div class="flex items-center justify-center gap-2">
          <div class="w-16 bg-slate-800 rounded-full h-1.5"><div class="bg-indigo-500 h-1.5 rounded-full" style="width:${responseRate}%"></div></div>
          <span class="text-xs font-bold text-slate-300">${responseRate}%</span>
        </div>
      </td>
      <td class="p-4 text-xs text-slate-400">${survey.startDate} até ${survey.endDate}</td>
      <td class="p-4 text-right space-x-1">
        <button onclick="editSurvey('${survey.id}')" class="p-1 text-slate-400 hover:text-indigo-400"><i data-lucide="edit-3" class="w-4 h-4"></i></button>
        <button onclick="deleteSurvey('${survey.id}')" class="p-1 text-slate-400 hover:text-rose-400"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  lucide.createIcons();
}

function openSurveyModal() {
  document.getElementById('surveyId').value = '';
  document.getElementById('surveyForm').reset();
  document.getElementById('surveyModalTitle').innerText = 'Nova Pesquisa';

  const select = document.getElementById('surveyDept');
  select.innerHTML = '<option value="">Todos os Departamentos</option>';
  departments.forEach(d => {
    select.innerHTML += `<option value="${d.id}">${d.name}</option>`;
  });

  document.getElementById('surveyStartDate').value = new Date().toISOString().split('T')[0];
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 14);
  document.getElementById('surveyEndDate').value = endDate.toISOString().split('T')[0];

  document.getElementById('surveyModal').classList.remove('hidden');
}

function closeSurveyModal() {
  document.getElementById('surveyModal').classList.add('hidden');
}

function editSurvey(id) {
  const survey = surveys.find(s => s.id === id);
  if (!survey) return;

  openSurveyModal();
  document.getElementById('surveyId').value = survey.id;
  document.getElementById('surveyTitle').value = survey.title;
  document.getElementById('surveyDept').value = survey.department;
  document.getElementById('surveyDesc').value = survey.description;
  document.getElementById('surveyStartDate').value = survey.startDate;
  document.getElementById('surveyEndDate').value = survey.endDate;
  document.getElementById('surveyModalTitle').innerText = 'Editar Pesquisa';
}

function saveSurvey(e) {
  e.preventDefault();
  const id = document.getElementById('surveyId').value;
  const title = document.getElementById('surveyTitle').value.trim();
  const dept = document.getElementById('surveyDept').value;
  const desc = document.getElementById('surveyDesc').value.trim();
  const startDate = document.getElementById('surveyStartDate').value;
  const endDate = document.getElementById('surveyEndDate').value;

  if (id) {
    const survey = surveys.find(s => s.id === id);
    if (survey) {
      survey.title = title;
      survey.department = dept;
      survey.description = desc;
      survey.startDate = startDate;
      survey.endDate = endDate;
    }
  } else {
    const deptEmps = dept ? employees.filter(e => e.department === dept && e.status === 'ativo') : employees.filter(e => e.status === 'ativo');
    surveys.push({
      id: 'srv' + Date.now(),
      title, department: dept, description: desc, startDate, endDate,
      responses: 0, totalEmployees: deptEmps.length
    });
  }

  saveAllData();
  closeSurveyModal();
  renderSurveys();
}

function deleteSurvey(id) {
  if (confirm('Tem certeza que deseja remover esta pesquisa?')) {
    surveys = surveys.filter(s => s.id !== id);
    saveAllData();
    renderSurveys();
  }
}

// USUÁRIOS (ADMIN ONLY)
function renderUsers() {
  if (currentUser.role !== 'ADMIN') return;

  const tbody = document.getElementById('userTableBody');
  tbody.innerHTML = '';

  users.forEach(user => {
    const dept = user.department ? departments.find(d => d.id === user.department)?.name : '-';

    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-800/30 transition-all';
    tr.innerHTML = `
      <td class="p-4 font-bold text-white">${user.name} <span class="text-[10px] text-slate-400 block font-normal">${user.email}</span></td>
      <td class="p-4">
        <span class="px-2 py-1 rounded-md text-[10px] font-bold ${user.role === 'ADMIN' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800 text-slate-300'}">
          ${getRoleLabel(user.role)}
        </span>
      </td>
      <td class="p-4 text-slate-400 text-xs">${dept}</td>
      <td class="p-4 text-right space-x-1">
        <button onclick="editUser('${user.id}')" class="p-1 text-slate-400 hover:text-indigo-400"><i data-lucide="edit-3" class="w-4 h-4"></i></button>
        ${user.id !== currentUser.id ? `<button onclick="deleteUser('${user.id}')" class="p-1 text-slate-400 hover:text-rose-400"><i data-lucide="trash-2" class="w-4 h-4"></i></button>` : ''}
      </td>
    `;
    tbody.appendChild(tr);
  });

  lucide.createIcons();
}

function openUserModal() {
  if (currentUser.role !== 'ADMIN') return;

  document.getElementById('userId').value = '';
  document.getElementById('userForm').reset();
  document.getElementById('userModalTitle').innerText = 'Novo Usuário';

  const select = document.getElementById('userDept');
  select.innerHTML = '<option value="">Nenhum</option>';
  departments.forEach(d => {
    select.innerHTML += `<option value="${d.id}">${d.name}</option>`;
  });

  document.getElementById('userModal').classList.remove('hidden');
}

function closeUserModal() {
  document.getElementById('userModal').classList.add('hidden');
}

function editUser(id) {
  if (currentUser.role !== 'ADMIN') return;

  const user = users.find(u => u.id === id);
  if (!user) return;

  openUserModal();
  document.getElementById('userId').value = user.id;
  document.getElementById('userName').value = user.name;
  document.getElementById('userEmail').value = user.email;
  document.getElementById('userRole').value = user.role;
  document.getElementById('userDept').value = user.department;
  document.getElementById('userModalTitle').innerText = 'Editar Usuário';
}

function saveUser(e) {
  e.preventDefault();
  if (currentUser.role !== 'ADMIN') return;

  const id = document.getElementById('userId').value;
  const name = document.getElementById('userName').value.trim();
  const email = document.getElementById('userEmail').value.trim();
  const password = document.getElementById('userPassword').value.trim();
  const role = document.getElementById('userRole').value;
  const dept = document.getElementById('userDept').value;

  if (id) {
    const user = users.find(u => u.id === id);
    if (user) {
      user.name = name;
      user.email = email;
      user.role = role;
      user.department = dept;
      if (password) user.password = password;
    }
  } else {
    users.push({
      id: 'u' + Date.now(),
      name, email, password: password || '123456', role, department: dept
    });
  }

  saveAllData();
  closeUserModal();
  renderUsers();
}

function deleteUser(id) {
  if (currentUser.role !== 'ADMIN') return;

  if (confirm('Tem certeza que deseja excluir este usuário?')) {
    users = users.filter(u => u.id !== id);
    saveAllData();
    renderUsers();
  }
}

// INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  if (currentUser) {
    initApp();
  }
});
