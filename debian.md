This is my [Debian](https://distrowatch.com/table.php?distribution=debian) 12 configuration after installation.

Switch to root:
```
su -
```

The `/etc/apt/sources.list` file should look like this:

```
deb http://deb.debian.org/debian/ bookworm contrib main non-free non-free-firmware
deb http://deb.debian.org/debian/ bookworm-updates contrib main non-free non-free-firmware
deb http://deb.debian.org/debian/ bookworm-proposed-updates contrib main non-free non-free-firmware
deb http://deb.debian.org/debian/ bookworm-backports contrib main non-free non-free-firmware
deb http://deb.debian.org/debian-security/ bookworm-security contrib main non-free non-free-firmware
```

Then, run the following commands:

```
apt update; apt dist-upgrade -y; apt autoremove -y
apt install -y gnome-clocks transmission thunderbird pavucontrol gimp pdfarranger vlc chromium gnome-tweaks 
apt install -y git ripgrep fd-find curl flatpak gnome-software-plugin-flatpak gnome-console
flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
flatpak install -y flathub com.discordapp.Discord
flatpak install -y flathub org.kde.kdenlive
flatpak install flathub io.dbeaver.DBeaverCommunity
chromium https://flathub.org/apps/collection/popular
```

Install 
[ohmyz](https://ohmyz.sh/)
[neovim](https://neovim.io/),
[chrome](https://www.google.com/chrome/dr/download/), 
[docker](https://docs.docker.com/engine/install/debian/), 
[syncthing](https://syncthing.net/), 
[globalprotect](https://github.com/yuezk/GlobalProtect-openconnect), 
[vscode](https://code.visualstudio.com/), 

Note: I installed neovim manually because I want the latest version and flatpak doens't add it to the PATH.

For Chrome/Chromium: 
[vimium](https://chromewebstore.google.com/detail/vimium/dbepggeogbaibhgnhhndojpepiihcmeb), 
[adblocker](https://chromewebstore.google.com/detail/adblocker-ultimate/ohahllgiabjaoigichmmfljhkcfikeof), 
[strongvpn](https://chromewebstore.google.com/detail/strongvpn-the-fastest-pro/ahcoedgggbhcdgmhhhhliafnbcifmdln), 
[jsonformatter](https://chromewebstore.google.com/detail/json-formatter/bcjindcccaagfpapjjmafapmmgkkhgoa)

## nodejs

[Install nodejs with nvm](https://github.com/nvm-sh/nvm#install--update-script)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

Then close and open a new console.

```bash
nvm install --lts
npm install -g npm-check-updates ts-node
```

## neovim

`~/.config/nvim/init.vim`:

```
imap jk <Esc>
```

Use neovim in vscode: [vscode-neovim](https://marketplace.visualstudio.com/items?itemName=asvetliakov.vscode-neovim) 

`.config/Code/User/keybindings.json`:
```json
[
  {
    "command": "vscode-neovim.compositeEscape1",
    "key": "j",
    "when": "neovim.mode == insert && editorTextFocus",
    "args": "j"
  },
  {
    "command": "vscode-neovim.compositeEscape2",
    "key": "k",
    "when": "neovim.mode == insert && editorTextFocus",
    "args": "k"
  },
  {
    "key": "ctrl+p",
    "command": "-workbench.action.quickOpenSelectPrevious",
    "when": "inQuickOpen && neovim.wildMenuVisible || inQuickOpen && neovim.mode != 'cmdline'"
  }
]
```

