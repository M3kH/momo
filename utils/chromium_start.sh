#!/bin/sh
# Origin: http://blogs.wcode.org/2013/09/howto-boot-your-raspberry-pi-into-a-fullscreen-browser-kiosk/

# Generate the bare minimum to keep Chromium happy!
mkdir -p /home/pi/.config/chromium/Default
sqlite3 /home/pi/.config/chromium/Default/Web\ Data "CREATE TABLE meta(key LONGVARCHAR NOT NULL UNIQUE PRIMARY KEY, value LONGVARCHAR); INSERT INTO meta VALUES('version','46'); CREATE TABLE keywords (foo INTEGER);";

# Disable DPMS / Screen blanking
xset -dpms
xset s off

# Reset the framebuffer's colour-depth
fbset -depth $( cat /sys/module/*fb*/parameters/fbdepth );

# Hide the cursor (move it to the bottom-right, comment out if you want mouse interaction)
xwit -root -warp $( cat /sys/module/*fb*/parameters/fbwidth ) $( cat /sys/module/*fb*/parameters/fbheight )

# Start the window manager (remove "-use_cursor no" if you actually want mouse interaction)
matchbox-window-manager -use_titlebar no -use_cursor no &

# Start the browser (See http://peter.sh/experiments/chromium-command-line-switches/)
chromium  --app=http://google.com
