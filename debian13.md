IMPORTANT: leave the root password blank, it will configure `sudo` automatically and it's what you want.

This is my [Debian](https://www.debian.org/devel/debian-installer/) 13 (alias trixie) configuration after installation.

Run the following commands:

```
sudo apt install -y transmission gnome-software-plugin-flatpak gnome-console curl git zsh vlc
sudo apt remove -y firefox-esr evolution evolution-common
sudo apt autoremove -y
sudo flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
sudo flatpak install -y flathub com.google.Chrome
sudo flatpak install -y flathub org.mozilla.firefox
gnome-software --mode=installed
flatpak run com.visualstudio.code https://chromewebstore.google.com/detail/ublock-origin-lite/ddkjiahejlhfcafbddmgiahcphecmpfh
gsettings set org.gnome.shell favorite-apps "$(gsettings get org.gnome.shell favorite-apps | sed "s/]$/, 'com.google.Chrome.desktop']/")"
```

## dev environment

Install vscode and pgAdmin:

```bash
sudo flatpak install -y flathub org.pgadmin.pgadmin4
sudo flatpak install -y flathub com.visualstudio.code
```

Install [ohmyz](https://ohmyz.sh/) for a better terminal.

[Install nodejs with nvm](https://github.com/nvm-sh/nvm#install--update-script)

Then re-open the console

```bash
nvm install --lts
npm install -g npm-check-updates npm tsx
```

In `.zshrc` add memory to nodejs with:

```bash
export NODE_OPTIONS=--max_old_space_size=8192
alias chrome='flatpak run com.google.Chrome'
alias code='flatpak run com.visualstudio.code'
```
