import React from 'react';
import * as m from 'motion/react-m';
import { spatial } from '../../styles/motionTokens';

export function ProgressBar({ ratio }: { ratio: number }): React.JSX.Element {
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-lineStrong">
      <m.div
        className={`h-full rounded-full ${ratio === 1 ? 'bg-note-green' : 'bg-accent'}`}
        initial={false}
        animate={{ width: `${Math.round(ratio * 100)}%` }}
        transition={spatial.default}
      />
    </div>
  );
}
