# Study Space — Student Study Planner

A small, responsive study planner built with plain HTML, CSS, and JavaScript for the ATU beginner project. No installation, login, database, or build step is required.

## Run locally

Open `dist/index.html` in a modern browser, or run `npm start` with Node.js and open http://127.0.0.1:4173. Using the local server gives a consistent origin for browser storage.

## Features

- Add a task title and optional subject/course.
- See saved tasks, newest first.
- Mark tasks complete and incomplete.
- Delete tasks.
- Save tasks in browser localStorage after every change.
- Reject blank or whitespace-only titles and show helpful empty states.
- Extra: filter all, incomplete, and completed tasks.
- Responsive layout, keyboard controls, accessible labels, and progress counts.

Tasks are stored only in this browser on this device, separately for each site origin. Clearing browser data removes tasks. Storage failures are shown in the interface.

## Files and how it works

- `dist/index.html`: semantic structure, task form, task list, and overview.
- `dist/styles.css`: responsive layout and visual design. Google Fonts are optional; system fonts provide a fallback.
- `dist/app.js`: task state, event handlers, rendering, filtering, and storage.
- `server.cjs`: dependency-free local preview server.
- `tests.cjs`: functional tests that run the application with a lightweight DOM harness.

The JavaScript loads a validated task array from localStorage. Form submission trims the inputs and creates a task with a unique ID. Completion and deletion update that array. Each change saves the array and redraws the list and counts. User input is rendered using `textContent` so it remains plain text.

## Verification

Run `npm run check` and `node tests.cjs`. The functional checks exercise actual application handlers with a simulated DOM; they do not verify browser layout.

| Check | Expected result |
| --- | --- |
| Add title and subject | New task and course appear |
| Submit empty/whitespace title | Error appears; no task is added |
| Complete task and undo completion | List styling and counters update |
| Delete a task | Task disappears and stays deleted after reopening |
| Reopen app with saved storage | Task titles and completion remain |
| Filter tasks | Only matching tasks appear |
| Enter HTML in title | Text displays literally |
| Storage unavailable/corrupt | Helpful warning; application remains usable |

## Project and submission notes

Problem: Students need a simple place to remember study tasks across courses and track what they have finished. This app provides a persistent checklist without account setup.

The project brief also asks for a personal report, reflection, screenshot, live link, and GitHub source link. These are submission requirements, separate from this application. Review the code and write your own reflection so you can explain the implementation. AI assistance was used to generate and check this application; disclose that assistance in your report as required by the brief.

## Live application and Netlify deployment

Live application: https://splendid-cupcake-80bce6.netlify.app/

The application is deployed on Netlify from the `dist` files using a manual ZIP upload. The Netlify site is public and opens without signing in. The GitHub repository remains private; grant the instructor repository access before assessment.

`netlify.toml` sets the publish directory to `dist` for a future Git-based Netlify deployment. Changes pushed to GitHub do not automatically deploy to this manually uploaded site. Upload the current contents of `dist` to Netlify after application changes. No build command is required.

Browser tasks are local to each origin: tasks saved on the previous host do not automatically appear on the Netlify URL. No secrets belong in this repository.
