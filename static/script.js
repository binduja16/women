// Tab functionality for potential multi-tab interface
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

const switchTab = (tab) => {
  // Update all tabs
  tabs.forEach(t => {
    const isActive = t === tab;
    t.classList.toggle('active', isActive);
    t.setAttribute('aria-selected', isActive);
    t.tabIndex = isActive ? 0 : -1;
  });

  // Update all tab contents
  tabContents.forEach(tc => {
    const shouldShow = tc.id === tab.getAttribute('aria-controls');
    tc.classList.toggle('active', shouldShow);
    tc.hidden = !shouldShow;
    
    if (shouldShow) {
      // Focus the first focusable element in the content
      const focusable = tc.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable) focusable.focus();
    }
  });
};

// Initialize tabs
tabs.forEach(tab => {
  tab.addEventListener('click', () => switchTab(tab));
  tab.addEventListener('keydown', (e) => {
    if (['Enter', 'Space', ' '].includes(e.key)) {
      e.preventDefault();
      switchTab(tab);
    }
  });
});

// Set initial active tab if none exists
if (!document.querySelector('.tab.active') && tabs.length > 0) {
  switchTab(tabs[0]);
}

// Form submission handler
document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const submitButton = form.querySelector('button[type="submit"]');
  const resultDiv = document.getElementById('result');
  
  // Disable submit button during submission
  submitButton.disabled = true;
  submitButton.innerHTML = '<span class="spinner"></span> Processing...';
  
  // Prepare form data
  const formData = new FormData(form);
  const profile = Object.fromEntries(formData.entries());
  profile.age = Number(profile.age);
  profile.interests = profile.interests.split(',').map(i => i.trim()).filter(i => i);

  try {
    const response = await fetch('/submit-profile/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Server responded with an error');
    }

    const result = await response.json();
    
    if (result.match_found) {
      resultDiv.innerHTML = `
        <div class="match-success">
          <div class="match-icon">🎉</div>
          <div class="match-details">
            <h3>Match Found!</h3>
            <p>You're compatible with <strong>${result.matched_with}</strong></p>
            <p class="compatibility-score">Compatibility Score: ${result.compatibility_score}%</p>
            ${result.shared_interests ? `<p class="shared-interests">Shared Interests: ${result.shared_interests.join(', ')}</p>` : ''}
          </div>
        </div>
      `;
    } else {
      resultDiv.innerHTML = `
        <div class="no-match">
          <div class="search-icon">🔍</div>
          <p>${result.message || "We're still searching for your perfect match. Check back later!"}</p>
        </div>
      `;
    }
    
    // Smooth scroll to results
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (error) {
    console.error('Submission error:', error);
    resultDiv.innerHTML = `
      <div class="error-message">
        <span class="error-icon">⚠️</span>
        <p>${error.message || 'Failed to submit profile. Please try again.'}</p>
      </div>
    `;
  } finally {
    // Re-enable submit button
    submitButton.disabled = false;
    submitButton.innerHTML = 'Find My Perfect Match <i class="fas fa-arrow-right"></i>';
  }
});

// Add some basic form validation
document.querySelectorAll('input[required], select[required]').forEach(field => {
  field.addEventListener('invalid', () => {
    field.classList.add('invalid');
  });
  field.addEventListener('input', () => {
    if (field.checkValidity()) {
      field.classList.remove('invalid');
    }
  });
});