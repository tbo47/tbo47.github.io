IMPORTANT: during install, leave the root password blank, it will configure `sudo` automatically and it's what you want.

This is my [Debian](https://www.debian.org/devel/debian-installer/) 13 (alias trixie) configuration after installation.

[Install Signal](https://signal.org/download/)

Run the following commands:

```bash
sudo apt install -y transmission gnome-software-plugin-flatpak curl git zsh vlc ffmpeg
curl -fsSLo /tmp/chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo apt install -y /tmp/chrome.deb
sudo flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
flatpak install -y flathub io.github.cosmic_utils.camera
gsettings set org.gnome.shell favorite-apps "['google-chrome.desktop', 'org.gnome.Terminal.desktop', 'org.gnome.Nautilus.desktop', 'signal-desktop.desktop', 'firefox-esr.desktop']"
gsettings set org.gnome.shell favorite-apps "['google-chrome.desktop', 'org.gnome.Terminal.desktop', 'org.gnome.Nautilus.desktop', 'signal-desktop.desktop', 'firefox-esr.desktop', 'io.github.cosmic_utils.camera.desktop']"
mkdir -p ~/.config/autostart
cat > ~/.config/autostart/gnome-software-updates.desktop <<'EOF'
[Desktop Entry]
Type=Application
Name=Software updates
Exec=gnome-software --mode=updates
EOF
```

Chrome extensions:
[vimium](https://chromewebstore.google.com/detail/vimium/dbepggeogbaibhgnhhndojpepiihcmeb),
[ublock origin lite](https://chromewebstore.google.com/detail/ublock-origin-lite/ddkjiahejlhfcafbddmgiahcphecmpfh)

[Explore more apps from flatpak hub](https://flathub.org/en/apps/collection/popular/1) and install them with the software app.

## dev environment

```bash
sudo apt install -y vim tilix gimp
```

Install vscode and its extensions:

```bash
echo "code code/add-microsoft-repo boolean true" | sudo debconf-set-selections
curl -fsSLo /tmp/code.deb 'https://code.visualstudio.com/sha/download?build=stable&os=linux-deb-x64'
sudo apt install -y /tmp/code.deb
code --install-extension anthropic.claude-code \
     --install-extension ms-ossdata.vscode-pgsql \
     --install-extension vscodevim.vim
gsettings set org.gnome.shell favorite-apps "['google-chrome.desktop', 'org.gnome.Terminal.desktop', 'com.microsoft.VSCode.desktop', 'org.gnome.Nautilus.desktop', 'signal-desktop.desktop', 'firefox-esr.desktop', 'io.github.cosmic_utils.camera.desktop']"
```

Install [ohmyz](https://ohmyz.sh/) for a better terminal.

[Install nodejs with nvm](https://github.com/nvm-sh/nvm#install--update-script)

Then re-open the terminal

```bash
nvm install --lts
npm install -g npm-check-updates npm tsx
```

In `.zshrc` add memory to nodejs with:

```bash
export NODE_OPTIONS=--max_old_space_size=8192
```

Install postgres 18 and redis:

```bash
sudo apt update
sudo apt install -y postgresql-common
sudo /usr/share/postgresql-common/pgdg/apt.postgresql.org.sh -y
sudo apt install -y postgresql-18 redis-server
psql --version
sudo -u postgres psql <<'SQL'
CREATE USER "user" WITH PASSWORD 'password' SUPERUSER;
SQL
```
