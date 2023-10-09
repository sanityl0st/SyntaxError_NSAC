const DEV = true;

const BASE_URL = DEV ? 'http://127.0.0.1:5000' : '/api';

const getBodyOfWaterOptions = (county) => {
  fetch(`${BASE_URL}/bodies?state=CA&county=${county}`)
    .then((response) => response.json())
    .then((result) => {
      const bodyOfWaterSelect = document.getElementById('body-of-water');
      bodyOfWaterSelect.innerHTML = null;
      bodyOfWaterSelect.add(new Option('Select an option', 'none'));
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

  fetch(`${BASE_URL}/body?aui=${bodyOfWaterAUI}`)
    .then((response) => response.json())
    .then((result) => {
      const tableBody = document.getElementById('units-table-body');
      while (tableBody.hasChildNodes()) {
        tableBody.removeChild(tableBody.lastChild);
      }

      Object.entries(result).forEach(([key, value]) => {
        const row = tableBody.insertRow();
        const cell1 = row.insertCell();
        const cell2 = row.insertCell();
        cell1.innerHTML = key;
        cell2.innerHTML = value;
      });

      if (Object.entries(result).length === 0) {
        const row = tableBody.insertRow();
        const cell1 = row.insertCell();
        const cell2 = row.insertCell();
        cell1.innerHTML = 'No data available';
        cell2.innerHTML = '--';
      }
    });

  fetch(`${BASE_URL}/body/pollutants?aui=${bodyOfWaterAUI}`)
    .then((response) => response.json())
    .then((result) => {
      const tableBody = document.getElementById('pollutants-table-body');
      while (tableBody.hasChildNodes()) {
        tableBody.removeChild(tableBody.lastChild);
      }

      const BLACKLIST = ['PH', 'DISSOLVED OXYGEN', 'SPECIFIC CONDUCTIVITY'];

      Object.entries(result).forEach(([key, value]) => {
        if (BLACKLIST.includes(key)) return;

        const row = tableBody.insertRow();
        const cell1 = row.insertCell();
        const cell2 = row.insertCell();
        const cell3 = row.insertCell();

        cell1.innerHTML = key;
        cell3.innerHTML = value[1] ?? '--';

        switch (value[0]) {
          case 'Meeting Criteria':
            cell2.innerHTML = 'Meeting Standard';
            break;
          case 'Not assesssed':
            cell2.innerHTML = 'No Data';
            break;
          case 'Not meeting criteria':
            cell2.innerHTML = 'Detrimental to health';
            break;
          case 'Not Meeting Threshold':
            cell2.innerHTML = 'Detrimental to health';
            break;
          case 'Insufficient Information':
            cell2.innerHTML = 'Detected, but Insignificant';
            break;
          case 'Meeting Threshold':
            cell2.innerHTML = 'Meeting Standard';
            break;
          case 'Cause':
            cell2.innerHTML = 'Cause for Concern'
            break;
          default:
            cell2.innerHTML = value[0];
            break;
        }

        switch (value[1]) {
          case 'Y':
            cell3.innerHTML = 'Yes';
            break;
          case 'N':
            cell3.innerHTML = 'No';
            break;
          default:
            cell3.innerHTML = '--';
            break;
        }
      });

      if (Object.entries(result).length === 0) {
        const row = tableBody.insertRow();
        const cell1 = row.insertCell();
        const cell2 = row.insertCell();
        const cell3 = row.insertCell();
        cell1.innerHTML = 'No data available';
        cell2.innerHTML = '--';
        cell3.innerHTML = '--';
      }
    });
});
