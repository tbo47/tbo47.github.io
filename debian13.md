IMPORTANT: during install, leave the root password blank, it will configure `sudo` automatically and it's what you want.

This is my [Debian](https://www.debian.org/devel/debian-installer/) 13 (alias trixie) configuration after installation.

Run the following commands:

```
sudo apt install -y transmission gnome-software-plugin-flatpak curl git zsh vlc tilix
sudo apt remove -y firefox-esr evolution evolution-common
sudo flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
sudo flatpak install -y flathub com.google.Chrome
sudo flatpak install -y flathub org.mozilla.firefox
sudo flatpak install -y com.spotify.Client
sudo flatpak install -y org.signal.Signal
gsettings set org.gnome.shell favorite-apps "['com.google.Chrome.desktop', 'org.mozilla.firefox.desktop', 'org.signal.Signal.desktop', 'com.spotify.Client.desktop', 'org.gnome.Nautilus.desktop']"
gnome-software --mode=installed
flatpak run org.mozilla.firefox https://github.com/tbo47/tbo47.github.io/blob/main/debian13.md
```

For Chrome:
[vimium](https://chromewebstore.google.com/detail/vimium/dbepggeogbaibhgnhhndojpepiihcmeb),
[ublock origin lite](https://chromewebstore.google.com/detail/ublock-origin-lite/ddkjiahejlhfcafbddmgiahcphecmpfh)

[Explore more apps from flatpak hub](https://flathub.org/?category=popular) and install them with the software app.

## dev environment

```bash
sudo flatpak install -y flathub org.pgadmin.pgadmin4
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

```
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

Install vscode manually and something like `alias code=/home/user1/VSCode-linux-x64/bin/code` in .zshrc
