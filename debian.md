This is my Debian 12 configuration after installation.


`/etc/apt/sources.list`:

```
deb http://deb.debian.org/debian/ bookworm contrib main non-free non-free-firmware
deb http://deb.debian.org/debian/ bookworm-updates contrib main non-free non-free-firmware
deb http://deb.debian.org/debian/ bookworm-proposed-updates contrib main non-free non-free-firmware
deb http://deb.debian.org/debian/ bookworm-backports contrib main non-free non-free-firmware
deb http://deb.debian.org/debian-security/ bookworm-security contrib main non-free non-free-firmware
```

Then

```
su -
apt update; apt dist-upgrade -y; apt autoremove -y
apt install -y gnome-clocks nodejs npm vim thunderbird exa pavucontrol gimp silversearcher-ag rename pdfarranger vlc
npm i -g npm-check-updates
```

Install [docker](https://docs.docker.com/engine/install/debian/), [discord](https://discord.com/download), [chrome](https://www.google.com/chrome/dr/download/), [syncthing](https://syncthing.net/), [globalprotect](https://github.com/yuezk/GlobalProtect-openconnect).

TODO add sudo

## Vim

`~/.vimrc`: 
```
:imap jk <Esc>
:syntax on
```


