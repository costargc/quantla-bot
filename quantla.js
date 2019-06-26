var inquirer = require('inquirer');
// var request = require('request');
var colors = require('colors');
var convert = require('xml-js');
var Table = require('cli-table');
var Promise = require("bluebird");
var request = Promise.promisifyAll(require("request"), { multiArgs: true });

apikey = grabmykey();
console.log('\033[2J');

inquirer
    .prompt([
        {
            type: 'list',
            name: 'selection',
            message: 'What do you want to do?',
            choices: [
                'Check News',
                'Check Prices',
                'Check Fundamentals'
            ]
        },
        {
            when: function (response) {
                if (response.selection != 'Check Fundamentals')
                    return true;
            },
            type: 'list',
            name: 'company',
            message: "What 'coin' do you need?",
            choices: [
                'BTC Bitcoin',
                'LTC Litecoin',
                'XRP Ripple',
                'ETH Ethererum',
                'XMR Monero',
                'MAID MaidSafeCoin',
                // 'BCH Bitcoin Cash',
                // 'XEM NEM',
            ],
        },
        {
            when: function (response) {
                if (response.selection == 'Check News')
                    return true;
            },
            type: 'list',
            name: 'runSentiment',
            message: 'Run IBM Watson sentiment analysis?',
            choices: [
                'No',
                'Yes'
            ]
        },
        {
            when: function (response) {
                if (response.selection == 'Check Prices')
                    return true;
            },
            type: 'list',
            name: 'runPrice',
            message: 'Display trend analysis (buy and sell points)?',
            choices: [
                'No',
                'Yes'
            ]
        },
        {
            when: function (response) {
                if (response.selection == 'Check Fundamentals')
                    return true;
            },
            type: 'list',
            name: 'runPrice',
            message: 'What key market fundamentals do you want to check?',
            choices: [
                'US Sector Performance (realtime)',
                'Blockchain data',
                'Mining data',
                'Pool data - who owns bitcoin!'
            ]
        }
    ])
    .then(answers => {


        switch (answers.selection) {
            case 'Check News':
                checknews();
                break;

            case 'Check Prices':
                checkprices();
                break;

            case 'Check Fundamentals':
                checkfundamentals();
                break;

            default:
                text = "I don't even know how you got here! That is definetly a bug...";
        }

        function checkcolor(num) {
            if (num.indexOf("-") > -1) {
                return colors.red(num);
            }
            else {
                return colors.green(num);
            }
        }

        // checkfundamentals function START
        function checkfundamentals() {


            if (answers.runPrice == 'US Sector Performance (realtime)') {
                queryURL = 'https://www.alphavantage.co/query?function=SECTOR&apikey=' + apikey;
                request(queryURL, { json: true }, function (error, response, body) {

                    data = body['Rank A: Real-Time Performance'];
                    keys = Object.keys(body['Rank A: Real-Time Performance']);

                    var funddata = [];
                    for (i = 0; i < keys.length; i++) {
                        funddata.push(body['Rank A: Real-Time Performance'][keys[i]]);
                    }

                    var table = new Table();



                    for (i = 0; i < funddata.length; i++) {

                        table.push(
                            [
                                keys[i],
                                checkcolor(funddata[i])
                            ]
                        );
                    }

                    console.log(table.toString());

                });

            }

            else if (answers.runPrice == 'Blockchain data') {

                console.log(colors.inverse('Blockchain data'));

                // blockchain data
                queryURL = [
                    'https://api.blockchain.info/charts/market-price?cors=true&timespan=30days&format=json&lang=en',
                    'https://api.blockchain.info/charts/mempool-size?cors=true&timespan=30days&format=json&lang=en',
                    'https://api.blockchain.info/charts/avg-block-size?cors=true&timespan=30days&format=json&lang=en',
                    'https://api.blockchain.info/charts/n-transactions?cors=true&timespan=30days&format=json&lang=en',
                    'https://api.blockchain.info/charts/n-transactions-per-block?cors=true&timespan=30days&format=json&lang=en',
                    'https://api.blockchain.info/charts/median-confirmation-time?cors=true&timespan=30days&format=json&lang=en',
                    'https://api.blockchain.info/charts/n-unique-addresses?cors=true&timespan=30days&format=json&lang=en',
                ]
                let fulldata = [];
                var datainfo = [];
                var myblocktable = new Table();

                Promise.map(queryURL, function (url) {
                    return request.getAsync(url).spread(function (response, body) {
                        return [JSON.parse(body), url];
                    });
                }).then(function (results) {


                    // console.log(results[1][0].values);

                    var fulldata = [];

                    headerinfo = [
                        colors.bold(colors.white('name')),
                        colors.bold(colors.white('description')),
                        colors.bold(colors.white('val (curr)')),
                        colors.bold(colors.white('val (1m ago)')),
                        colors.bold(colors.white('Variation %')),
                    ];

                    var fulldata = new Table({
                        head: headerinfo,
                        colWidths: [15, 15, 15, 15, 15]
                    });

                    for (i = 0; i < results.length; i++) {
                        datainfo[i] = [
                            results[i][0].name,
                            results[i][0].description,
                            Math.round(results[i][0].values[results[i][0].values.length - 1].y * 1000, 0) / 1000,
                            Math.round(results[i][0].values[0].y * 1000, 0) / 1000,
                            checkcolor(Math.round((results[i][0].values[results[i][0].values.length - 1].y * 1 / results[i][0].values[0].y * 1 - 1) * 10000, 0) / 100 + '%'),
                        ];

                        fulldata.push(datainfo[i]);
                        // treatblockchaindata(data);
                    }

                    // console.log(fulldata);
                    console.log(fulldata.toString());

                })


            }
            else if (answers.runPrice == 'Mining data') {

                // mining data
                console.log(colors.inverse('Mining data'));

                // mining data
                queryURL = [
                    'https://api.blockchain.info/charts/hash-rate?cors=true&timespan=30days&format=json&lang=en',
                    'https://api.blockchain.info/charts/transaction-fees?cors=true&timespan=30days&format=json&lang=en',
                    'https://api.blockchain.info/charts/cost-per-transaction?cors=true&timespan=30days&format=json&lang=en',
                ]
                let fulldata = [];
                var datainfo = [];
                var myblocktable = new Table();

                Promise.map(queryURL, function (url) {
                    return request.getAsync(url).spread(function (response, body) {
                        return [JSON.parse(body), url];
                    });
                }).then(function (results) {


                    // console.log(results[1][0].values);

                    var fulldata = [];

                    headerinfo = [
                        colors.bold(colors.white('name')),
                        colors.bold(colors.white('description')),
                        colors.bold(colors.white('val (curr)')),
                        colors.bold(colors.white('val (1m ago)')),
                        colors.bold(colors.white('Variation %')),
                    ];

                    var fulldata = new Table({
                        head: headerinfo,
                        colWidths: [15, 15, 15, 15, 15]
                    });

                    for (i = 0; i < results.length; i++) {
                        datainfo[i] = [
                            results[i][0].name,
                            results[i][0].description,
                            Math.round(results[i][0].values[results[i][0].values.length - 1].y * 1000, 0) / 1000,
                            Math.round(results[i][0].values[0].y * 1000, 0) / 1000,
                            checkcolor(Math.round((results[i][0].values[results[i][0].values.length - 1].y * 1 / results[i][0].values[0].y * 1 - 1) * 10000, 0) / 100 + '%'),
                        ];

                        fulldata.push(datainfo[i]);
                        // treatblockchaindata(data);
                    }

                    // console.log(fulldata);
                    console.log(fulldata.toString());

                })





            }

            else {
                queryURL = 'https://api.blockchain.info/pools?cors=true';
                request(queryURL, { json: true }, function (error, response, body) {
                    keys = Object.keys(body);
                    var owndata = [];
                    var sum_pool = 0;

                    for (i = 0; i < keys.length; i++) {
                        owndata.push(body[keys[i]]);
                        sum_pool = sum_pool + body[keys[i]] * 1;
                    }

                    var owntable = new Table();
                    for (i = 0; i < owndata.length; i++) {
                        owntable.push(
                            [
                                keys[i],
                                Math.round(owndata[i] * 1 / sum_pool * 10000, 0) / 100
                            ]
                        )
                    }


                    owntable.sort(sortFunction);

                    for (i = 0; i < owndata.length; i++) {
                        owntable[i][1] = owntable[i][1]+"%"
                    }

                    function sortFunction(a, b) {
                        if (a[1] === b[1]) {
                            return 0;
                        }
                        else {
                            return (a[1] < b[1]) ? 1 : -1;
                        }
                    }

                    console.log(owntable.toString());

                });


            }



        }
        // checkfundamentals function END









        // checkprices function START
        function checkprices() {
            interval = '60min';

            choicesobj = {
                'BTC Bitcoin': 'BTCUSD',
                'LTC Litecoin': 'LTCUSD',
                'XRP Ripple': 'XRPUSD',
                'ETH Ethererum': 'ETHUSD',
                'XMR Monero': 'XMRUSD',
                'MAID MaidSafeCoin': 'MAIDUSD',
                'BCH Bitcoin Cash': 'BCHUSD',
                'XEM NEM': 'XEMUSD',
            };

            symbol = choicesobj[answers.company];

            queryURL = 'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=' + symbol + '&interval=' + interval + '&apikey=' + apikey;
            // console.log(queryURL);

            request(queryURL, { json: true }, function (error, response, body) {

                keys = Object.keys(body['Time Series (60min)']);
                // console.log(keys);

                var findata = [];
                for (i = 0; i < keys.length; i++) {
                    findata.push(body['Time Series (60min)'][keys[i]]['4. close']);
                }


                if (answers.runPrice == "Yes") {
                    var leveldata = [];
                    slevel_s = 0;
                    blevel_s = 0;
                    slevelcount = 0;
                    blevelcount = 0;
                    for (i = 0; i < findata.length - 6; i++) {
                        leveldata[i] = findata[i] / findata[i + 6] - 1;
                        if (leveldata[i] >= 0) {
                            slevel_s = slevel_s + leveldata[i];
                            slevelcount++;
                        }
                        else {
                            blevel_s = blevel_s + leveldata[i];
                            blevelcount++;
                        }
                    }



                    blevel = blevel_s / blevelcount;
                    slevel = slevel_s / slevelcount;

                    // levels and estimates can be improved in the future using Technical Indicators 
                    // https://www.fmlabs.com/reference/

                    function checktrend() {
                        if (Math.abs(blevel) > Math.abs(slevel)) {
                            return "DOWM"
                        }
                        else return "UP"
                    }

                    console.log(colors.inverse(symbol + " trading strategy"));
                    console.log(colors.yellow("   " + "Current Price:    " + findata[0]));
                    console.log(colors.yellow("   " + "Buy If Price:     " + Math.round(findata[0] * (1 + blevel) * 10000, 0) / 10000));
                    console.log(colors.yellow("   " + "Sell If Price:    " + Math.round(findata[0] * (1 + slevel) * 10000, 0) / 10000));
                    console.log(colors.yellow("   " + "Max time to hold: " + "6h"));
                    console.log(colors.yellow("   " + "Trend:            " + checktrend()));
                    console.log("\n");

                }


                console.log(colors.inverse(symbol + " most recent prices"));
                for (j = 0; j < 5; j++) {

                    if (Math.round((findata[j] * 1 / findata[j + 1] * 1 - 1) * 10000, 0) / 100 >= 0) {
                        console.log("   " + keys[j] + "   " + findata[j] + "    " + colors.green("+" + Math.round((findata[j] * 1 / findata[j + 1] * 1 - 1) * 10000, 0) / 100 + "%"));
                    }
                    else {
                        console.log("   " + keys[j] + "   " + findata[j] + "    " + colors.red(Math.round((findata[j] * 1 / findata[j + 1] * 1 - 1) * 10000, 0) / 100 + "%"));
                    }

                }


            });






        }
        // checkprices function END






        // checknews function START
        function checknews() {

            var queryURL = 'https://news.google.com/rss/search?q=' + answers.company + '+ news&hl=en-US&gl=US&ceid=US:en';

            request(queryURL, { json: true }, function (error, response, body) {

                var results = JSON.parse(convert.xml2json(body, { compact: true, spaces: 4 }));
                // console.log(results.rss.channel.item[0]);

                count = 0;
                found_news = 5;

                // console.log(body.items[0].link);
                console.log(colors.inverse("Here are some recent news that you may be interested:"));

                for (var i = 0; i < found_news; i++) {

                    // var sentiment = new Sentiment();
                    // var result = sentiment.analyze(results.rss.channel.item[0].title._text + results.rss.channel.item[0].description._text);
                    // console.log(body.items[i].title);

                    if (answers.runSentiment == "Yes") {
                        var options = {
                            url: 'https://cors-anywhere.herokuapp.com/https://natural-language-understanding-demo.ng.bluemix.net/api/analyze',
                            method: 'post',
                            contentType: 'application/json',
                            body: {
                                features: { concepts: {}, entities: {}, keywords: {}, categories: {}, emotion: {}, sentiment: {}, semantic_roles: {}, syntax: { tokens: { lemma: true, part_of_speech: true }, sentences: true } },
                                url: results.rss.channel.item[i].link._text
                            },
                            headers: {
                                'origin': 'https://cors-anywhere.herokuapp.com/https://natural-language-understanding-demo.ng.bluemix.net/api/analyze',
                                'mydate': results.rss.channel.item[i].pubDate._text
                            },
                            json: true
                        }


                        request(options, function (err, res, watsondata) {
                            // if (err) {
                            //     console.error('error posting json: ', err)
                            //     throw err
                            // }

                            // console.log(res.request.headers.mydate);

                            if (watsondata.results != undefined) {
                                if (watsondata.results.sentiment.document.label != 'negative') {
                                    console.log(colors.bold("     " + count + ": ") + colors.gray(watsondata.results.retrieved_url));
                                    console.log(colors.gray("        " + res.request.headers.mydate));
                                    console.log(colors.green("        >> positive: " + watsondata.results.sentiment.document.score));

                                }
                                else {
                                    console.log(colors.bold("     " + count + ": ") + colors.gray(watsondata.results.retrieved_url));
                                    console.log(colors.gray("        " + res.request.headers.mydate));
                                    console.log(colors.red("        >> negative: " + watsondata.results.sentiment.document.score));

                                }
                                count++;
                            }
                        });

                    }
                    else {
                        console.log(colors.bold("     " + count + ": ") + colors.gray(results.rss.channel.item[i].link._text));
                        console.log(colors.gray("        " + results.rss.channel.item[i].pubDate._text));
                        count++;

                    }

                    ;
                };

            });
        }
        // checknews function END



    });
//

function grabmykey() {
    p1 = "DZGEY11";
    p2 = "JGGNO1624";

    p1 = encrypt(p1, -10);
    p2 = encrypt(p2, -10);

    return p1 + "" + p2

};

function encrypt(msg, key) {
    var encMsg = "";

    for (var i = 0; i < msg.length; i++) {
        var code = msg.charCodeAt(i);

        // Encrypt only letters in 'A' ... 'Z' interval
        if (code >= 65 && code <= 65 + 26 - 1) {
            code -= 65;
            code = mod(code + key, 26);
            code += 65;
        }

        encMsg += String.fromCharCode(code);
    }

    return encMsg;
}

function mod(n, p) {
    if (n < 0)
        n = p - Math.abs(n) % p;

    return n % p;
}