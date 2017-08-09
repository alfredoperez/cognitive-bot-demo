"use strict";
var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");
var path = require('path');

var cognitiveservices = require('botbuilder-cognitiveservices');
var useEmulator = (process.env.NODE_ENV == 'development');

//=========================================================
// Bot Setup
//=========================================================

// Create chat bot
var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});
var bot = new builder.UniversalBot(connector);

// Setup Restify Server
if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function () {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());
} else {
    module.exports = {
        default: connector.listen()
    }
}

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