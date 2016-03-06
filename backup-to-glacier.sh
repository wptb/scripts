#!/bin/bash
####################################
#
# Backup to Amazon Glacier.
#
####################################

# What to backup.
backup_files="/etc /var/spool/cron"

# Where to backup to.
dest="/root/glacier_jobs"

# Create archive filename.
day=$(date +%F)
hostname=$(hostname)
archive_file="$hostname-$day.tgz"

# Backup the files using tar.
tar czf $dest/$archive_file $backup_files

#Upload package to the Amazon Glacier using glacieruploader.jar
#https://github.com/MoriTanosuke/glacieruploader
java -jar glacieruploader.jar -u $archive_file

#Housekeeping
rm -f $dest/$archive_file

#Push information message to Slack (should be under some if / try-catch block)
url='INCOMING_WEBHOOK'

payload="payload={
       \"icon_emoji\": \":file_folder:\",
       \"username\": \"backup\",
       \"attachments\": [
               {
                       \"color\": \"good\",
                       \"title\": \"Backup of ${hostname} succeeded\n\",
                       \"text\": \"Archive ${archive_file} full of configurations was successfully uploaded to Amazon Glacier - eu-central-1/configuration-backups.\"
               }
       ]
}
"
curl -X POST --data-urlencode "${payload}" $url