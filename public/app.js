// Get the login and register form elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const expenseForm = document.getElementById('expenseForm');
const expenseList = document.getElementById('expenseList');

// Add event listeners for form submissions
loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (validateLoginForm()) {
    await handleLogin();
  }
});

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (validateRegisterForm()) {
    await handleRegister();
  }
});

expenseForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (validateExpenseForm()) {
    await handleAddExpense();
  }
});

// Function to handle login
async function handleLogin() {
  const loadingIndicator = showLoadingIndicator();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok) {
      showSuccessMessage(data.message);
      setTimeout(() => {
        window.location.href = '/'; // Redirect on successful login
      }, 2000); // 2 seconds delay
    } else {
      showErrorMessage(`Login failed: ${data.message}`);
    }
  } catch (error) {
    console.error('Login error:', error);
    showErrorMessage('An error occurred during login. Please try again later.');
  } finally {
    hideLoadingIndicator(loadingIndicator);
  }
}

// Function to handle registration
async function handleRegister() {
  const loadingIndicator = showLoadingIndicator();
  const username = document.getElementById('newUsername').value;
  const password = document.getElementById('newPassword').value;
  const email = document.getElementById('email').value;

  try {
    const response = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, email })
    });

    const data = await response.json();

    if (response.ok) {
      showSuccessMessage(data.message);
    } else {
      showErrorMessage(`Registration failed: ${data.message}`);
    }
  } catch (error) {
    console.error('Registration error:', error);
    showErrorMessage('An error occurred during registration. Please try again later.');
  } finally {
    hideLoadingIndicator(loadingIndicator);
  }
}

// Function to handle adding an expense
async function handleAddExpense() {
  const loadingIndicator = showLoadingIndicator();
  const description = document.getElementById('description').value;
  const amount = document.getElementById('amount').value;
  const date = document.getElementById('date').value;
  const category = document.getElementById('category').value;

  try {
    const response = await fetch('/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, amount, date, category })
    });

    const data = await response.json();

    if (response.ok) {
      showSuccessMessage(data.message);
      await loadExpenses(); // Reload expenses after adding
    } else {
      showErrorMessage(`Error adding expense: ${data.message}`);
    }
  } catch (error) {
    console.error('Error adding expense:', error);
    showErrorMessage('An error occurred while adding the expense. Please try again later.');
  } finally {
    hideLoadingIndicator(loadingIndicator);
  }
}

// Function to load expenses
async function loadExpenses() {
  const userId = document.getElementById('userId').value; // Assume userId is available in your form
  try {
    const response = await fetch(`/expenses/${userId}`);
    const expenses = await response.json();

    if (response.ok) {
      renderExpenses(expenses);
    } else {
      showErrorMessage('Failed to load expenses.');
    }
  } catch (error) {
    console.error('Error loading expenses:', error);
    showErrorMessage('An error occurred while loading expenses. Please try again later.');
  }
}

// Function to render expenses
function renderExpenses(expenses) {
  expenseList.innerHTML = ''; // Clear the list first
  expenses.forEach(expense => {
    const expenseItem = document.createElement('li');
    expenseItem.textContent = `${expense.description} - ${expense.amount} - ${expense.date} - ${expense.category}`;
    
    // Add delete button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => handleDeleteExpense(expense.id));
    expenseItem.appendChild(deleteButton);

    expenseList.appendChild(expenseItem);
  });
}

// Function to handle deleting an expense
async function handleDeleteExpense(expenseId) {
  const loadingIndicator = showLoadingIndicator();
  try {
    const response = await fetch(`/expenses/${expenseId}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (response.ok) {
      showSuccessMessage(data.message);
      await loadExpenses(); // Reload expenses after deletion
    } else {
      showErrorMessage(`Error deleting expense: ${data.message}`);
    }
  } catch (error) {
    console.error('Error deleting expense:', error);
    showErrorMessage('An error occurred while deleting the expense. Please try again later.');
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
  setTimeout(() => successMessage.remove(), 3000);
}

// Function to display an error message
function showErrorMessage(message) {
  const errorMessage = document.createElement('div');
  errorMessage.classList.add('error-message');
  errorMessage.textContent = message;
  document.body.appendChild(errorMessage);
  setTimeout(() => errorMessage.remove(), 3000);
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

// Function to validate login form
function validateLoginForm() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (!username || !password) {
    showErrorMessage('Please enter both username and password.');
    return false;
  }
  return true;
}

// Function to validate registration form
function validateRegisterForm() {
  const username = document.getElementById('newUsername').value;
  const password = document.getElementById('newPassword').value;
  const email = document.getElementById('email').value;

  if (!username || !password || !email) {
    showErrorMessage('Please fill in all fields.');
    return false;
  }
  return true;
}

// Function to validate expense form
function validateExpenseForm() {
  const description = document.getElementById('description').value;
  const amount = document.getElementById('amount').value;
  const date = document.getElementById('date').value;
  const category = document.getElementById('category').value;

  if (!description || !amount || !date || !category) {
    showErrorMessage('Please fill in all fields.');
    return false;
  }
  return true;
}
