#!/bin/bash

# Slack incoming web-hook URL and user name
url='INCOMING_WEBHOOK'             # example: https://hooks.slack.com/services/QW3R7Y/D34DC0D3/BCADFGabcDEF123

## Values received by this script:
# To = $1 (Slack channel or user to send the message to, specified in the Zabbix web interface; "@username" or "#channel")
# Subject = $2 (usually either PROBLEM or RECOVERY)
# Message = $3 (whatever message the Zabbix action sends, preferably something like "Zabbix server is unreachable for 5 minutes - Zabbix server (127.0.0.1)")
# Could be changed > Zabbix 3.0.


# Get the Slack channel or user ($1) and Zabbix subject ($2 - hopefully either PROBLEM or OK)
to="$1"
subject="$2"
scolor='danger'

# Change message emoji depending on the subject
if [[ $subject =~ .*OK.* ]]
then
        scolor='good'
elif [[ $subject =~ .*PROBLEM.* ]]
then
        scolor='danger'
else
        scolor='danger'
fi

# Build our JSON payload and send it as a POST request to the Slack incoming web-hook URL
payload="payload={
       \"channel\": \"${1}\",
       \"attachments\": [
               {
                       \"color\": \"${scolor}\",
                       \"title\": \"${subject}\n\",
                       \"text\": \"${3}\"
               }
       ]
}
"
curl -X POST --data-urlencode "${payload}" $url 