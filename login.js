const toggleBtn = document.getElementById('theme-toggle');
const body = document.body;

toggleBtn.onclick = function() {
  if (body.classList.contains('light')) {
    body.classList.remove('light');
    body.classList.add('dark');
    toggleBtn.textContent = 'Switch to Light Theme';
  } else {
    body.classList.remove('dark');
    body.classList.add('light');
    toggleBtn.textContent = 'Switch to Dark Theme';
  }
};