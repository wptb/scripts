console.log('[Amazon CloudWatch Notification]');

/*
 configuration for each condition.
 add any conditions here
*/
var ALARM_CONFIG = [
	{
		condition: "ALARM:",
		channel: "#alerts",
//		mention: "<@channel> ",
		color: "danger",
		severity: "WARNING"
	},
	{
		condition: "OK",
		channel: "#alerts",
//		mention: "<@channel> ",
		color: "good",
		severity: "WARNING"
	}
];

// replace with your custom integration in slack
var SLACK_CONFIG = {
	path: "INCOMING_WEBHOOK",
};

var http = require ('https');
var querystring = require ('querystring');

exports.handler = function(event, context) {
	console.log(event.Records[0]);

	// parse information
	var message = JSON.parse(event.Records[0].Sns.Message);
	var subject = event.Records[0].Sns.Subject;
	var timestamp = event.Records[0].Sns.Timestamp;

	// vars for final message
	var channel;
	var severity;
	var color;
	
	  var alarmName = message.AlarmName;
    var newState = message.NewStateValue;
    var reason = message.NewStateReason;

	// create post message
	var alarmMessage = "*Subject:* "+subject+"\n"+
	"*Message:* "+alarmName+" state is now "+newState+"\n"+
	"*Due to:* "+reason+"\n";

	// check subject for condition
	for (var i=0; i < ALARM_CONFIG.length; i++) {
		var row = ALARM_CONFIG[i];
		console.log(row);
		if (subject.match(row.condition)) {
			console.log("Matched condition: "+row.condition);

			alarmMessage = alarmMessage;
			channel = row.channel;
			severity = row.severity;
			color = row.color;
			break;
		}
	}

	if (!channel) {
		console.log("Could not find condition.");
		context.done('error', "Invalid condition");
	}

	var payloadStr = JSON.stringify({
	"attachments": [
		{
			"fallback": alarmMessage,
			"text": alarmMessage,
			"mrkdwn_in": ["text"],
			"username": "AWS-CloudWatch-Lambda-bot",
			"fields": [
				{
					"title": "Account",
					"value": "ACCOUNT_NAME",
					"short": true
				}
			],
			"color": color
		}
	],
		"channel":channel
	});
	var postData = querystring.stringify({
	  "payload": payloadStr
	});
	console.log(postData);
	var options = {
		hostname: "hooks.slack.com",
		port: 443,
		path: SLACK_CONFIG.path,
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': postData.length
		}
	};

	var req = http.request(options, function(res) {
		console.log("Got response: " + res.statusCode);
		res.on("data", function(chunk) {
			console.log('BODY: '+chunk);
			context.done(null, 'done!');
		});
	}).on('error', function(e) {
		context.done('error', e);
	});
	req.write(postData);
	req.end();
};


