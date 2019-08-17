# halifax-share-dealing-google-sheets: Google Cloud Platform

This is a GCP based implementation that uses the [halifax-share-dealing-sdk](https://github.com/domdomegg/halifax-share-dealing-sdk) to track your valuation in a Google Sheet. It supports Halifax Share Dealing, IWeb Share Dealing, Bank of Scotland Share Dealing and The Lloyds Bank Direct Investments Service.

## Architecture

Runs on Google Cloud Platform using the serverless services:
- **Cloud Functions** to actually get your valuation and store it in the Google Sheet
- **Pub/Sub** to act as a trigger for the Cloud Function
- **Cloud Scheduler** to send payloads to Pub/Sub so the Cloud Function is run daily (or at whatever frequency you configure)

## Setup

This is suggested configuration, but of course you can (and should) tweak with it! This is meant as a starter app after all.

Unless you're doing other things on your Google Cloud account, this should stay within the free tier - however no guarantees are provided as pricing can change all the time and I can be wrong. As always, please be careful when deploying any kind of cloud infrastructure.

These instructions should be considered part of the software and hence are provided on an "as is" basis without warranty or liability as per the [license](https://github.com/domdomegg/halifax-share-dealing-google-sheets/blob/master/LICENSE).

1. Create a [new project](https://console.cloud.google.com/projectcreate) in Google Cloud Platform
2. Create a [new spreadsheet](https://sheets.new) in Google Sheets
	- Make sure it has at least 6 columns
	- Enter headings for the columns (in row A):
		- `Unix time`, `Date (UTC)`, `Time (UTC)`, `Securities`, `Cash`, `Total`
	- Share the sheet with the email address of the service account for your project in Google Cloud Platform, giving it `Can edit` permissions. The email address can be found [here](https://console.cloud.google.com/iam-admin/serviceaccounts) and will probably look like `<project-name>@appspot.gserviceaccount.com`.
3. Create a [new Cloud Function](https://console.cloud.google.com/functions/add)
	- Name: `halifax-share-dealing-google-sheets-function`
	- Memory allocated: `128 MB`
	- Trigger: `Cloud Pub/Sub`
	- Topic: create a new topic called `halifax-share-dealing-google-sheets-pubsub-topic`
	- Source code: use the inline editor, set the runtime to `Node.js 10` and copy the contents of [index.js](https://raw.githubusercontent.com/domdomegg/halifax-share-dealing-google-sheets/master/google-cloud/index.js) and [package.json](https://raw.githubusercontent.com/domdomegg/halifax-share-dealing-google-sheets/master/google-cloud/package.json) in.
	- Function to execute: `main`
	- Timeout: `120 seconds` (it usually executes in about 30, but just to be safe)
	- Service account: `App Engine default service account` (this needs to be the service account you shared the sheet with)
	- Retry on failure: You may want to enable this, in case an unexpected error happens (e.g. downtime at HSD) the function will retry later. It inserts the timestamp when it succeeds in the sheet so wouldn't insert incorrect data. However this does mean that it will retry even if it's not a temporary error which could rack up costs e.g. HSD change their web interface so the web scraping breaks.
	- Environment variables: Environment variables are not a secure way to store credentials and this method is not reccommended for real apps. The sample code expects the following environment variables to be set:
		- `SITE`: one of `halifax`, `iweb`, `bos`, `lloyds`
		- `USERNAME`
		- `PASSWORD`
		- `MOTHER`: Answer to question `Your mother's FIRST name`
		- `FATHER`: Answer to question `Your father's FIRST name`
		- `BIRTHPLACE`: Answer to question `Your place/town of birth`
		- `SCHOOL`: Answer to question `The name of your first school`
		- `ACCOUNT_ID`: Account id of the account to get the valuation for. Probably looks like `000123456` or `000123456ABCD`
		- `SPREADSHEET_ID`: The Google Sheets [spreadsheet id](https://developers.google.com/sheets/api/guides/concepts#spreadsheet_id) for the sheet you set up earlier
4. At this point you can test out the Cloud Function.
	- View the cloud function and navigate to the `Testing` tab
	- Leave the Triggering event as `{}`, and click `Test the function`. It should take about 2 minutes to run and fetch logs.
	- Look at the spreadsheet and check it's been properly updated
	- Read the logs to check it seems to have run without issues
5. Create a [new Cloud Scheduler job](https://console.cloud.google.com/cloudscheduler/jobs/new)
	- Name: `halifax-share-dealing-google-sheets-job`
	- Frequency: `0 0 * * *` (cron syntax to run at midnight every day - I recommend [crontab guru](https://crontab.guru/every-night-at-midnight) to test your proposed configuration if you want to change it)
	- Time zone: `World` and `Greenwich Mean Time`
	- Target: `Pub/Sub`
	- Topic: `halifax-share-dealing-google-sheets-pubsub-topic`
	- Payload: `{}`
6. At this point you can test out your Cloud Scheduler to Pub/Sub to Cloud Function pipeline.
	- Go to Coud Scheduler
	- Click `Run now` on the `halifax-share-dealing-google-sheets-job` row
	- Wait a couple of minutes and perform the checks as you did in step 4