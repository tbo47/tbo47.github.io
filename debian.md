This is my [Debian](https://distrowatch.com/table.php?distribution=debian) 12 configuration after installation.

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
apt install -y gnome-clocks vim thunderbird exa pavucontrol gimp silversearcher-ag rename pdfarranger vlc transmission snapd
snap install core
snap install plotjuggler
```

Install [docker](https://docs.docker.com/engine/install/debian/), [discord](https://discord.com/download), [chrome](https://www.google.com/chrome/dr/download/), [syncthing](https://syncthing.net/), [globalprotect](https://github.com/yuezk/GlobalProtect-openconnect), [vscode](https://code.visualstudio.com/).

TODO add sudo

TODO find successor of exa and silversearcher-ag

## Nodejs

[Install nodejs with nvm](https://github.com/nvm-sh/nvm#install--update-script)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
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


My vscode conf for the [vscodevim](https://marketplace.visualstudio.com/items?itemName=vscodevim.vim) extension:
```bash
grep -A9 vim ~/.config/Code/User/settings.json
  "vim.insertModeKeyBindings": [
    {
      "before": [
        "j",
        "k"
      ],
      "after": [
        "<Esc>"
      ]
    }
--
  "vim.normalModeKeyBindingsNonRecursive": [
    {
      "before": [
        "<C-p>"
      ],
      "commands": [
        "workbench.action.quickOpen"
      ]
    }
  ],
```

Google Chrome extension [Vimium](https://chromewebstore.google.com/detail/vimium/dbepggeogbaibhgnhhndojpepiihcmeb)