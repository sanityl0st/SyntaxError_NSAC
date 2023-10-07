document.getElementById('search-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const city = event.target.elements.city.value;
  if (city === 'none') return;

  const resultContainer = document.getElementById('result-container');
  resultContainer.classList.remove('invisible');

  document.getElementById('result-city').innerText = city;
  // TOOD: get data from backend and display it
});
