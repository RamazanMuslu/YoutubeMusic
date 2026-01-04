# YouTube Music Linux

[music.youtube.com](https://music.youtube.com)'un Masaüstü uygulamasıdır.

[Electron](https://www.electronjs.org/)  ile oluşturulmuştur. Typescript ile yazılmıştır.

## Özellikler
- Tüm Youtube Music özellikleri

## Kurulum

Eğer Arch tabanlı bir dağıtım kullanıyorsanız AUR üzerinden kurabilirsiniz:

```sh
yay -S youtube-music-desktop-bin
```

Eğer başka bir dağıtım kullanıyorsanız:

[Buradan](https://github.com/RamazanMuslu/YoutubeMusic/releases) AppImage dosyası ile kullanabilirsiniz.

> **İpucu:** AppImage'ı sisteminize entegre etmek (menüye eklemek) için [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) kullanmanızı öneririz.

Diğer işletim sistemlerini kullanıyorsanız:

[Buradan](https://github.com/RamazanMuslu/YoutubeMusic/releases) yükleyiciyi indirebilirsiniz.

## Geliştirme

Cihazınızda NodeJS kurulduğundan emin olun.

```sh
git clone https://github.com/RamazanMuslu/YoutubeMusic.git
```
İndirdikten veya klonladıktan sonra klasör içerisinde:

```sh
npm install
```
komutunu çalıştırın.

### Yararlı Komutlar

```sh
npm run compile #Typescript derlemesi yapar ve gerekli JavaScript dosyalarını oluşturur.
```

```sh
npm start #Compile kodu ile birlikte Electron uygulamasını başlatır
```

```sh
npm run build # Windows için uygulamayı oluşturur.
```

```sh
npm run buildMac # Mac için uygulamayı oluşturur.
```

```sh
npm run buildLinux # Linux için .AppImage dosyasını oluşturur.
```

## İletişim

- Discord: [ramazan_developer](https://discord.com/users/796056456461025300)
- Mail: [ramazanmuslu@yorastudioplus.com](mailto://ramazanmuslu@yorastudioplus.com)

## License

MIT
