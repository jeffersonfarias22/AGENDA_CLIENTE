document.addEventListener('DOMContentLoaded', () => {
  const monthFilter = document.getElementById('month-filter');
  const totalRevenue = document.getElementById('total-revenue');
  const pendingClients = document.getElementById('pending-clients');
  const totalMonthClients = document.getElementById('total-month-clients');
  const financialList = document.getElementById('financial-list');
  const financialEmpty = document.getElementById('financial-empty');

  const today = new Date();
  const currentMonthStr = today.toISOString().slice(0, 7);
  monthFilter.value = currentMonthStr;

  let appointments = JSON.parse(localStorage.getItem('glowSkinAppointments')) || [];

  function formatMoney(value) {
    return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function formatDate(dateStr) {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }

  function updateDashboard() {
    const selectedMonth = monthFilter.value;

    const monthAppointments = appointments.filter(app => app.date.startsWith(selectedMonth));

    const revenue = monthAppointments.reduce((acc, curr) => acc + (parseFloat(curr.price) || 0), 0);
    totalRevenue.textContent = formatMoney(revenue);

    totalMonthClients.textContent = `${monthAppointments.length} cliente(s)`;

    const todayStr = new Date().toISOString().split('T')[0];
    const pending = monthAppointments.filter(app => app.date >= todayStr);
    pendingClients.textContent = `${pending.length} cliente(s)`;

    renderFinancialList(monthAppointments, todayStr);
  }

  function renderFinancialList(monthAppointments, todayStr) {
    financialList.innerHTML = '';

    if (monthAppointments.length === 0) {
      financialEmpty.style.display = 'block';
      return;
    }

    financialEmpty.style.display = 'none';

    monthAppointments.forEach(app => {
      const tr = document.createElement('tr');
      const isPending = app.date >= todayStr;

      tr.innerHTML = `
        <td>${formatDate(app.date)} às ${app.time}</td>
        <td><strong>${app.name}</strong></td>
        <td>${app.service}</td>
        <td><strong>${formatMoney(app.price || 0)}</strong></td>
        <td>
          <span class="status-badge ${isPending ? 'status-pending' : 'status-done'}">
            ${isPending ? 'Pendente' : 'Concluído'}
          </span>
        </td>
      `;

      financialList.appendChild(tr);
    });
  }

  monthFilter.addEventListener('change', updateDashboard);
  updateDashboard();
});
