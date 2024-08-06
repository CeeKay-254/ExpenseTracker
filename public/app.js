// Get the login and register form elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// Add event listeners for form submissions
loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (validateForm()) {
    await handleLogin();
  }
});

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (validateRegisterForm()) {
    await handleRegister();
  }
});

// Function to handle login
async function handleLogin() {
  const loadingIndicator = showLoadingIndicator();
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
  } finally {
    hideLoadingIndicator(loadingIndicator);
  }
}

// Function to handle registration
async function handleRegister() {
  const loadingIndicator = showLoadingIndicator();
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
  } finally {
    hideLoadingIndicator(loadingIndicator);
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
    right: 20px;
    background-color: #fff;
    border-radius: 4px;
    padding: 10px 20px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    z-index: 9999;
    animation: fadeIn 0.3s ease-in-out;
  }

  .success-message {
    color: #4CAF50;
  }

  .error-message {
    color: #F44336;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

// Create a style element and add the styles
const styleElement = document.createElement('style');
styleElement.textContent = styles;
document.head.appendChild(styleElement);

// Function to show a loading indicator
function showLoadingIndicator() {
  const loadingIndicator = document.createElement('div');
  loadingIndicator.classList.add('loading-indicator');
  loadingIndicator.textContent = 'Loading...';
  document.body.appendChild(loadingIndicator);
  return loadingIndicator;
}

// Function to hide the loading indicator
function hideLoadingIndicator(loadingIndicator) {
  loadingIndicator.remove();
}