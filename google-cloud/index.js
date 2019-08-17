const { google } = require('googleapis')
const halifaxShareDealingSdk = require('halifax-share-dealing-sdk')

const sd = halifaxShareDealingSdk({
  site: process.env.SITE,
  USERNAME: process.env.USERNAME,
  PASSWORD: process.env.PASSWORD,
  MEMORABLE_INFORMATION: {
    "Your mother's FIRST name": process.env.MOTHER,
    "Your father's FIRST name": process.env.FATHER,
    'The name of your first school': process.env.SCHOOL,
    'Your place/town of birth': process.env.BIRTHPLACE
  }
})

exports.main = () => {
  const accountsPromise = sd.login()
    .then(sd.getAccounts)
  const authPromise = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  }).getClient()

  Promise.all([accountsPromise, authPromise]).then(([accounts, auth]) => {
    const account = accounts.find(account => account.accountId === process.env.ACCOUNT_ID)

    const now = new Date()
    const timeString = now.getUTCHours() + ':' + now.getUTCMinutes() + ':' + now.getUTCSeconds()
    const request = {
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'A:F',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        range: 'A:F',
        majorDimension: 'ROWS',
        values: [
          [
            now.getTime() / 1000, // Unix time
            now.toISOString().slice(0, 10), // Date (UTC)
            timeString, // Time (UTC)
            account.totalSecurities.asText, // Securities
            account.availableToInvest.asText, // Cash
            account.totalValue.asText // Total
          ]
        ]
      },
      auth
    }

    const sheets = google.sheets({ version: 'v4', auth })
    sheets.spreadsheets.values.append(request, function (err, response) {
      if (err) console.error(err)
    })
  })
}
