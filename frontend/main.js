const DEV = false;

const BASE_URL = DEV ? 'http://127.0.0.1:5000' : '/api';

const getBodyOfWaterOptions = (county) => {
  fetch(`${BASE_URL}/bodies?state=CA&county=${county}`)
    .then((response) => response.json())
    .then((result) => {
      const bodyOfWaterSelect = document.getElementById('body-of-water');
      bodyOfWaterSelect.innerHTML = null;
      bodyOfWaterSelect.add(new Option('Select a body of water', 'none'));
      for (let i = 0; i < result[0].length; i++) {
        bodyOfWaterSelect.add(new Option(result[0][i], result[1][i]));
      }
    });
};

window.addEventListener('load', () => {
  getBodyOfWaterOptions('Merced');
});

document.getElementById('county').addEventListener('change', (event) => {
  const county = event.target.value;
  if (county === 'none') return;
  getBodyOfWaterOptions(county);
});

document.getElementById('search-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const county = event.target.elements.county.value;
  const bodyOfWaterAUI = event.target.elements.body.value;
  if (county === 'none' || bodyOfWaterAUI === 'none') return;

  const resultContainer = document.getElementById('result-container');
  resultContainer.classList.remove('invisible');

  const resultTestElement = document.getElementById('result-test');

  fetch(`${BASE_URL}/body?aui=${bodyOfWaterAUI}`)
    .then((response) => response.json())
    .then((result) => {
      resultTestElement.innerText = JSON.stringify(result, null, 4);
    });
});
