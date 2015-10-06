# momo
Multi flavour Entretaiment Raspberry pi

----

## Entretaiment
### This is a project co-related with an image for the SD of the RaspBerry

Solutions Provided
---

- A media center throught Kodi.
- A game center with Emulstation and RetroRaspberry (include also a Virtual Joystick).
- A airplay server to use your raspberry to transmit your music.

![Momo](/public/img/cat.png)


## Installation
---
I'm shipping this project together with the image for the Raspberry, in the otherhands
you can follow the same steps to install all the required packages in your favorite distro.

### Install RetroPie
[Retropie Setup] (http://blog.petrockblock.com/2012/07/22/retropie-setup-an-initialization-script-for-retroarch-on-the-raspberry-pi/)
```
sudo apt-get update
sudo apt-get install -y git dialog
cd
git clone git://github.com/petrockblog/RetroPie-Setup.git
cd RetroPie-Setup
chmod +x retropie_setup.sh
sudo ./retropie_setup.sh
```

### Install shairport-sync
[ShairPort Setup](https://github.com/mikebrady/shairport-sync)

### Install Kodi
[Kodi](http://kodi.wiki/view/HOW-TO:Install_Kodi_on_Raspberry_Pi)

### Chrome on start up
http://blogs.wcode.org/2013/09/howto-boot-your-raspberry-pi-into-a-fullscreen-browser-kiosk/
