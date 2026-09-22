import React from 'react';
import { LazyMotion, MotionConfig, domMax } from 'motion/react';
import { AppStateProvider } from './state/store';
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts';
import { NotesBoard } from './components/board/NotesBoard';

function Shortcuts(): null {
  useGlobalShortcuts();
  return null;
}

export default function App(): React.JSX.Element {
  return (
    // domMax incluye las animaciones de layout (reflujo de las tarjetas).
    // `strict` obliga a usar los componentes `m.*`, que es lo que mantiene
    // pequeño el paquete inicial. reducedMotion="user" respeta la opción del
    // sistema de reducir animaciones.
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user">
        <AppStateProvider>
          <Shortcuts />
          <NotesBoard />
        </AppStateProvider>
      </MotionConfig>
    </LazyMotion>
  );
}
