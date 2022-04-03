#!/bin/bash
sudo apachectl -k stop
mkdir /var/www/html/app
cp -rf /home/ec2-user/SuitabilityPro-GUI/app/* /var/www/html/app/
cp /var/www/html/app/htaccess /var/www/html/app/.htaccess
chown -R ec2-user:ec2-user /var/www/html/app
sudo apachectl -k restart

