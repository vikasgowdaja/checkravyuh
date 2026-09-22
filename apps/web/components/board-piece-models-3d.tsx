'use client';

import type { BoardPiece } from '../lib/api';

type PieceMaterialProps = {
  color: string;
  roughness: number;
  metalness: number;
  emissive: string;
  emissiveIntensity: number;
};

function BasePiece({ material }: { material: PieceMaterialProps }) {
  return (
    <>
      <mesh castShadow receiveShadow position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.36, 0.4, 0.12, 32]} />
        <meshStandardMaterial {...material} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.24, 0.3, 0.1, 32]} />
        <meshStandardMaterial {...material} />
      </mesh>
    </>
  );
}

function PawnModel({ material }: { material: PieceMaterialProps }) {
  return (
    <>
      <mesh castShadow receiveShadow position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.16, 0.22, 0.34, 24]} />
        <meshStandardMaterial {...material} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.62, 0]}>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshStandardMaterial {...material} />
      </mesh>
    </>
  );
}

function RookModel({ material }: { material: PieceMaterialProps }) {
  return (
    <>
      <mesh castShadow receiveShadow position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.2, 0.24, 0.44, 24]} />
        <meshStandardMaterial {...material} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.67, 0]}>
        <cylinderGeometry args={[0.28, 0.24, 0.1, 24]} />
        <meshStandardMaterial {...material} />
      </mesh>
      {[
        [-0.16, 0.76, -0.16],
        [-0.16, 0.76, 0.16],
        [0.16, 0.76, -0.16],
        [0.16, 0.76, 0.16],
      ].map(([x, y, z], index) => (
        <mesh key={index} castShadow receiveShadow position={[x, y, z]}>
          <boxGeometry args={[0.12, 0.14, 0.12]} />
          <meshStandardMaterial {...material} />
        </mesh>
      ))}
    </>
  );
}

function KnightModel({ material }: { material: PieceMaterialProps }) {
  return (
    <>
      <mesh castShadow receiveShadow position={[0, 0.34, 0]}>
        <cylinderGeometry args={[0.18, 0.24, 0.28, 20]} />
        <meshStandardMaterial {...material} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.01, 0.64, 0]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.28, 0.56, 0.34]} />
        <meshStandardMaterial {...material} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.12, 0.92, 0]} rotation={[0, 0, -0.45]}>
        <boxGeometry args={[0.18, 0.26, 0.26]} />
        <meshStandardMaterial {...material} />
      </mesh>
      <mesh castShadow receiveShadow position={[-0.12, 0.92, 0]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.08, 0.24, 0.24]} />
        <meshStandardMaterial {...material} />
      </mesh>
    </>
  );
}

function BishopModel({ material, accentColor }: { material: PieceMaterialProps; accentColor: string }) {
  return (
    <>
      <mesh castShadow receiveShadow position={[0, 0.48, 0]}>
        <cylinderGeometry args={[0.12, 0.22, 0.62, 24]} />
        <meshStandardMaterial {...material} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.84, 0]}>
        <sphereGeometry args={[0.12, 24, 24]} />
        <meshStandardMaterial {...material} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.05, 0.96, 0]} rotation={[0, 0, 0.55]}>
        <boxGeometry args={[0.06, 0.24, 0.08]} />
        <meshStandardMaterial color={accentColor} roughness={0.6} />
      </mesh>
    </>
  );
}

function QueenModel({ material }: { material: PieceMaterialProps }) {
  const crownOffsets = [-0.18, -0.09, 0, 0.09, 0.18];

  return (
    <>
      <mesh castShadow receiveShadow position={[0, 0.52, 0]}>
        <cylinderGeometry args={[0.14, 0.22, 0.72, 28]} />
        <meshStandardMaterial {...material} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.93, 0]}>
        <sphereGeometry args={[0.13, 24, 24]} />
        <meshStandardMaterial {...material} />
      </mesh>
      {crownOffsets.map((offset) => (
        <mesh key={offset} castShadow receiveShadow position={[offset, 1.04, 0]}>
          <sphereGeometry args={[0.05, 20, 20]} />
          <meshStandardMaterial {...material} />
        </mesh>
      ))}
    </>
  );
}

function KingModel({ material }: { material: PieceMaterialProps }) {
  return (
    <>
      <mesh castShadow receiveShadow position={[0, 0.56, 0]}>
        <cylinderGeometry args={[0.14, 0.22, 0.78, 28]} />
        <meshStandardMaterial {...material} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.98, 0]}>
        <sphereGeometry args={[0.11, 24, 24]} />
        <meshStandardMaterial {...material} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 1.14, 0]}>
        <boxGeometry args={[0.06, 0.24, 0.06]} />
        <meshStandardMaterial {...material} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 1.17, 0]}>
        <boxGeometry args={[0.2, 0.05, 0.06]} />
        <meshStandardMaterial {...material} />
      </mesh>
    </>
  );
}

export function PieceModel3D({
  piece,
  selected,
}: {
  piece: BoardPiece;
  selected: boolean;
}) {
  const material: PieceMaterialProps =
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

  const accentColor = piece.color === 'white' ? '#d4b386' : '#8d5c3d';

  return (
    <>
      <BasePiece material={material} />
      {piece.kind === 'pawn' ? <PawnModel material={material} /> : null}
      {piece.kind === 'rook' ? <RookModel material={material} /> : null}
      {piece.kind === 'knight' ? <KnightModel material={material} /> : null}
      {piece.kind === 'bishop' ? <BishopModel material={material} accentColor={accentColor} /> : null}
      {piece.kind === 'queen' ? <QueenModel material={material} /> : null}
      {piece.kind === 'king' ? <KingModel material={material} /> : null}
    </>
  );
}