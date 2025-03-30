document.addEventListener('DOMContentLoaded', function() {
    const textarea = document.getElementById('text');
    const charCount = document.getElementById('char-count');
    
    textarea.addEventListener('input', function() {
        const currentLength = this.value.length;
        charCount.textContent = `${currentLength}/1000`;
        
        if (currentLength > 1000) {
            charCount.style.color = 'var(--error-color)';
        } else {
            charCount.style.color = '#6c757d';
        }
    });
});

function predict() {
    const text = document.getElementById('text').value.trim();
    const resultSection = document.getElementById('result-section');
    const predictionDiv = document.getElementById('prediction');
    const placeholder = resultSection.querySelector('.result-placeholder');
    
    if (text === '') {
        showError('Please enter some text to analyze');
        return;
    }
    
    if (text.length > 1000) {
        showError('Please limit your text to 1000 characters');
        return;
    }
    
    placeholder.innerHTML = '<i class="fas fa-spinner fa-spin"></i><p>Analyzing text...</p>';
    predictionDiv.style.display = 'none';
    placeholder.style.display = 'flex';
    
    fetch('/language-detection', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            text: text
        })
    })
    .then(function(response) {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(function(data) {
        displayResult(data.predictionText);
    })
    .catch(function(error) {
        showError('An error occurred while detecting the language');
        console.error('Error:', error);
    });
}

function displayResult(language) {
    const predictionDiv = document.getElementById('prediction');
    const placeholder = document.querySelector('.result-placeholder');
    
    const formattedLanguage = language.charAt(0).toUpperCase() + language.slice(1).toLowerCase();
    
    predictionDiv.textContent = formattedLanguage;
    placeholder.style.display = 'none';
    predictionDiv.style.display = 'block';
    
    anime({
        targets: predictionDiv,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 800,
        easing: 'easeOutExpo'
    });
    
    anime({
        targets: predictionDiv,
        scale: [1, 1.05, 1],
        duration: 1000,
        easing: 'easeInOutSine'
    });
}

function showError(message) {
    const placeholder = document.querySelector('.result-placeholder');
    placeholder.innerHTML = `<i class="fas fa-exclamation-circle"></i><p style="color: var(--error-color)">${message}</p>`;
    document.getElementById('prediction').style.display = 'none';
    placeholder.style.display = 'flex';
    
    anime({
        targets: placeholder,
        translateX: [-10, 10, -10, 10, 0],
        duration: 600,
        easing: 'easeInOutSine'
    });
}