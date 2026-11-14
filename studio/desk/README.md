# FREEMAN / THE DESK — Prototype 001
A living editorial workspace for Cole to share current work and ideas with Gabe. Built as a standalone subsite in studio/ on branch feature/freeman-the-desk-001. No Freeman production files are changed.

## Read first / security
The source repository colemanvii/freeman is PUBLIC. All data in desk/content.json is therefore public source data. Do not add private relationships, confidential BD opportunities, deal terms, personal remarks, access credentials, or internal documents to this repository. Robots noindex is NOT security. Protect the actual Vercel deployment with server-side Vercel Authentication or password protection; test unauthorized access before sharing with Gabe. A private repository with a proper user-specific sign-in is the long-term recommendation. Viewer feedback is currently email-based, not a shared database.

## Structure
- studio/index.html — entry page (root if a Vercel project has rootDirectory=studio).
- studio/desk/styles.css — editorial paper/light identity, responsive.
- studio/desk/app.js — reads content, filters archive, stores "last visit" and response drafts in browser, offers copy/email.
- studio/desk/content.json — source of truth for work, notes, questions and archive.
- studio/edition-002/index.html — existing real interactive studies, linked as chapters and kept unchanged here.
- studio/edition-001/index.html — the original presentation as an archive item.

## Add an entry
Edit ONLY desk/content.json. Add an object to work / notes / archive and publish a new preview commit. Store an ISO date. The homepage reads content.json on each visit without cache. For cards, use photographs already licensed and credited by Freeman. Keep claims precise: "proposed", "working study", "unapproved" where appropriate. If an idea is not approved, do not call it a commitment. No CMS or auto-publishing is claimed.

## "What's new" and feedback
This browser records last-visit time when the page is exited; the "new since visit" label compares work item dates to that timestamp. The feature is browser-local, not a server-side cross-device history. Reaction choices and the text note are browser-local. EMAIL COLE opens an email draft; the sender must press Send. There is no fake synchronized feedback save.

## Review before inviting Gabe
- Correct unverified feedback attributed to Gabe on the original Edition 002 review copy, or ask him to confirm.
- Review the letter and each study for voice, credits and permissions.
- Verify all links and access restrictions from an incognito signed-out browser.
- Do not merge to the Freeman public production branch.
