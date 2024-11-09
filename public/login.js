document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');

  loginForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      // Credenciais fixas para login (mock)
      const fixedUsername = 'dibrownie';
      const fixedPassword = 'Dibrownie123!';

      // Verificar se as credenciais são corretas
      if (username === fixedUsername && password === fixedPassword) {
          // Armazena a informação do login
          localStorage.setItem('userLoggedIn', 'true');
          window.location.href = 'index.html';
      } else {
          alert('Usuário ou senha inválidos.');
      }
  });
});
