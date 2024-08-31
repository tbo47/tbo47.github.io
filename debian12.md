This is my [Debian](https://distrowatch.com/table.php?distribution=debian) 12 configuration after installation.

Leave admin password blank to have sudo during installation.

Switch to root:
```
su -
```

The `/etc/apt/sources.list` file should look like this:

```
deb http://deb.debian.org/debian/ bookworm contrib main non-free non-free-firmware
deb http://deb.debian.org/debian-security/ bookworm-security contrib main non-free non-free-firmware
deb http://deb.debian.org/debian/ bookworm-backports contrib main non-free non-free-firmware
```

Then, run the following commands:

```
apt update ; apt full-upgrade -y ; apt autoremove -y
apt install -y gnome-clocks transmission thunderbird pavucontrol gimp pdfarranger vlc chromium gnome-tweaks 
apt install -y git ripgrep fd-find curl flatpak gnome-software-plugin-flatpak gnome-console podman amule amule-daemon
apt remove -y firefox-esr
flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
flatpak install -y flathub com.discordapp.Discord
flatpak install -y flathub org.mozilla.firefox
flatpak install -y flathub io.neovim.nvim
```

Install 
[ohmyz](https://ohmyz.sh/),
[chrome](https://www.google.com/chrome/dr/download/), 
[vscode](https://code.visualstudio.com/),
[pgadmin](https://www.pgadmin.org/)
[syncthing](https://syncthing.net/), 
[globalprotect](https://github.com/yuezk/GlobalProtect-openconnect), 

For Chrome/Chromium: 
[vimium](https://chromewebstore.google.com/detail/vimium/dbepggeogbaibhgnhhndojpepiihcmeb), 
[jsonformatter](https://chromewebstore.google.com/detail/json-formatter/bcjindcccaagfpapjjmafapmmgkkhgoa)

Neovim in vscode:
[vscode-neovim](https://marketplace.visualstudio.com/items?itemName=asvetliakov.vscode-neovim) 

In `.zshrc` or `.bashrc`
```
alias vim=/var/lib/flatpak/app/io.neovim.nvim/x86_64/stable/active/export/bin/io.neovim.nvim
alias nvim=/var/lib/flatpak/app/io.neovim.nvim/x86_64/stable/active/export/bin/io.neovim.nvim
```

## nodejs

[Install nodejs with nvm](https://github.com/nvm-sh/nvm#install--update-script)

Then close and open a new console.

```bash
nvm install --lts
npm install -g npm-check-updates ts-node @angular/cli npm
```


In `.zshrc` or `.bashrc` add the following line:
```bash
export NODE_OPTIONS=--max_old_space_size=8192
```
