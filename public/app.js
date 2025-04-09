document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form');
  const textarea = document.getElementById('text20');
  const errorMessage = document.getElementById('error-message');
  const randomButton = document.getElementById('random');
  const submitButton = form.querySelector('#submitBtn');

  const resetResult = () => {
    const resultContainer = document.querySelector("#result");
    if (resultContainer) {
      resultContainer.innerHTML = ''; // Clear the result container
    }
  };

  const fetchData = async (url, options = {}) => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  };

  const renderResult = (id, quote, kaskus, image_id) => {
    const template = document.getElementById('result-template');
    if (template) {
      const clone = template.content.cloneNode(true);
      const img = clone.querySelector('#result-image');
      const resultTitle = clone.querySelector('.title-bar-text');

      if (resultTitle) {
        resultTitle.innerText = `result-${id}.exe`;
      }


      if (img) {
        const prefetchImage = new Image();
        prefetchImage.src = `https://npvb6fi2oc.ufs.sh/f/${image_id}`;
        prefetchImage.onload = () => {
          img.src = prefetchImage.src;
        };

        img.dataset.id = image_id;
      }

      const doksli = clone.querySelector('#doksli');
      if (doksli) {
        doksli.href = `https://m.kaskus.co.id/show_post/${kaskus}`;
      }

      // const copyBtn = clone.querySelector('#copy');
      const saveBtn = clone.querySelector('#save');

      if (saveBtn) {
        // copyBtn.dataset.id = image_id;
        saveBtn.dataset.id = image_id;
      }

      document.querySelector("#result").appendChild(clone); // Append the cloned template to the body or desired container
    }
  };

  if (randomButton) {
    randomButton.addEventListener('click', async () => {
      resetResult(); // Clear previous results

      try {
        const data = await fetchData('/random');
        renderResult(data.id, data.quote, data.kaskus, data.image_id);
      } catch (error) {
        errorMessage.textContent = 'Failed to fetch random data. Please try again.';
        errorMessage.style.display = 'block';
      }
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission behavior

    if (textarea.value.trim() === '') {
      errorMessage.textContent = 'This field cannot be empty.';
      errorMessage.style.display = 'block';
      return;
    }

    errorMessage.style.display = 'none';
    resetResult(); // Clear previous results

    // Set loading state
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Loading...';
    submitButton.disabled = true;

    try {
      const data = await fetchData('/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quote: textarea.value.trim() }),
      });

      // Check if the response data is an array and render each result
      if (Array.isArray(data.data)) {
        data.data.forEach(item => {
          const { id, q } = item;
          renderResult(id, q.quote, q.kaskus, q.image_id);
        });
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      errorMessage.textContent = 'Failed to submit data. Please try again.';
      errorMessage.style.display = 'block';
    } finally {
      // Reset loading state
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
    }
  });
});

// Function to handle downloading the image
function handleDownload(button) {
  const imageId = button.dataset.id;
  if (imageId) {
    const imageUrl = `https://npvb6fi2oc.ufs.sh/f/${imageId}`;
    const anchor = document.createElement('a');
    anchor.href = imageUrl;
    anchor.download = `image-${imageId}.jpg`;
    anchor.target = '_blank'; // Open in a new tab
    anchor.rel = 'noopener noreferrer'; // Security measure
    anchor.click();
  }
}