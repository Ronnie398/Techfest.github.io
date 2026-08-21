document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        target.style.transition = 'background-color 0.3s';
        target.style.backgroundColor = '#fff9db';
        setTimeout(function () {
          target.style.backgroundColor = '';
        }, 1200);
      }
    });
  });

  const footerInfo = document.getElementById('footer-info');
  if (footerInfo) {
    const now = new Date();
    const formatted = now.toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
    const firstItem = footerInfo.querySelector('li');
    if (firstItem) {
      firstItem.textContent = 'This page was last edited on ' + formatted + ', as a draft.';
    }
  }
});