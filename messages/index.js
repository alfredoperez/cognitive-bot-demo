var restify = require('restify');
var builder = require('botbuilder');
var cognitiveservices = require('botbuilder-cognitiveservices');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//=========================================================
// Recognizers
//=========================================================

var qnarecognizer = new cognitiveservices.QnAMakerRecognizer({
    knowledgeBaseId: '40101e4d-1c38-46d7-abc8-877446131df4',
    subscriptionKey: '54a94dbe31eb4b2594991eadcbb5f73a',
    top: 4
});

var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/7b430935-35be-474a-b143-d6b7957dc017';
var recognizer = new builder.LuisRecognizer(model);

//=========================================================
// Bot Dialogs
//=========================================================
var intents = new builder.IntentDialog({
    recognizers: [recognizer, qnarecognizer]
});
bot.dialog('/', intents);

intents.matches('luisIntent1', builder.DialogAction.send('Inside LUIS Intent 1.'));

intents.matches('luisIntent2', builder.DialogAction.send('Inside LUIS Intent 2.'));

intents.matches('qna', [
    function (session, args, next) {
        var answerEntity = builder.EntityRecognizer.findEntity(args.entities, 'answer');
        session.send(answerEntity.entity);
    }
]);

intents.onDefault([
    function (session) {
        session.send('Sorry!! No match!!');
    }
]);