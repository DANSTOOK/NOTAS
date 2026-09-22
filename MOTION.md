# Sistema de movimiento (estilo Android / Material 3)

Documento de la investigación previa y de cómo quedó implementado el movimiento
en la app. Fecha: septiembre de 2026.

## 1. Qué librería y por qué

Se evaluaron las tres opciones que dominan las comparativas de 2026:

| Librería | Tamaño (gzip) | Descargas/semana | Notas |
|---|---|---|---|
| **Motion** (antes Framer Motion) | ~30–34 KB completa; **~4,6 KB** con `LazyMotion` + `m`, +15 KB `domAnimation`, +25 KB `domMax` | ~38,7 M | Animaciones de layout, `AnimatePresence` para salidas, gestos |
| React Spring | ~12–19 KB | ~1,0 M | Física de muelles, muy *tree-shakeable*, sin animaciones de layout |
| GSAP | ~23 KB | — | Potentísima en timelines, pero no es idiomática en React |

**Elegida: `motion` v13.** Motivos:

1. **Animaciones de layout.** Es lo que da el efecto "premium" de Android: al
   borrar o crear una nota, las demás **se recolocan solas con física**, no dan
   un salto. React Spring no trae esto de serie.
2. **`AnimatePresence`.** Permite animar la *salida* de un elemento antes de
   desmontarlo. Sin esto, borrar una nota o una tarea es un corte seco.
3. Es el estándar de hecho: ~37 veces más descargas que la alternativa, lo que
   importa para encontrar respuestas cuando algo falla.
4. El coste en tamaño es el argumento en contra, pero **esta app es de
   escritorio y local**: no hay descarga por red que penalizar. Aun así se usa
   `LazyMotion` + los componentes `m.*` (ver abajo), que es lo recomendado
   oficialmente para no cargar el paquete completo de golpe.

Coste real medido en este proyecto: el paquete del renderizador pasó de 414 KB
a 707 KB sin comprimir. Si algún día molesta, la vía es cambiar `domMax` por
`domAnimation` (−25 KB), a cambio de perder las animaciones de layout.

## 2. Tokens de Material 3

M3 Expressive sustituyó el sistema clásico de "duración + curva" por **muelles
físicos**. La documentación distingue dos familias:

- **Spatial** (posición, tamaño, rotación, esquinas): el muelle **sobrepasa** el
  valor final y rebota al colocarse.
- **Effects** (color, opacidad): **nunca** sobrepasa.

Cada familia tiene tres velocidades (rápida, normal, lenta) y dos esquemas
(estándar y expresivo).

Las constantes exactas de rigidez y amortiguación de androidx **no aparecen en
la documentación pública** (la API de Compose las esconde tras `MotionScheme`),
así que los muelles de [motionTokens.ts](src/styles/motionTokens.ts) están
calibrados a mano para reproducir ese comportamiento descrito: rebote contenido
en los espaciales, cero rebote en los de efecto.

Las curvas clásicas sí están documentadas y se conservan para lo que debe durar
un tiempo fijo (por ejemplo, una salida):

| Token | Curva |
|---|---|
| Standard | `cubic-bezier(0.2, 0, 0, 1)` |
| Standard decelerate | `cubic-bezier(0, 0, 0, 1)` |
| Standard accelerate | `cubic-bezier(0.3, 0, 1, 1)` |
| Emphasized decelerate | `cubic-bezier(0.05, 0.7, 0.1, 1)` |
| Emphasized accelerate | `cubic-bezier(0.3, 0, 0.8, 0.15)` |

Duraciones M3: corta 50/100/150/200 ms, media 250/300/350/400 ms, larga
450/500/550/600 ms, extralarga 700/800/900/1000 ms.

**Regla de oro de M3**, que se siguió en toda la app: *lo que entra desacelera,
lo que sale acelera, lo que cambia de estado usa la curva estándar.*

## 3. Cómo quedó implementado

- [motionTokens.ts](src/styles/motionTokens.ts) — curvas, duraciones y muelles.
  Todo lo demás tira de aquí, para que el movimiento sea coherente.
- [App.tsx](src/App.tsx) — `LazyMotion features={domMax} strict` (carga mínima,
  y `strict` obliga a usar `m.*` para que no se cuele el paquete completo) y
  `MotionConfig reducedMotion="user"`, que **respeta la opción del sistema de
  reducir animaciones**.
- **Tarjetas** ([NoteCard.tsx](src/components/board/NoteCard.tsx)): entran con
  muelle espacial, salen acelerando, se elevan al pasar el ratón y se recolocan
  con `layout="position"`.
- **Tareas** ([ChecklistItemRow.tsx](src/components/checklist/ChecklistItemRow.tsx)):
  entran y salen colapsando la altura; la casilla se hunde al pulsarla.
- **Barra de progreso**: el ancho se anima con muelle, no con transición CSS.
- **Botones**: se encogen al pulsar, como el *ripple* de Android.
- **Tema**: el icono gira y se cambia con `AnimatePresence`.
- **Tiradores de selección**: aparecen con un pequeño rebote escalonado.

## 4. La regla que no se puede romper

El arrastre, giro y escalado de imágenes **escribe `transform` directamente en
el DOM** para no provocar recálculos de diseño en cada movimiento del ratón. Si
se envuelve ese elemento en una animación de la librería, las dos escriben la
misma propiedad y pelean.

Por eso, en [CanvasImageElement.tsx](src/components/canvas/CanvasImageElement.tsx)
solo se anima la **opacidad** de la imagen, nunca su `transform`; y las tarjetas
usan `layout="position"` (que no escala) en lugar de `layout`, para no deformar
las imágenes que contienen mientras se recolocan.

## Fuentes

- [Easing and duration – Material Design 3](https://m3.material.io/styles/motion/easing-and-duration/tokens-specs)
- [Motion – Material Design 3 (cómo funciona)](https://m3.material.io/styles/motion/overview/how-it-works)
- [A motion system designed for expression – Material Design 3](https://m3.material.io/styles/motion/)
- [Material 3 motion: valores de curvas y duraciones (vocut research)](https://github.com/anzy-renlab-ai/vocut/blob/main/docs/research/methodology/material-motion.md)
- [material3-motion.md (compose-skill)](https://github.com/aldefy/compose-skill/blob/master/skills/compose-expert/references/material3-motion.md)
- [Reduce bundle size of Framer Motion | Motion for React](https://motion.dev/docs/react-reduce-bundle-size)
- [LazyMotion | Motion for React](https://motion.dev/docs/react-lazy-motion)
- [Motion & Framer Motion upgrade guide](https://motion.dev/docs/react-upgrade-guide)
- [Comparing the best React animation libraries for 2026 – LogRocket](https://blog.logrocket.com/best-react-animation-libraries/)
- [Framer Motion vs React Spring (2026) – PkgPulse](https://www.pkgpulse.com/compare/framer-motion-vs-react-spring)
- [Choosing a React Animation Library: Performance Trade-Offs – Syncfusion](https://www.syncfusion.com/blogs/post/react-animation-libraries-comparison)
- [GSAP vs Framer Motion vs React Spring – Good Fella Lab](https://lab.good-fella.com/blog/gsap-vs-framer-motion-vs-react-spring)
- [Animate movement using spring physics – Android Developers](https://developer.android.com/develop/ui/views/animations/spring-animation)
