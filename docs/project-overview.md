# Email Analyzer Project Overview

## Purpose

The Email Analyzer project is a web application designed to help users understand their email habits and identify important patterns or trends within their Gmail account. By providing insights into email usage, the application aims to assist users in managing their emails more effectively.

## Functionality

The application securely connects to a user's Gmail account using OAuth and fetches email metadata (such as sender, recipient, date, and subject). It's important to note that the **full content of emails is not fetched or stored**, prioritizing user privacy. This metadata is then stored locally in the user's browser using Dexie.js, a wrapper for IndexedDB.

Once the data is fetched and stored, the application generates various statistics and visualizations. These can include:

*   Identifying most frequent contacts (senders and recipients).
*   Tracking email volume over time (e.g., emails per day, week, or month).
*   Analyzing email response times.
*   Visualizing peak email activity hours or days.

## Technology

The Email Analyzer is built with the following technologies:

*   **React**: A JavaScript library for building user interfaces.
*   **Dexie.js**: A wrapper for IndexedDB that provides a more user-friendly API for local database storage in the browser.
*   **Gmail API (OAuth)**: For securely authenticating and fetching email metadata.

A key aspect of the project's architecture is its emphasis on **security and privacy**. All user data (email metadata) is stored exclusively on the user's local machine within their browser's IndexedDB. No user data is ever sent to or stored on a central server.

## Audience

This application is intended for individuals who are looking to:

*   Gain deeper insights into their email communication patterns.
*   Identify who they communicate with most frequently.
*   Understand how their email volume changes over time.
*   Develop strategies for managing email overload and improving email productivity.
*   Analyze their email habits while ensuring their data remains private and secure on their own device.
