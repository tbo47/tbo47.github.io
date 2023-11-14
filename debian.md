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
apt install -y gnome-clocks vim thunderbird exa pavucontrol gimp silversearcher-ag rename pdfarranger vlc transmission
```

Install [docker](https://docs.docker.com/engine/install/debian/), [discord](https://discord.com/download), [chrome](https://www.google.com/chrome/dr/download/), [syncthing](https://syncthing.net/), [globalprotect](https://github.com/yuezk/GlobalProtect-openconnect).

TODO add sudo

TODO find successor of exa and silversearcher-ag

## Nodejs

[Install nodejs with nvm](https://github.com/nvm-sh/nvm#install--update-script)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
```
Then close and open a new console.

```bash
nvm install --lts
npm i -g npm-check-updates
```


## Vim

`~/.vimrc`: 
```
:imap jk <Esc>
:syntax on
```


