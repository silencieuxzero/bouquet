# 🍥 Fuwari

![Node.js >= 22.12](https://img.shields.io/badge/node.js-%3E%3D22.12-brightgreen)
![pnpm >= 10](https://img.shields.io/badge/pnpm-%3E%3D10-blue)
![Astro 7](https://img.shields.io/badge/Astro-7-ff5d01?logo=astro)
![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)
![License MIT](https://img.shields.io/badge/license-MIT-green)

Un blog estático personal construido con [Astro](https://astro.build), bifurcado de la
plantilla [Fuwari](https://github.com/saicaca/fuwari) y actualizado a un conjunto de
herramientas más reciente.

🌏 Otros idiomas:
[**English**](README.en.md) /
[**中文**](../README.md) /
[**日本語**](README.ja.md) /
[**한국어**](README.ko.md) /
[**ไทย**](README.th.md) /
[**Tiếng Việt**](README.vi.md) /
[**Bahasa Indonesia**](README.id.md)

## Acerca de

Este repositorio comenzó como una copia de Fuwari y desde entonces se ha actualizado a
un stack más nuevo que el de la plantilla original:

| Área | Plantilla original | Este repositorio |
|:--|:--|:--|
| Astro | 5.x | **7.3** |
| Tailwind CSS | 3.x mediante `@astrojs/tailwind` | **4.x mediante `@tailwindcss/vite`** |
| Colecciones de contenido | `src/content/config.ts` heredado | **Content Layer API** (`src/content.config.ts`) |
| Svelte | 5.39 | **5.57** |

Como `@astrojs/tailwind` nunca dio soporte a Astro 6 o superior, la migración a
Tailwind CSS 4 fue obligatoria y no opcional. Los estilos ahora se configuran con
enfoque CSS primero en [src/styles/app.css](../src/styles/app.css) en lugar de
`tailwind.config.js`.

El contenido del blog y la configuración del sitio siguen siendo los valores por
defecto de la plantilla: edita [src/config.ts](../src/config.ts) para personalizarlo.

## Características

- Construido con Astro y Tailwind CSS, con Svelte para los componentes interactivos
- Transiciones de página fluidas mediante [Swup](https://swup.js.org/)
- Búsqueda de texto completo en el cliente mediante [Pagefind](https://pagefind.app/)
- Modo claro / oscuro con color de acento personalizable, guardado en `localStorage`
- Diseño adaptable, con tabla de contenidos en pantallas anchas
- Resaltado de código con [Expressive Code](https://expressive-code.com/), con
  insignias de lenguaje, botones de copia y secciones plegables
- Composición matemática con [KaTeX](https://katex.org/)
- Markdown ampliado: admoniciones y tarjetas de repositorios de GitHub
- Visor de imágenes con [PhotoSwipe](https://photoswipe.com/), optimizadas con Sharp
- Feed RSS, mapa del sitio y `robots.txt` generados en el build
- Textos de la interfaz traducidos a 10 idiomas

## Requisitos

- **Node.js 22.12.0 o superior**
- **pnpm 10 o superior**

La versión exacta de pnpm está fijada en el campo `packageManager`, por lo que se
selecciona automáticamente una versión compatible. El script `preinstall` rechaza npm
y Yarn.

## Primeros pasos

```sh
pnpm install     # instalar dependencias
pnpm dev         # iniciar el servidor de desarrollo en http://localhost:4321
```

`pnpm dev` también levanta el lanzador local: primero busca `launcher/server.mjs`
en este repositorio, luego la variable de entorno `LAUNCHER_HOME` y después el
directorio hermano `../fuwari-launcher`, y usa el que encuentre. Si no encuentra
ninguno, arranca solo el sitio sin dar error. Para levantar únicamente el sitio,
usa `pnpm dev:astro` o `pnpm dev --no-launcher` (o bien `LAUNCHER=0`).

Después:

1. Edita [src/config.ts](../src/config.ts) —— título, subtítulo, idioma, tono del tema,
   banner, tabla de contenidos y favicons.
2. Ejecuta `pnpm new-post <filename>` para crear un borrador en `src/content/posts/`.
3. Define `site` y `base` en [astro.config.mjs](../astro.config.mjs) antes de desplegar.

## Estructura del proyecto

```
src/
├── assets/         imágenes que importan los componentes
├── components/     componentes Astro y Svelte (control/, misc/, widget/)
├── constants/      constantes de diseño, iconos por defecto, enlaces de navegación
├── content/        entradas del blog y colección de páginas independientes
├── i18n/           textos de la interfaz, un módulo por idioma
├── layouts/        Layout.astro y MainGridLayout.astro
├── pages/          rutas: inicio, archivo, about, entradas, RSS, robots.txt
├── plugins/        plugins de remark / rehype y de Expressive Code
├── styles/         app.css (entrada de Tailwind) y hojas por funcionalidad
├── types/          tipos TypeScript compartidos
└── utils/          consultas de contenido y utilidades de URL y tema
src/content.config.ts   definición de colecciones (Content Layer API)
scripts/                scripts de desarrollo: dev.mjs (sitio + lanzador), sync-branch.mjs (sincronizar instantáneas de rama)
launcher/               lanzador local (interfaz web para editar configuración y contenido, previsualizar y desplegar)
start-launcher.cmd      iniciar el lanzador con doble clic en Windows
```

## Ramas

| Rama | Contenido | Uso |
|:--|:--|:--|
| `main` | el sitio en sí + el lanzador (`launcher/`, `start-launcher.cmd`) | desarrollo diario: `pnpm dev` levanta el sitio y el lanzador a la vez |
| `site` | solo el sitio, sin el lanzador | copia limpia: para cuando solo necesitas el blog o quieres que `clone` quede limpio |
| `launcher` | solo el lanzador, sin el sitio | modificar el lanzador por separado; apunta al checkout del sitio con `LAUNCHER_ROOT` |

Las tres ramas **no tienen ancestro común** (cada una tiene su propia historia orphan independiente), y es intencionado: git rechaza directamente la fusión de las tres (`fatal: refusing to merge unrelated histories`) en lugar de borrar en silencio los archivos de la otra parte como haría con una historia compartida. Por eso:

- No sincronices estas tres ramas con `git merge`; para sincronizar, toma los directorios o usa el script de abajo.
- La fuente de verdad del contenido es siempre `main`: `site` es «`main` sin `launcher/` ni `start-launcher.cmd`», y `launcher` es «el `README.md`/`package.json`/`start-launcher.cmd` de la propia rama + el `launcher/` de `main`».
- La historia antigua anterior a la separación se conserva en etiquetas: `site-pre-split` (= el antiguo `fa47b3d`) y `launcher-pre-split` (= el antiguo `b157a80`).

Script de sincronización (se ejecuta en el checkout de `main`; usa comandos de bajo nivel de git para reconstruir el árbol y no toca el directorio de trabajo):

```bash
node scripts/sync-branch.mjs site --dry-run      # ver primero qué archivos cambiarían
node scripts/sync-branch.mjs site --push         # actualizar site y subirlo
node scripts/sync-branch.mjs launcher --push     # actualizar el directorio launcher/ de la rama launcher y subirlo
```

Cuando la rama `launcher` está con checkout en `E:\fuwari-launcher`, el script avisa de que ejecutes `git reset --hard <sha>` en ese directorio.

### Tres directorios (worktrees)

Las tres ramas se sacan con checkout en un directorio cada una y **comparten un único `.git`** (no son tres copias del repositorio), así que los commits, los push y la lista de ramas son los mismos en las tres:

```
E:\fuwari\             → main      desarrollo diario: sitio + lanzador
E:\fuwari-site\        → site      sitio limpio (sin launcher/)
E:\fuwari-launcher\    → launcher  para modificar el lanzador por separado
```

`git worktree list` muestra todos los checkouts. Para crear o recrear un directorio:

```bash
git worktree add ../fuwari-site site
git worktree add ../fuwari-launcher launcher

# las dependencias se comparten con el directorio principal; usa un enlace junction en vez de copiar:
cmd //c mklink /J ..\fuwari-site\node_modules ..\fuwari\node_modules
cmd //c mklink /J ..\fuwari-launcher\node_modules ..\fuwari\node_modules
cmd //c mklink /J ..\fuwari-launcher\private ..\fuwari\private
```

Una misma rama no puede tener checkout en dos directorios a la vez (git lo rechaza), así que las ediciones manuales de los tres lugares no se pisan entre sí.

Al borrar un directorio, **quita primero el junction y luego elimina el árbol de trabajo**; de lo contrario el borrado seguirá hasta el directorio de destino:

```bash
cmd //c rmdir ..\fuwari-site\node_modules
git worktree remove ../fuwari-site
```

Aspectos a tener en cuenta en cada directorio:

| Directorio | Atención |
|:--|:--|
| `E:\fuwari` | `pnpm dev` levanta a la vez el sitio (localhost:4321) y el lanzador (127.0.0.1:5199) |
| `E:\fuwari-site` | Para previsualizar en este directorio que solo tiene el sitio, usa `pnpm dev:astro`; `pnpm dev` irá además a `..\fuwari-launcher` a buscar el lanzador |
| `E:\fuwari-launcher` | **No ejecutes `pnpm`** (`node_modules` es un junction, pnpm rechazará la instalación y puede intentar borrarlo); usa `node launcher/server.mjs` o haz doble clic en `start-launcher.cmd`, y haz que apunte al directorio del sitio (`LAUNCHER_ROOT` o el `fuwari` hermano por defecto) |

Las ediciones manuales hechas en los directorios `site` / `launcher` pertenecen a esa rama y el script de sincronización no las devuelve a `main`; a la inversa, ejecutar `sync-branch.mjs` sobrescribe todo el árbol de `site` y el directorio `launcher/` de la rama con el contenido de `main`. Haz en `main` los cambios que quieras conservar a largo plazo.

## Frontmatter de las entradas

Las entradas viven en `src/content/posts/` y se validan con el esquema de
`src/content.config.ts`.

```yaml
---
title: My First Blog Post
published: 2023-09-09
description: This is the first post of my new Astro blog.
image: ./cover.jpg        # relativo al archivo, o ruta absoluta de public
tags: [Foo, Bar]
category: Front-end
draft: false
lang: jp                  # solo si el idioma difiere del idioma del sitio
---
```

Solo `title` y `published` son obligatorios. Con `draft: true` la entrada se excluye
del build de producción pero sigue visible en desarrollo.

Para mantener los recursos junto a la entrada, usa una carpeta con `index.md`:

```
src/content/posts/my-post/
├── index.md
└── cover.jpg
```

## Sintaxis Markdown ampliada

Además de [GitHub Flavored Markdown](https://github.github.com/gfm/), el pipeline de
build añade:

- **Admoniciones** —— avisos `note`, `tip`, `important`, `caution` y `warning`.
- **Tarjetas de repositorios de GitHub** —— inserta un resumen con estrellas y licencia.
- **Bloques de código mejorados** —— funciones de Expressive Code, como secciones
  plegables, números de línea e insignias de lenguaje.
- **Matemáticas** —— fórmulas en línea y en bloque renderizadas con KaTeX.

Hay ejemplos ejecutables de cada una en las entradas de demostración de
`src/content/posts/`.

## Comandos

Ejecuta todos los comandos desde la raíz del repositorio:

| Comando | Acción |
|:--|:--|
| `pnpm install` | Instala las dependencias |
| `pnpm dev` | Inicia el servidor de desarrollo en `localhost:4321` |
| `pnpm build` | Compila el sitio en `./dist/` y lo indexa con Pagefind |
| `pnpm preview` | Sirve el build de producción en local |
| `pnpm check` | Ejecuta `astro check` para errores de tipos y plantillas |
| `pnpm format` | Formatea `src/` con Biome |
| `pnpm lint` | Analiza y corrige `src/` con Biome |
| `pnpm new-post <filename>` | Crea una entrada nueva |
| `pnpm astro ...` | Ejecuta comandos de la CLI de Astro, como `astro add` |

`pnpm build` ejecuta `astro build` y luego `pagefind --site dist`. La búsqueda solo
funciona sobre el build de producción, así que usa `pnpm build && pnpm preview` para
probarla.

## Despliegue

La salida en `dist/` es totalmente estática y puede alojarse en cualquier sitio.
Vercel, Netlify y Cloudflare Pages la compilan sin configuración adicional: define el
comando de build como `pnpm build` y el directorio de salida como `dist`, y sigue la
[guía de despliegue de Astro](https://docs.astro.build/es/guides/deploy/) para tu
proveedor.

Recuerda actualizar antes `site` en `astro.config.mjs`: de ello dependen el mapa del
sitio, el feed RSS y las URL canónicas.

La integración continua se ejecuta en cada push y pull request mediante
[.github/workflows/build.yml](../.github/workflows/build.yml) y
[.github/workflows/biome.yml](../.github/workflows/biome.yml).

## Créditos

Basado en [Fuwari](https://github.com/saicaca/fuwari), de
[saicaca](https://github.com/saicaca), que aportó el diseño y la implementación
originales. El proyecto original se sigue mediante el remoto `upstream` de git.

Las fuentes incluidas son [Roboto](https://fonts.google.com/specimen/Roboto) y
[JetBrains Mono](https://www.jetbrains.com/lp/mono/); los iconos provienen de
[Iconify](https://iconify.design/).

## Licencia

[MIT](../LICENSE) —— se conserva el aviso de copyright original.
