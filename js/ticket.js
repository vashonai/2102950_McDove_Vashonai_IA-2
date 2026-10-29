/*
 * ticket.js
 * Coding Conf 2026 - ticket rendering logic for ticket.html
 *
 * Responsibilities:
 *  1. Read the attendee saved by validation.js from sessionStorage.
 *  2. Redirect to index.html if no valid registration exists (route guard).
 *  3. Fill the confirmation message and the glassmorphism ticket.
 */

'use strict';

const STORAGE_KEY = 'codingConfAttendee';

/**
 * Reads and parses the stored attendee.
 * @returns {object|null} the attendee, or null if missing/corrupted/incomplete
 */
function loadAttendee() {
  let attendee;

  try {
    attendee = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
  } catch (error) {
    return null;
  }

  // Every property must be present for the ticket to make sense
  const required = ['fullName', 'email', 'github', 'avatar', 'ticketId'];
  const isComplete = attendee !== null && required.every(function (key) {
    return typeof attendee[key] === 'string' && attendee[key] !== '';
  });

  return isComplete ? attendee : null;
}

/**
 * Writes the attendee's details into the page.
 * textContent is used (not innerHTML) so user input is never treated as HTML.
 * @param {object} attendee
 */
function renderTicket(attendee) {
  const githubHandle = attendee.github.slice(1); // remove the leading @

  document.title = 'Coding Conf 2026 | Ticket for ' + attendee.fullName;

  document.getElementById('congrats-name').textContent = attendee.fullName;
  document.getElementById('confirm-email').textContent = attendee.email;

  document.getElementById('ticket-name').textContent = attendee.fullName;
  document.getElementById('ticket-serial').textContent = '#' + attendee.ticketId;

  const avatar = document.getElementById('ticket-avatar');
  avatar.src = attendee.avatar;
  avatar.alt = 'Profile photo of ' + attendee.fullName;

  const githubLink = document.getElementById('ticket-github');
  githubLink.href = 'https://github.com/' + encodeURIComponent(githubHandle);
  githubLink.setAttribute('aria-label', 'GitHub profile ' + attendee.github + ' (opens in a new tab)');
  document.getElementById('ticket-github-text').textContent = attendee.github;
}

/* ---------- Start-up ---------- */

const attendee = loadAttendee();

if (attendee === null) {
  // Route guard: no registration data, so send the visitor back to the landing page
  window.location.replace('index.html');
} else {
  renderTicket(attendee);

  document.getElementById('print-ticket').addEventListener('click', function () {
    window.print();
  });

  document.getElementById('new-registration').addEventListener('click', function () {
    sessionStorage.removeItem(STORAGE_KEY);
    window.location.href = 'login.html';
  });
}
