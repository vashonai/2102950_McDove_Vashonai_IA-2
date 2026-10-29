/*
 * validation.js
 * Coding Conf 2026 - registration form logic for login.html
 *
 * Responsibilities:
 *  1. Handle avatar selection (click or drag-and-drop) and show a preview.
 *  2. Validate every field and write error messages into the page (no alerts).
 *  3. On a valid submit, save the attendee in sessionStorage and open ticket.html.
 */

'use strict';

/* ---------- Constants ---------- */

const STORAGE_KEY = 'codingConfAttendee';
const MAX_FILE_SIZE = 500 * 1024; // 500KB in bytes
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
const UPLOAD_ICON = '../assets/images/icon-upload.svg';

// user@domain.com - letters/numbers/._%+- before the @, a domain, then a 2+ letter extension
const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

// @ followed by 1-39 letters, numbers or single hyphens (cannot start or end with a hyphen)
const GITHUB_PATTERN = /^@[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/;

/* ---------- DOM references ---------- */

const form = document.getElementById('register-form');
const avatarInput = document.getElementById('avatar');
const avatarPreview = document.getElementById('avatar-preview');
const avatarError = document.getElementById('avatar-error');
const dropzone = document.getElementById('dropzone');
const dropzoneText = document.getElementById('dropzone-text');
const dropzoneActions = document.getElementById('dropzone-actions');
const removeButton = document.getElementById('remove-avatar');
const changeButton = document.getElementById('change-avatar');
const nameInput = document.getElementById('full-name');
const emailInput = document.getElementById('email');
const githubInput = document.getElementById('github');

// Holds the uploaded image as a data URL so it can be stored as text
let avatarDataUrl = '';

/* ---------- Error helpers ---------- */

/**
 * Shows an error message under a field and marks the input as invalid.
 * @param {HTMLInputElement} input - the field being validated
 * @param {string} message - text to display
 */
function showError(input, message) {
  const errorElement = document.getElementById(input.id + '-error');
  errorElement.textContent = message;
  input.setAttribute('aria-invalid', 'true');
}

/**
 * Removes the error message from a field and marks it as valid.
 * @param {HTMLInputElement} input - the field being cleared
 */
function clearError(input) {
  const errorElement = document.getElementById(input.id + '-error');
  errorElement.textContent = '';
  input.setAttribute('aria-invalid', 'false');
}

/* ---------- Field validators (each returns true when valid) ---------- */

function validateName() {
  if (nameInput.value.trim() === '') {
    showError(nameInput, 'Please enter your full name.');
    return false;
  }
  clearError(nameInput);
  return true;
}

function validateEmail() {
  const value = emailInput.value.trim();

  if (value === '') {
    showError(emailInput, 'Please enter your email address.');
    return false;
  }
  if (!EMAIL_PATTERN.test(value)) {
    showError(emailInput, 'Please enter a valid email address (e.g. user@domain.com).');
    return false;
  }
  clearError(emailInput);
  return true;
}

function validateGithub() {
  const value = githubInput.value.trim();

  if (value === '') {
    showError(githubInput, 'Please enter your GitHub username.');
    return false;
  }
  if (!value.startsWith('@')) {
    showError(githubInput, 'Your GitHub username must start with @ (e.g. @yourusername).');
    return false;
  }
  if (!GITHUB_PATTERN.test(value)) {
    showError(githubInput, 'Use only letters, numbers and single hyphens after the @.');
    return false;
  }
  clearError(githubInput);
  return true;
}

/**
 * Checks that a file exists, is a JPG/PNG and is under 500KB.
 * @param {File|undefined} file
 * @returns {boolean}
 */
function validateAvatarFile(file) {
  if (!file) {
    showError(avatarInput, 'Please upload a profile photo.');
    return false;
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    showError(avatarInput, 'Invalid file type. Please upload a JPG or PNG image.');
    return false;
  }
  if (file.size > MAX_FILE_SIZE) {
    showError(avatarInput, 'File too large. Please upload a photo under 500KB.');
    return false;
  }
  clearError(avatarInput);
  return true;
}

/* ---------- Avatar handling ---------- */

/** Resets the upload area back to its empty state. */
function resetAvatar() {
  avatarInput.value = '';
  avatarDataUrl = '';
  avatarPreview.src = UPLOAD_ICON;
  avatarPreview.alt = '';
  dropzone.classList.remove('has-image');
  dropzoneText.hidden = false;
  dropzoneActions.hidden = true;
}

/**
 * Validates a chosen file and, if it passes, reads it and shows a preview.
 * @param {File|undefined} file
 */
function handleAvatar(file) {
  if (!validateAvatarFile(file)) {
    // Keep the error message visible but discard the rejected file
    const message = avatarError.textContent;
    resetAvatar();
    showError(avatarInput, message);
    return;
  }

  const reader = new FileReader();

  reader.addEventListener('load', function () {
    avatarDataUrl = reader.result;
    avatarPreview.src = avatarDataUrl;
    avatarPreview.alt = 'Preview of your uploaded avatar';
    dropzone.classList.add('has-image');
    dropzoneText.hidden = true;
    dropzoneActions.hidden = false;
  });

  reader.addEventListener('error', function () {
    resetAvatar();
    showError(avatarInput, 'Sorry, that image could not be read. Please try another.');
  });

  reader.readAsDataURL(file);
}

avatarInput.addEventListener('change', function () {
  // Cancelling the file dialog fires "change" with no file; keep any existing preview
  if (avatarInput.files.length === 0) {
    return;
  }
  handleAvatar(avatarInput.files[0]);
});

// Drag-and-drop: highlight the drop area while a file is over it
['dragenter', 'dragover'].forEach(function (eventName) {
  dropzone.addEventListener(eventName, function (event) {
    event.preventDefault();
    dropzone.classList.add('is-dragover');
  });
});

['dragleave', 'drop'].forEach(function (eventName) {
  dropzone.addEventListener(eventName, function (event) {
    event.preventDefault();
    dropzone.classList.remove('is-dragover');
  });
});

dropzone.addEventListener('drop', function (event) {
  const file = event.dataTransfer.files[0];
  handleAvatar(file);
});

removeButton.addEventListener('click', function () {
  resetAvatar();
  avatarInput.focus();
});

changeButton.addEventListener('click', function () {
  avatarInput.click();
});

/* ---------- Live feedback ---------- */

// Validate when the user leaves a field, then re-check as they type to clear errors quickly
[
  { input: nameInput, validate: validateName },
  { input: emailInput, validate: validateEmail },
  { input: githubInput, validate: validateGithub }
].forEach(function (field) {
  field.input.addEventListener('blur', field.validate);
  field.input.addEventListener('input', function () {
    if (field.input.getAttribute('aria-invalid') === 'true') {
      field.validate();
    }
  });
});

/* ---------- Form submission ---------- */

/**
 * Creates a random five-digit ticket number, e.g. 01609.
 * @returns {string}
 */
function generateTicketId() {
  return String(Math.floor(Math.random() * 100000)).padStart(5, '0');
}

form.addEventListener('submit', function (event) {
  event.preventDefault();

  // The avatar is valid only if a file passed the checks and finished loading
  const avatarValid = avatarDataUrl !== '' || validateAvatarFile(avatarInput.files[0]);

  // Run every validator so all errors appear at once
  const results = [avatarValid, validateName(), validateEmail(), validateGithub()];

  if (results.includes(false)) {
    // Move keyboard focus to the first field that needs attention
    const firstInvalid = form.querySelector('[aria-invalid="true"]');
    if (firstInvalid) {
      firstInvalid.focus();
    }
    return;
  }

  const attendee = {
    fullName: nameInput.value.trim(),
    email: emailInput.value.trim(),
    github: githubInput.value.trim(),
    avatar: avatarDataUrl,
    ticketId: generateTicketId()
  };

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attendee));
  } catch (error) {
    showError(avatarInput, 'Your browser could not save this registration. Try a smaller image.');
    avatarInput.focus();
    return;
  }

  window.location.href = 'ticket.html';
});
