# NOTAS

Aplicativo para guardar notas y tareas, con un lienzo de imágenes dentro de
cada nota. Funciona sin conexión: todo se guarda en tu equipo.

## Qué hace

- **Notas y tareas.** Título, lista de tareas con barra de progreso, prioridad y
  fecha de vencimiento (las vencidas se marcan en rojo).
- **Estado de progreso.** Cada nota es *Pendiente*, *En curso* o *Hecha*, con
  filtros y recuento en la barra lateral.
- **Lienzo de imágenes.** Pega una captura con `Ctrl+V`, arrástrala desde el
  explorador o usa el botón. Luego puedes moverla, girarla 360°, escalarla
  (con `Shift` mantiene la proporción), duplicarla y ordenar las capas.
- **Deshacer y rehacer de verdad.** `Ctrl+Z` / `Ctrl+Y` cubren texto, tareas y
  transformaciones de imagen. Un arrastre completo es un solo paso, y escribir
  un título seguido también.
- **Dos vistas.** Cuadrícula compacta o lista; al pulsar una nota se abre su
  detalle para editarla.
- **Tema claro y oscuro**, y respeto por la opción del sistema de reducir
  animaciones.

## Atajos

| Atajo | Acción |
|---|---|
| `Ctrl+N` | Nueva nota |
| `Ctrl+Z` / `Ctrl+Y` | Deshacer / rehacer |
| `Ctrl+V` | Pegar imagen del portapapeles en la nota abierta |
| `Ctrl+C` / `Ctrl+X` / `Ctrl+V` | Copiar, cortar y pegar la nota o imagen seleccionada |
| `Supr` | Borrar lo seleccionado |
| `Esc` | Quitar la selección o cerrar el detalle |
| `Enter` | En una tarea, crea la siguiente |
| `Retroceso` | En una tarea vacía, la borra |

## Probar la app

Descarga el ZIP de la sección **Releases**, descomprímelo y ejecuta `Notas.exe`.
No necesita instalación. Windows puede avisar de que el programa no está
firmado: es normal en aplicaciones sin certificado de firma.

## Desarrollo

Requiere Node.js 20 o superior.

```bash
npm install
npm run dev
```

Otros comandos:

```bash
npm run typecheck   # comprobación de tipos
npm run build       # compila la app
npm run build:win   # genera el ZIP portable en dist/
```

## Cómo está construido

Electron + React + TypeScript + Vite, TailwindCSS para los estilos, Dexie.js
sobre IndexedDB para el guardado y Motion para las animaciones.

Tres decisiones que explican el resto del código:

1. **Las imágenes se transforman escribiendo `transform` directamente en el
   DOM** durante el arrastre, sin pasar por el estado de React. Así no se
   recalcula el diseño en cada movimiento del ratón. Solo al soltar se registra
   un cambio, y por eso un gesto entero es un único paso de deshacer.
2. **El historial guarda acciones reversibles**, no copias del estado. Cada
   acción sabe construir su contraria, así que deshacer no depende de duplicar
   las imágenes en memoria.
3. **Los archivos de imagen viven en una tabla aparte** de sus datos de
   posición. Mover una imagen reescribe unos pocos números, nunca el archivo.

El sistema de movimiento y las decisiones de diseño están documentados en
[MOTION.md](MOTION.md).

## Licencia

MIT
