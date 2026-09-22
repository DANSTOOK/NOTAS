import React, { useEffect, useRef, useState } from 'react';
import * as m from 'motion/react-m';
import { effects } from '../../styles/motionTokens';
import type { ImageElement, Transform } from '../../state/types';
import { useAppState } from '../../state/store';
import { useSelection } from '../../hooks/useSelection';
import { useImageTransformGesture } from '../../hooks/useImageTransformGesture';
import { toCenteredCssTransform, toCssScale } from '../../utils/transformMath';
import { acquireBlobUrl, releaseBlobUrl } from '../../db/blobUrlCache';
import { SelectionHandles } from './SelectionHandles';

export function CanvasImageElement({ image }: { image: ImageElement }): React.JSX.Element {
  const { dispatch } = useAppState();
  const { selectImage, isSelected } = useSelection();
  const selected = isSelected({ kind: 'image', noteId: image.noteId, imageId: image.id });

  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const blobId = image.blobId;
    acquireBlobUrl(blobId).then((url) => {
      if (active) setObjectUrl(url);
      else releaseBlobUrl(blobId);
    });
    return () => {
      active = false;
      releaseBlobUrl(blobId);
    };
  }, [image.blobId]);

  const applyLive = (t: Transform) => {
    if (wrapperRef.current) {
      wrapperRef.current.style.transform = toCenteredCssTransform(t, image.baseWidth, image.baseHeight);
    }
    if (innerRef.current) {
      innerRef.current.style.transform = toCssScale(t);
    }
  };

  const { beginGesture, onPointerMove, onPointerUp } = useImageTransformGesture({
    getTransform: () => image.transform,
    baseSize: { w: image.baseWidth, h: image.baseHeight },
    getCenterScreen: () => {
      const rect = wrapperRef.current?.getBoundingClientRect();
      return rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : { x: 0, y: 0 };
    },
    onLive: applyLive,
    onCommit: (from, to) => dispatch({ type: 'image/transform', noteId: image.noteId, imageId: image.id, from, to })
  });

  return (
    <div
      ref={wrapperRef}
      className={`absolute left-0 top-0 touch-none ${selected ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        width: image.baseWidth,
        height: image.baseHeight,
        zIndex: image.zIndex,
        transform: toCenteredCssTransform(image.transform, image.baseWidth, image.baseHeight)
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        selectImage(image.noteId, image.id);
        beginGesture({ kind: 'move' }, e);
      }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div ref={innerRef} className="absolute inset-0" style={{ transform: toCssScale(image.transform) }}>
        {/* Solo se anima la opacidad: el transform de esta imagen lo escribe
            directamente el gesto de arrastre y no debe tocarlo la librería. */}
        {objectUrl && (
          <m.img
            src={objectUrl}
            draggable={false}
            className="h-full w-full object-contain"
            alt=""
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={effects.default}
          />
        )}
      </div>
      {selected && (
        <SelectionHandles
          baseWidth={image.baseWidth}
          baseHeight={image.baseHeight}
          scaleX={image.transform.scaleX}
          scaleY={image.transform.scaleY}
          onCornerDown={(corner, e) => beginGesture({ kind: 'resize', corner }, e)}
          onRotateDown={(e) => beginGesture({ kind: 'rotate' }, e)}
        />
      )}
    </div>
  );
}
