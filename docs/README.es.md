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
```

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
