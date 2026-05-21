// Sidebar active link highlight
document.querySelectorAll('.nav-link').forEach(link => {
  if (link.href === window.location.href) link.classList.add('active');
});

// Toggle switches label
document.querySelectorAll('.form-check-input[type="checkbox"]').forEach(el => {
  el.addEventListener('change', function() {
    this.title = this.checked ? 'Enabled' : 'Disabled';
  });
});
