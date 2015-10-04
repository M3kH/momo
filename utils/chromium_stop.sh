#!/bin/sh
# Origin: http://blogs.wcode.org/2013/09/howto-boot-your-raspberry-pi-into-a-fullscreen-browser-kiosk/
#while true; do

# Clean up previously running apps, gracefully at first then harshly
/etc/init.d/lightdm stop
killall -TERM chromium 2>/dev/null;
killall -TERM matchbox-window-manager 2>/dev/null;
sleep 2;
killall -9 chromium 2>/dev/null;
killall -9 matchbox-window-manager 2>/dev/null;

# Clean out existing profile information
rm -rf /home/pi/.cache;
rm -rf /home/pi/.config;
rm -rf /home/pi/.pki;
