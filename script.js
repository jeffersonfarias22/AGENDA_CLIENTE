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
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }

  function formatMoney(value) {
    return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function isTomorrow(dateStr) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [year, month, day] = dateStr.split('-');
    const appointmentDate = new Date(year, month - 1, day);

    return appointmentDate.toDateString() === tomorrow.toDateString();
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

    const newAppointment = {
      id: Date.now(),
      name,
      phone,
      service,
      price,
      date,
      time
    };

    appointments.push(newAppointment);
    appointments.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

    saveAndRender();
    bookingForm.reset();
  });

  window.deleteAppointment = (id) => {
    if (confirm('Deseja realmente remover este agendamento?')) {
      appointments = appointments.filter(app => app.id !== id);
      saveAndRender();
    }
  };

  window.sendWhatsAppReminder = (id) => {
    const item = appointments.find(app => app.id === id);
    if (!item) return;

    const formattedDate = formatDate(item.date);
    const message = `Olá, ${item.name}! tudo bem? ✨%0A%0APassando para lembrar do seu agendamento de *${item.service}* amanhã (${formattedDate}) às *${item.time}*.%0A%0APodemos confirmar a sua presença? 🥰`;

    let fullPhone = item.phone;
    if (!fullPhone.startsWith('55') && fullPhone.length <= 11) {
      fullPhone = '55' + fullPhone;
    }

    const whatsappUrl = `https://wa.me/${fullPhone}?text=${message}`;
    window.open(whatsappUrl, '_blank');
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
      const isTomorrowBooking = isTomorrow(app.date);

      tr.innerHTML = `
        <td>
          <strong>${app.name}</strong><br>
          <small style="color: #666;">${app.phone}</small>
        </td>
        <td>${app.service}</td>
        <td><strong>${formatMoney(app.price || 0)}</strong></td>
        <td>
          ${formatDate(app.date)} às ${app.time}
          ${isTomorrowBooking ? '<span class="badge-tomorrow">Amanhã</span>' : ''}
        </td>
        <td class="actions-cell">
          <button class="btn btn-whatsapp" onclick="sendWhatsAppReminder(${app.id})" title="Enviar Lembrete WhatsApp">
            <i class="fa-brands fa-whatsapp"></i> Confirmar
          </button>
          <button class="btn btn-delete" onclick="deleteAppointment(${app.id})" title="Remover">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      `;

      appointmentsList.appendChild(tr);
    });
  }

  renderAppointments();
});
