document.addEventListener('DOMContentLoaded', () => {
  const bookingForm = document.getElementById('booking-form');
  const appointmentsList = document.getElementById('appointments-list');
  const emptyState = document.getElementById('empty-state');
  const appointmentCount = document.getElementById('appointment-count');

  let appointments = JSON.parse(localStorage.getItem('glowSkinAppointments')) || [];

  function saveAndRender() {
    localStorage.setItem('glowSkinAppointments', JSON.stringify(appointments));
    renderAppointments();
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }

  function formatMoney(value) {
    return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('client-name').value.trim();
    const phone = document.getElementById('client-phone').value.replace(/\D/g, '');
    const service = document.getElementById('service-type').value;
    const price = parseFloat(document.getElementById('service-price').value) || 0;
    const date = document.getElementById('booking-date').value;
    const time = document.getElementById('booking-time').value;

    if (!name || !phone || !date || !time) return;

    appointments.push({
      id: Date.now(),
      name, phone, service, price, date, time,
      confirmed: false, paid: false
    });

    appointments.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
    saveAndRender();
    bookingForm.reset();
  });

  window.toggleConfirmed = (id) => {
    appointments = appointments.map(app => app.id === id ? { ...app, confirmed: !app.confirmed } : app);
    saveAndRender();
  };

  window.togglePaid = (id) => {
    appointments = appointments.map(app => app.id === id ? { ...app, paid: !app.paid } : app);
    saveAndRender();
  };

  window.deleteAppointment = (id) => {
    if (confirm('Deseja realmente remover este agendamento?')) {
      appointments = appointments.filter(app => app.id !== id);
      saveAndRender();
    }
  };

  window.sendWhatsAppReminder = (id) => {
    const item = appointments.find(app => app.id === id);
    if (!item) return;

    item.confirmed = true;
    saveAndRender();

    const formattedDate = formatDate(item.date);
    const message = `Olá, ${item.name}! tudo bem? ✨%0A%0APassando para lembrar do seu agendamento de *${item.service}* no dia (${formattedDate}) às *${item.time}*.%0A%0APodemos confirmar a sua presença? 🥰`;

    let fullPhone = item.phone.startsWith('55') ? item.phone : '55' + item.phone;
    window.open(`https://wa.me/${fullPhone}?text=${message}`, '_blank');
  };

  function renderAppointments() {
    appointmentsList.innerHTML = '';

    if (appointments.length === 0) {
      emptyState.style.display = 'block';
      appointmentCount.textContent = '0 agendamentos';
      return;
    }

    emptyState.style.display = 'none';
    appointmentCount.textContent = `${appointments.length} agendamento(s)`;

    appointments.forEach(app => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${app.name}</strong><br><small style="color: #777;">${app.phone}</small></td>
        <td>${app.service}</td>
        <td><strong>${formatMoney(app.price || 0)}</strong></td>
        <td>${formatDate(app.date)}<br><small style="color: #666;">às ${app.time}</small></td>
        <td>
          <div class="status-container">
            <span class="status-tag ${app.confirmed ? 'tag-confirmed' : 'tag-pending'}" onclick="toggleConfirmed(${app.id})">
              ${app.confirmed ? 'Confirmado' : 'Pendente'}
            </span>
            <span class="status-tag ${app.paid ? 'tag-paid' : 'tag-unpaid'}" onclick="togglePaid(${app.id})">
              ${app.paid ? 'Pago' : 'Não Pago'}
            </span>
          </div>
        </td>
        <td class="actions-cell">
          <button class="btn btn-whatsapp" onclick="sendWhatsAppReminder(${app.id})"><i class="fa-brands fa-whatsapp"></i> Confirmar</button>
          <button class="btn btn-delete" onclick="deleteAppointment(${app.id})"><i class="fa-solid fa-trash"></i></button>
        </td>
      `;
      appointmentsList.appendChild(tr);
    });
  }

  renderAppointments();
});
