// Dark Mode Theme Toggle
document.addEventListener('DOMContentLoaded', function() {
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const htmlElement = document.documentElement;
  
  // Check for saved theme preference or default to light mode
  const currentTheme = localStorage.getItem('theme') || 'light';
  
  // Apply saved theme on page load
  if (currentTheme === 'dark') {
    htmlElement.classList.add('dark-mode');
    themeIcon.textContent = 'light_mode';
  }
  
  // Toggle theme on button click
  themeToggle.addEventListener('click', function() {
    if (htmlElement.classList.contains('dark-mode')) {
      htmlElement.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
      themeIcon.textContent = 'dark_mode';
    } else {
      htmlElement.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
      themeIcon.textContent = 'light_mode';
    }
  });
});
