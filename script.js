const RATE_TABLE = {
  pkg1: {
    label: 'Package 1 (up to 20pax)',
    daytime: { weekday: 6500, weekend: 7500, label: 'Daytime — 8am–6pm (10hrs)' },
    overnight: { weekday: 6500, weekend: 7500, label: 'Overnight — 8pm–6am (10hrs)' },
    fullday: { weekday: 13000, weekend: 14000, label: 'Full Day — 8am–6am / 8pm–6pm (22hrs)' }
  },
  pkg2: {
    label: 'Package 2 (up to 30pax*)',
    daytime: { weekday: 7500, weekend: 8500, label: 'Daytime — 8am–6pm (10hrs)' },
    overnight: { weekday: 7500, weekend: 8500, label: 'Overnight — 8pm–6am (10hrs)' },
    fullday: { weekday: 15000, weekend: 16000, label: 'Full Day — 8am–6am / 8pm–6pm (22hrs)' }
  }
};

// DOM Elements
const filterBtns = document.querySelectorAll('.filter-btn');
const rateRows = document.querySelectorAll('.rate-row');

const bookingForm = document.getElementById('bookingForm');
const guestName = document.getElementById('guestName');
const guestEmail = document.getElementById('guestEmail');
const guestPhone = document.getElementById('guestPhone');
const preferredDate = document.getElementById('preferredDate');
const pkgSelect = document.getElementById('pkgSelect');
const schedSelect = document.getElementById('schedSelect');
const dayTypeSelect = document.getElementById('dayTypeSelect');
const extraNotes = document.getElementById('extraNotes');
const confirmDetails = document.getElementById('confirmDetails');

const estimateBox = document.getElementById('estimateBox');
const estimateAmount = document.getElementById('estimateAmount');
const estimateNote = document.getElementById('estimateNote');
const submitBtn = document.getElementById('submitBtn');
const copyBtn = document.getElementById('copyBtn');
const statusBanner = document.getElementById('statusBanner');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function formatPeso(num) {
  return '₱' + num.toLocaleString('en-PH');
}

function showStatus(message, type) {
  statusBanner.className = 'status-banner';
  void statusBanner.offsetWidth; // Reflow para mag-replay ang spring entrance
  statusBanner.textContent = message;
  statusBanner.className = `status-banner ${type}`;
}

// Schedule Filter Buttons with calm spring reveal
filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    rateRows.forEach((row) => {
      const matches = filter === 'all' || row.dataset.schedule === filter;
      if (matches) {
        row.classList.remove('hidden');
        row.classList.add('is-revealing');
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            row.classList.remove('is-revealing');
          });
        });
      } else {
        row.classList.add('hidden');
        row.classList.remove('is-revealing');
      }
    });
  });
});

// Auto-detect Weekday vs Weekend kapag pumili ng date
preferredDate.addEventListener('change', () => {
  if (!preferredDate.value) return;
  const selected = new Date(preferredDate.value + 'T00:00:00');
  const day = selected.getDay(); // 0 = Sun, 5 = Fri, 6 = Sat
  dayTypeSelect.value = day === 0 || day === 5 || day === 6 ? 'weekend' : 'weekday';
  updateEstimate(true);
});

function getCurrentSelection() {
  const pkg = RATE_TABLE[pkgSelect.value];
  const sched = pkg[schedSelect.value];
  const dayType = dayTypeSelect.value;
  const dayTypeLabel = dayTypeSelect.options[dayTypeSelect.selectedIndex].text;
  const amount = formatPeso(sched[dayType]);

  return {
    packageLabel: pkg.label,
    scheduleLabel: sched.label,
    dayTypeLabel,
    amount
  };
}

function updateEstimate(withSpringPulse = false) {
  const info = getCurrentSelection();
  estimateAmount.textContent = info.amount;
  estimateNote.textContent = `${info.packageLabel} • ${info.scheduleLabel} • ${info.dayTypeLabel}`;

  if (withSpringPulse && estimateBox) {
    estimateBox.classList.remove('is-pulsing');
    void estimateBox.offsetWidth;
    estimateBox.classList.add('is-pulsing');
    setTimeout(() => estimateBox.classList.remove('is-pulsing'), 180);
  }
}

[pkgSelect, schedSelect, dayTypeSelect].forEach((el) => {
  el.addEventListener('change', () => updateEstimate(true));
});

// Copy Inquiry Text para sa FB Messenger / SMS
copyBtn.addEventListener('click', async () => {
  const info = getCurrentSelection();
  const text =
    `Hi Balay da Cabral - Private Resort! I'd like to inquire about availability:\n` +
    `• Name: ${guestName.value.trim() || 'N/A'}\n` +
    `• Contact: ${guestPhone.value.trim() || 'N/A'}\n` +
    `• Preferred Date: ${preferredDate.value || 'Flexible'}\n` +
    `• Package: ${info.packageLabel}\n` +
    `• Schedule: ${info.scheduleLabel}\n` +
    `• Day Type: ${info.dayTypeLabel}\n` +
    `• Estimated Rate: ${info.amount}\n` +
    `• Notes: ${extraNotes.value.trim() || 'None'}`;

  try {
    await navigator.clipboard.writeText(text);
    showStatus('Na-copy na ang booking message! Puwede mo na itong i-paste sa Facebook Page o i-text sa 09973740298.', 'success');
  } catch (err) {
    showStatus('Hindi ma-access ang clipboard. Puwede mong i-send direktang email gamit ang form.', 'error');
  }
});

// Submit via EmailJS with Calm Friction pacing
bookingForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!confirmDetails.checked) {
    showStatus('Pakilagyan muna ng check ang confirmation bago magpadala ng inquiry.', 'error');
    return;
  }

  const info = getCurrentSelection();

  const templateParams = {
    resort_name: 'Balay da Cabral - Private Resort',
    guest_name: guestName.value.trim(),
    guest_email: guestEmail.value.trim(),
    guest_phone: guestPhone.value.trim(),
    preferred_date: preferredDate.value,
    package_name: info.packageLabel,
    schedule_type: info.scheduleLabel,
    day_type: info.dayTypeLabel,
    estimated_rate: info.amount,
    extra_notes: extraNotes.value.trim() || 'None'
  };

  submitBtn.disabled = true;
  submitBtn.textContent = 'Reviewing details...';

  try {
    // Calm friction pause para mahinahon at sinadya ang pagpapadala
    await wait(350);
    submitBtn.textContent = 'Sending...';

    await sendBookingEmail(templateParams);
    showStatus(
      `Salamat, ${templateParams.guest_name}! Naipadala na ang iyong inquiry para sa ${info.packageLabel} (${preferredDate.value}).`,
      'success'
    );
    bookingForm.reset();
    updateEstimate(true);
  } catch (error) {
    showStatus(error.message || 'May error sa pagpapadala ng email. Subukan muli.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Inquiry via Email';
  }
});

// Set minimum selectable date to today
preferredDate.min = new Date().toISOString().split('T')[0];
updateEstimate(false);