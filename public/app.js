// Get the login and register form elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// Add event listeners for form submissions
loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  await handleLogin();
});

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  await handleRegister();
});

// Function to handle login
async function handleLogin() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok) {
      showSuccessMessage(data.message);
    } else {
      showErrorMessage(`Login failed: ${data.error}`);
    }
  } catch (error) {
    console.error('Error:', error);
    showErrorMessage('An error occurred. Please try again later.');
  }
}

// Function to handle registration
async function handleRegister() {
  const username = document.getElementById('newUsername').value;
  const password = document.getElementById('newPassword').value;

  try {
    const response = await fetch('/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok) {
      showSuccessMessage(data.message);
    } else {
      showErrorMessage(`Registration failed: ${data.error}`);
    }
  } catch (error) {
    console.error('Error:', error);
    showErrorMessage('An error occurred. Please try again later.');
  }
}

// Function to display a success message
function showSuccessMessage(message) {
  const successMessage = document.createElement('div');
  successMessage.classList.add('success-message');
  successMessage.textContent = message;
  document.body.appendChild(successMessage);
  setTimeout(() => {
    successMessage.remove();
  }, 3000);
}

// Function to display an error message
function showErrorMessage(message) {
  const errorMessage = document.createElement('div');
  errorMessage.classList.add('error-message');
  errorMessage.textContent = message;
  document.body.appendChild(errorMessage);
  setTimeout(() => {
    errorMessage.remove();
  }, 3000);
}

// Add dynamic styles for success and error messages
const styles = `
  .success-message, .error-message {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #663399;
    color: #fff;
    padding: 10px 20px;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    z-index: 100;
  }

  .error-message {
    background-color: #FF6B6B;
  }
`;

const styleElement = document.createElement('style');
styleElement.textContent = styles;
document.head.appendChild(styleElement);

function validateForm() {
    const username = document.getElementById('username');
    const password = document.getElementById('password');
  
    let isValid = true;
  
    if (username.value.trim() === '') {
      showErrorMessage('Username is required.');
      isValid = false;
    }
  
    if (password.value.trim() === '') {
      showErrorMessage('Password is required.');
      isValid = false;
    }
  
    return isValid;
  }
  
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (validateForm()) {
      await handleLogin();
    }
  });

  function checkPasswordStrength() {
    const password = document.getElementById('newPassword');
    const strengthIndicator = document.getElementById('passwordStrengthIndicator');
  
    let strength = 0;
    if (password.value.length >= 8) strength++;
    if (/[a-z]/.test(password.value)) strength++;
    if (/[A-Z]/.test(password.value)) strength++;
    if (/\d/.test(password.value)) strength++;
    if (/[^a-zA-Z\d]/.test(password.value)) strength++;
  
    strengthIndicator.textContent = `Password strength: ${strength}/5`;
    strengthIndicator.style.color = getPasswordStrengthColor(strength);
  }
  
  function getPasswordStrengthColor(strength) {
    if (strength < 3) return 'red';
    if (strength < 4) return 'orange';
    return 'green';
  }
  
  registerForm.addEventListener('input', checkPasswordStrength);

  function showLoadingIndicator() {
    const loadingIndicator = document.createElement('div');
    loadingIndicator.classList.add('loading-indicator');
    loadingIndicator.textContent = 'Loading...';
    document.body.appendChild(loadingIndicator);
    return loadingIndicator;
  }
  
  function hideLoadingIndicator(loadingIndicator) {
    loadingIndicator.remove();
  }
  
  async function handleLogin() {
    const loadingIndicator = showLoadingIndicator();
    // Login logic
    await handleLogin();
    hideLoadingIndicator(loadingIndicator);
  }
  
  async function handleRegister() {
    const loadingIndicator = showLoadingIndicator();
    // Registration logic
    await handleRegister();
    hideLoadingIndicator(loadingIndicator);
  }
  
  const styles = `
    .loading-indicator {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #663399;
      color: #fff;
      padding: 10px 20px;
      border-radius: 4px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      z-index: 100;
      animation: pulse 1s infinite;
    }
  
    @keyframes pulse {
      0% {
        transform: translate(-50%, -50%) scale(1);
      }
      50% {
        transform: translate(-50%, -50%) scale(1.1);
      }
      100% {
        transform: translate(-50%, -50%) scale(1);
      }
    }
  `;

  const passwordInputs = document.querySelectorAll('input[type="password"]');
const passwordToggleButtons = document.querySelectorAll('.password-toggle');

passwordToggleButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    const passwordInput = passwordInputs[index];
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      button.textContent = 'Hide';
    } else {
      passwordInput.type = 'password';
      button.textContent = 'Show';
    }
  });
});

const styles = `
  .password-toggle {
    position: absolute;
    top: 50%;
    right: 10px;
    transform: translateY(-50%);
    background-color: transparent;
    border: none;
    color: #663399;
    cursor: pointer;
  }
`;