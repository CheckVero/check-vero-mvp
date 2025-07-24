import { check_vero_mvp } from 'ic:canisters/check_vero_mvp';

async function register() {
  const id = document.getElementById('id').value;
  const email = document.getElementById('email').value;
  const name = document.getElementById('name').value;
  try {
    const result = await check_vero_mvp.registerUser(id, email, name);
    alert(result ? 'Registration successful!' : 'User already exists!');
  } catch (error) {
    alert('Error: ' + error);
  }
}

async function verify() {
  const id = document.getElementById('verifyId').value;
  const email = document.getElementById('verifyEmail').value;
  try {
    const result = await check_vero_mvp.verifyUser(id, email);
    document.getElementById('result').innerHTML = result ? 'User verified!' : 'User not found!';
  } catch (error) {
    document.getElementById('result').innerHTML = 'Error: ' + error;
  }
}
