'use client';

import { RoundedBox } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import type { BoardFrame, BoardPiece } from '../lib/api';
import { PieceModel3D } from './board-piece-models-3d';
import { files, isLightSquare, ranks, squareToWorldPosition, type BoardOrientation } from '../lib/board-view';

type LegalTarget = {
  to: string;
  isCapture: boolean;
};

const lightSquareColor = '#ead9be';
const darkSquareColor = '#9f633e';
const boardEdgeColor = '#472c1d';
const boardTopColor = '#65412a';

function SquareMarker({
  square,
  orientation,
  color,
  scale = 0.68,
  opacity = 0.6,
}: {
  square: string;
  orientation: BoardOrientation;
  color: string;
  scale?: number;
  opacity?: number;
}) {
  const { x, z } = squareToWorldPosition(square, orientation);

  return (
    <mesh position={[x, 0.128, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[scale, scale]} />
      <meshStandardMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
}

function SquareRing({
  square,
  orientation,
  color,
  radius,
  tube,
}: {
  square: string;
  orientation: BoardOrientation;
  color: string;
  radius: number;
  tube: number;
}) {
  const { x, z } = squareToWorldPosition(square, orientation);

  return (
    <mesh position={[x, 0.132, z]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, tube, 12, 48]} />
      <meshStandardMaterial color={color} transparent opacity={0.9} />
    </mesh>
  );
}

function AnimatedPiece({
  piece,
  orientation,
  selected,
}: {
  piece: BoardPiece;
  orientation: BoardOrientation;
  selected: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const target = squareToWorldPosition(piece.square, orientation);
  const currentPositionRef = useRef(new THREE.Vector3(target.x, 0.14, target.z));
  const fromPositionRef = useRef(currentPositionRef.current.clone());
  const toPositionRef = useRef(currentPositionRef.current.clone());
  const animationStartRef = useRef(0);
  const animationDurationRef = useRef(0.42);
  const isAnimatingRef = useRef(false);
  const selectedLiftRef = useRef(0);

  function easeOutCubic(value: number) {
    return 1 - Math.pow(1 - value, 3);
  }

  useEffect(() => {
    const nextTarget = new THREE.Vector3(target.x, 0.14, target.z);
    const distance = currentPositionRef.current.distanceTo(nextTarget);

    fromPositionRef.current = currentPositionRef.current.clone();
    toPositionRef.current = nextTarget;
    animationStartRef.current = performance.now() / 1000;
    animationDurationRef.current = Math.min(0.62, Math.max(0.24, 0.26 + distance * 0.06));
    isAnimatingRef.current = distance > 0.001;
  }, [target.x, target.z]);

  useFrame(({ clock }, delta) => {
    const pieceGroup = groupRef.current;

    if (!pieceGroup) {
      return;
    }

    if (isAnimatingRef.current) {
      const elapsed = clock.elapsedTime - animationStartRef.current;
      const rawProgress = Math.min(1, elapsed / animationDurationRef.current);
      const easedProgress = easeOutCubic(rawProgress);

      currentPositionRef.current.lerpVectors(
        fromPositionRef.current,
        toPositionRef.current,
        easedProgress
      );

      if (rawProgress >= 1) {
        currentPositionRef.current.copy(toPositionRef.current);
        isAnimatingRef.current = false;
      }
    }

    const distance = fromPositionRef.current.distanceTo(toPositionRef.current);
    const travelLift = isAnimatingRef.current
      ? Math.sin(
          Math.PI *
            Math.min(
              1,
              (clock.elapsedTime - animationStartRef.current) / animationDurationRef.current
            )
        ) * Math.min(0.34, 0.12 + distance * 0.06)
      : 0;

    const selectedLiftTarget = selected ? 0.085 : 0;
    selectedLiftRef.current = THREE.MathUtils.damp(selectedLiftRef.current, selectedLiftTarget, 12, delta);

    pieceGroup.position.set(
      currentPositionRef.current.x,
      0.14 + travelLift + selectedLiftRef.current,
      currentPositionRef.current.z
    );
  });

  return (
    <group
      ref={groupRef}
      rotation={[0, piece.kind === 'knight' ? (piece.color === 'white' ? -Math.PI / 8 : Math.PI * 0.86) : 0, 0]}
    >
      <PieceModel3D piece={piece} selected={selected} />
    </group>
  );
}

function BoardScene({
  frame,
  orientation,
  selectedSquare,
  legalTargets,
}: {
  frame: BoardFrame;
  orientation: BoardOrientation;
  selectedSquare?: string | null;
  legalTargets: LegalTarget[];
}) {
  const captureTargetSet = useMemo(
    () => new Set(legalTargets.filter((target) => target.isCapture).map((target) => target.to)),
    [legalTargets]
  );
  const quietTargetSet = useMemo(
    () => new Set(legalTargets.filter((target) => !target.isCapture).map((target) => target.to)),
    [legalTargets]
  );

  return (
    <>
      <ambientLight intensity={1.25} />
      <hemisphereLight args={['#fff4dd', '#2c1b12', 0.7]} />
      <directionalLight
        castShadow
        intensity={1.85}
        position={[6, 11, 5]}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.00008}
      />

      <group position={[0, -0.12, 0]}>
        <RoundedBox args={[9.25, 0.58, 9.25]} radius={0.28} position={[0, -0.22, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={boardEdgeColor} roughness={0.92} />
        </RoundedBox>

        <RoundedBox args={[8.76, 0.18, 8.76]} radius={0.18} position={[0, 0, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={boardTopColor} roughness={0.82} />
        </RoundedBox>

        {ranks.flatMap((rank) =>
          files.map((file) => {
            const square = `${file}${rank}`;
            const { x, z } = squareToWorldPosition(square, orientation);

            return (
              <mesh key={square} position={[x, 0.06, z]} castShadow receiveShadow>
                <boxGeometry args={[0.98, 0.12, 0.98]} />
                <meshStandardMaterial
                  color={isLightSquare(file, rank) ? lightSquareColor : darkSquareColor}
                  roughness={0.84}
                />
              </mesh>
            );
          })
        )}

        {(frame.highlightSquares ?? []).map((square) => (
          <SquareMarker
            key={`history-${square}`}
            square={square}
            orientation={orientation}
            color="#f2a75f"
            scale={0.88}
            opacity={0.22}
          />
        ))}

        {selectedSquare ? (
          <SquareRing
            square={selectedSquare}
            orientation={orientation}
            color="#1d1812"
            radius={0.39}
            tube={0.055}
          />
        ) : null}

        {Array.from(quietTargetSet).map((square) => (
          <SquareMarker
            key={`target-${square}`}
            square={square}
            orientation={orientation}
            color="#fff5e4"
            scale={0.24}
            opacity={0.72}
          />
        ))}

        {Array.from(captureTargetSet).map((square) => (
          <SquareRing
            key={`capture-${square}`}
            square={square}
            orientation={orientation}
            color="#f8e6cd"
            radius={0.34}
            tube={0.045}
          />
        ))}

        {frame.pieces.map((piece) => (
          <AnimatedPiece
            key={piece.id}
            piece={piece}
            orientation={orientation}
            selected={piece.square === selectedSquare}
          />
        ))}
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.72, 0]} receiveShadow>
        <planeGeometry args={[26, 26]} />
        <shadowMaterial transparent opacity={0.16} />
      </mesh>
    </>
  );
}

export function BoardScene3D({
  frame,
  orientation = 'white',
  selectedSquare = null,
  legalTargets = [],
}: {
  frame: BoardFrame;
  orientation?: BoardOrientation;
  selectedSquare?: string | null;
  legalTargets?: LegalTarget[];
}) {
  return (
    <div className="board-canvas" aria-hidden="true">
      <Canvas
        camera={{ position: [6.5, 7.6, 6.5], fov: 34 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        shadows
      >
        <BoardScene
          frame={frame}
          orientation={orientation}
          selectedSquare={selectedSquare}
          legalTargets={legalTargets}
        />
      </Canvas>
    </div>
  );
}