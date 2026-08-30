# Changelog

Tutte le modifiche rilevanti di AssociaGo sono documentate in questo file.

Formato ispirato a [Keep a Changelog](https://keepachangelog.com/it/1.1.0/),
versioning [Semantic Versioning](https://semver.org/lang/it/).

Scrivi le modifiche in corso sotto `## [Unreleased]`: `npm run dist` le consolida
automaticamente nella nuova versione e le pubblica nel changelog Debian del `.deb`.

## [Unreleased]

## [0.1.6] - 2026-08-30

- Maintenance release.

## [0.1.5] - 2026-08-25

- Fixed: Packaging: i permessi vengono letti tramite `find`, non tramite `fs.stat`. Sotto `fakeroot` Node legge i permessi reali su disco mentre `dpkg-deb` legge il database di `fakeroot`, e i file di sola lettura del JRE finivano nel `.deb` con modo 0444.

## [0.1.4] - 2026-08-25

- Fixed: Packaging: `Section` valida (`misc`), synopsis entro 80 colonne e descrizione estesa mandata a capo.
- Fixed: Packaging: changelog installato come `changelog.gz`, il nome corretto per un pacchetto nativo.
- Fixed: Packaging: permessi normalizzati nel `.deb` (directory 0755, file 0644/0755, librerie condivise 0644, bit setuid preservato).

## [0.1.3] - 2026-08-25

- Added: Packaging: versionamento automatico `x.y.(z+1)` a ogni `npm run dist`, propagato a `package.json`, `package-lock.json` e `build.gradle`.
- Added: Packaging: changelog Debian, `copyright` DEP-5, `conffiles`, icona in `usr/share/pixmaps` e voce di autostart disabilitata dentro il `.deb`.
- Fixed: Packaging: rimozione dei JAR backend obsoleti da `build/libs` prima del bundling, che potevano oscurare il backend della versione corrente.

## [0.1.2] - 2026-08-01

- Password recovery flow.
- Startup and mail health check improvements.
