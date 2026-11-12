IMPORT: during install, leave the root password blank, it will configure `sudo` automatically and it's what you want.

This is my [Debian](https://www.debian.org/devel/debian-installer/) 13 (alias trixie) configuration after installation.

[Install Chrome](https://www.google.com/chrome/) and extensions
[vimium](https://chromewebstore.google.com/detail/vimium/dbepggeogbaibhgnhhndojpepiihcmeb),
[ublock origin lite](https://chromewebstore.google.com/detail/ublock-origin-lite/ddkjiahejlhfcafbddmgiahcphecmpfh)

[Install Signal](https://signal.org/download/)

Run the following commands:

```bash
sudo apt install -y transmission gnome-software-plugin-flatpak curl git zsh vlc ffmpeg
sudo flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
flatpak install flathub io.github.cosmic_utils.camera
gsettings set org.gnome.shell favorite-apps "['google-chrome.desktop', 'firefox-esr.desktop', 'signal-desktop.desktop', 'com.spotify.Client.desktop', 'org.gnome.Nautilus.desktop', 'io.github.cosmic_utils.camera.desktop']"
sudo shutdown -r now
```

[Explore more apps from flatpak hub](https://flathub.org/en/apps/collection/popular/1) and install them with the software app.

## dev environment

```bash
sudo apt install vim tilix gimp
```

Install [vscode from the .deb file](https://code.visualstudio.com/docs/setup/linux)

```bash
code --install-extension anthropic.claude-code ms-ossdata.vscode-pgsql vscodevim.vim
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
sudo /usr/share/postgresql-common/pgdg/apt.postgresql.org.sh
sudo apt install -y postgresql-18 redis-server
sudo systemctl enable --now postgresql redis-server
psql --version
sudo -u postgres psql <<'SQL'
CREATE USER "user" WITH PASSWORD 'password' SUPERUSER;
ALTER DATABASE postgres OWNER TO "user";
SQL
```
