const { google } = require('googleapis')
const halifaxShareDealingSdk = require('halifax-share-dealing-sdk').default

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

exports.main = async () => {
  const [sdAccounts, googleAuth] = await Promise.all([
    sd.login().then(sd.getAccounts),
    new google.auth.GoogleAuth({ scopes: ['https://www.googleapis.com/auth/spreadsheets'] }).getClient()
  ])

  const totalsPence = { totalSecurities: 0, availableToInvest: 0, totalValue: 0 }
  sdAccounts.forEach(account => {
    totalsPence.totalSecurities += Math.round(100 * account.totalSecurities.asFloat)
    totalsPence.availableToInvest += Math.round(100 * account.availableToInvest.asFloat)
    totalsPence.totalValue += Math.round(100 * account.totalValue.asFloat)
  })

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
          (totalsPence.totalSecurities / 100).toFixed(2), // Securities
          (totalsPence.availableToInvest / 100).toFixed(2), // Cash
          (totalsPence.totalValue / 100).toFixed(2) // Total
        ]
      ]
    },
    auth: googleAuth
  }

  return google.sheets('v4').spreadsheets.values.append(request)
}
