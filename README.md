# QUANTLA-BOT (LIRI Bot)

### Overview

This is a LIRI bot. LIRI is like iPhone's SIRI. However, while SIRI is a Speech Interpretation and Recognition Interface, LIRI is a _Language_ Interpretation and Recognition Interface. LIRI will be a command line node app that takes in parameters and gives you back data.

This is a cryptocurrency trading bot that help you accessing important data to trade in the market.

To run the app you will need node:
```js
node quantla.js
```

![Screenshot](images/quantla-bot_gif.gif)

### In this bot are able to:

1. Retrieve news from google RSS based on the *crypto coin* that you want (only selected top volume ones).
    a. grab the link from the 5 recent/relevant news.
    b. run the link in IBM Watson sentiment analysis to get the score if the news is positive or negative.

2. Retrieve prices from alphavantage api.
    a. You will be able to grab the most recent 5 ticks (60min time frame) with its last variation.
    b. You will be able to request a trading analysis (that identifies an UP trend and a DOWN trend for the next 6h + give you buy and sell levels).

3. Retrieve fundamentals from blockchain.com API.
    a. You will be able to grab the most recent 5 ticks (60min time frame) with its last variation.
    b. You will be able to request a trading analysis (that identifies an UP trend and a DOWN trend for the next 6h + give you buy and sell levels).



### Instructions

1. Clone repository and run `npm install`. This should download all required packages:

```js
var inquirer = require('inquirer');
var colors = require('colors');
var convert = require('xml-js');
var Table = require('cli-table');
var Promise = require("bluebird");
var request = Promise.promisifyAll(require("request"), { multiArgs: true });
```

2. Make a `.gitignore` file to remove "/node_modules" as this is not required if you want to push to github.

3. You can choose to create a `keys.js` to store your api keys... 
```js 
require(`./keys.js`)
```

* Inside keys.js your file will look like this:

```js
console.log('this is loaded');

exports.apiservice = {
  id: process.env.APISERVICE_ID,
  secret: process.env.APISERVICE_SECRET
};
```

4. You can also create a file named `.env`, add the following to it, replacing the values with your API keys (no quotes) once you have them:

```js
# apiservice API keys

APISERVICE_ID=your-apiservoce-id
APISERVICE_SECRET=your-apiservoce-secret

```

* This file will be used by the `dotenv` package to set what are known as environment variables to the global `process.env` object in node. These are values that are meant to be specific to the computer that node is running on, and since we are gitignoring this file, they won't be pushed to github &mdash; keeping our API key information private.

* If someone wanted to clone your app from github and run it themselves, they would need to supply their own `.env` file for it to work.

5. Make a file called `random.txt`.

   * Inside of `random.txt` put the following in with no extra characters or white space:

