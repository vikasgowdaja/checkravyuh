'use client';

import { RoundedBox } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import type { BoardFrame, BoardPiece } from '../lib/api';
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

function PieceGeometry({
  piece,
  selected,
}: {
  piece: BoardPiece;
  selected: boolean;
}) {
  const materialProps =
    piece.color === 'white'
      ? {
          color: '#fff7ea',
          roughness: 0.35,
          metalness: 0.14,
          emissive: selected ? '#b86a2f' : '#000000',
          emissiveIntensity: selected ? 0.28 : 0,
        }
      : {
          color: '#2b1d16',
          roughness: 0.48,
          metalness: 0.16,
          emissive: selected ? '#b86a2f' : '#000000',
          emissiveIntensity: selected ? 0.26 : 0,
        };

  const crownOffsets = [-0.18, -0.09, 0, 0.09, 0.18];

  return (
    <>
      <mesh castShadow receiveShadow position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.36, 0.4, 0.12, 32]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      <mesh castShadow receiveShadow position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.24, 0.3, 0.1, 32]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {piece.kind === 'pawn' ? (
        <>
          <mesh castShadow receiveShadow position={[0, 0.38, 0]}>
            <cylinderGeometry args={[0.16, 0.22, 0.34, 24]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, 0.62, 0]}>
            <sphereGeometry args={[0.16, 24, 24]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
        </>
      ) : null}

      {piece.kind === 'rook' ? (
        <>
          <mesh castShadow receiveShadow position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.2, 0.24, 0.44, 24]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, 0.67, 0]}>
            <cylinderGeometry args={[0.28, 0.24, 0.1, 24]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          {[
            [-0.16, 0.76, -0.16],
            [-0.16, 0.76, 0.16],
            [0.16, 0.76, -0.16],
            [0.16, 0.76, 0.16],
          ].map(([x, y, z], index) => (
            <mesh key={index} castShadow receiveShadow position={[x, y, z]}>
              <boxGeometry args={[0.12, 0.14, 0.12]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
          ))}
        </>
      ) : null}

      {piece.kind === 'knight' ? (
        <>
          <mesh castShadow receiveShadow position={[0, 0.34, 0]}>
            <cylinderGeometry args={[0.18, 0.24, 0.28, 20]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh castShadow receiveShadow position={[0.01, 0.64, 0]} rotation={[0, 0, -0.2]}>
            <boxGeometry args={[0.28, 0.56, 0.34]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh castShadow receiveShadow position={[0.12, 0.92, 0]} rotation={[0, 0, -0.45]}>
            <boxGeometry args={[0.18, 0.26, 0.26]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh castShadow receiveShadow position={[-0.12, 0.92, 0]} rotation={[0, 0, 0.3]}>
            <boxGeometry args={[0.08, 0.24, 0.24]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
        </>
      ) : null}

      {piece.kind === 'bishop' ? (
        <>
          <mesh castShadow receiveShadow position={[0, 0.48, 0]}>
            <cylinderGeometry args={[0.12, 0.22, 0.62, 24]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, 0.84, 0]}>
            <sphereGeometry args={[0.12, 24, 24]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh castShadow receiveShadow position={[0.05, 0.96, 0]} rotation={[0, 0, 0.55]}>
            <boxGeometry args={[0.06, 0.24, 0.08]} />
            <meshStandardMaterial color={piece.color === 'white' ? '#d4b386' : '#8d5c3d'} roughness={0.6} />
          </mesh>
        </>
      ) : null}

      {piece.kind === 'queen' ? (
        <>
          <mesh castShadow receiveShadow position={[0, 0.52, 0]}>
            <cylinderGeometry args={[0.14, 0.22, 0.72, 28]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, 0.93, 0]}>
            <sphereGeometry args={[0.13, 24, 24]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          {crownOffsets.map((offset) => (
            <mesh key={offset} castShadow receiveShadow position={[offset, 1.04, 0]}>
              <sphereGeometry args={[0.05, 20, 20]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
          ))}
        </>
      ) : null}

      {piece.kind === 'king' ? (
        <>
          <mesh castShadow receiveShadow position={[0, 0.56, 0]}>
            <cylinderGeometry args={[0.14, 0.22, 0.78, 28]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, 0.98, 0]}>
            <sphereGeometry args={[0.11, 24, 24]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, 1.14, 0]}>
            <boxGeometry args={[0.06, 0.24, 0.06]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, 1.17, 0]}>
            <boxGeometry args={[0.2, 0.05, 0.06]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
        </>
      ) : null}
    </>
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
  const startPositionRef = useRef(currentPositionRef.current.clone());
  const endPositionRef = useRef(currentPositionRef.current.clone());
  const progressRef = useRef(1);

  useEffect(() => {
    startPositionRef.current = currentPositionRef.current.clone();
    endPositionRef.current = new THREE.Vector3(target.x, 0.14, target.z);
    progressRef.current = 0;
  }, [target.x, target.z]);

  useFrame((_, delta) => {
    const pieceGroup = groupRef.current;

    if (!pieceGroup) {
      return;
    }

    progressRef.current = Math.min(1, progressRef.current + delta * 4.8);
    const eased = 1 - Math.pow(1 - progressRef.current, 3);

    currentPositionRef.current.lerpVectors(
      startPositionRef.current,
      endPositionRef.current,
      eased
    );

    const distance = startPositionRef.current.distanceTo(endPositionRef.current);
    const travelLift = distance > 0.01 ? Math.sin(Math.PI * eased) * Math.min(0.38, 0.14 + distance * 0.08) : 0;
    const selectedLift = selected ? 0.08 : 0;

    pieceGroup.position.set(
      currentPositionRef.current.x,
      0.14 + travelLift + selectedLift,
      currentPositionRef.current.z
    );
  });

  return (
    <group
      ref={groupRef}
      rotation={[0, piece.kind === 'knight' ? (piece.color === 'white' ? -Math.PI / 8 : Math.PI * 0.86) : 0, 0]}
    >
      <PieceGeometry piece={piece} selected={selected} />
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
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
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