var inquirer = require('inquirer');
var request = require('request');
var Sentiment = require('sentiment');
var colors = require('colors');
var convert = require('xml-js');

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
            type: 'list',
            name: 'company',
            message: "What 'company' do you need?",
            choices: [
                'PBR Petroleo Brasileiro S.A. Petrobras',
                'FB Facebook Inc',
                'BTC Bitcoin'
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
                console.log("need to do it")
                break;

            default:
                text = "Looking forward to the Weekend";
        }






        function checkprices() {
            console.log('check price :D:D:D');
        }







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
                            headers: { 'origin': 'https://cors-anywhere.herokuapp.com/https://natural-language-understanding-demo.ng.bluemix.net/api/analyze' },
                            json: true
                        }


                        request(options, function (err, res, watsondata) {
                            // if (err) {
                            //     console.error('error posting json: ', err)
                            //     throw err
                            // }

                            // console.log(watsondata);
                            if (watsondata.results != undefined) {
                                if (watsondata.results.sentiment.document.label != 'negative') {
                                    console.log(colors.bold("     " + count + ": ") + colors.gray(watsondata.results.retrieved_url));
                                    console.log(colors.green("        >> positive: " + watsondata.results.sentiment.document.score));
                                }
                                else {
                                    console.log(colors.bold("     " + count + ": ") + colors.gray(watsondata.results.retrieved_url));
                                    console.log(colors.red("        >> negative: " + watsondata.results.sentiment.document.score));

                                }
                                count++;
                            }
                        });

                    }
                    else {
                        console.log(colors.bold("     " + count + ": ") + colors.gray(results.rss.channel.item[i].link._text));
                        count++;
                    }

                    ;
                };

            });
        }
        // checknews function END



    });
//