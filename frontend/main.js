const DEV = true;

const BASE_URL = DEV ? 'http://127.0.0.1:5000' : '/api';

document.getElementById('search-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const county = event.target.elements.county.value;
  if (county === 'none') return;

  const resultContainer = document.getElementById('result-container');
  resultContainer.classList.remove('invisible');

  const resultTestElement = document.getElementById('result-test');

  fetch(`${BASE_URL}/county-info?county=${county}`)
    .then((response) => response.json())
    .then((result) => {
      resultTestElement.innerText = JSON.stringify(result, null, 4);
    });
});
