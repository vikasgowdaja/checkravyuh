'use client';

import { useEffect, useMemo, useState } from 'react';

import type { AnalysisMoveNode, MoveAnnotation, MoveGlyph } from '../lib/analysis';

const GLYPHS: Array<MoveGlyph | 'none'> = ['none', '!', '!!', '?', '??', '!?', '?!'];

type AnalysisAnnotationPanelProps = {
  selectedMove: AnalysisMoveNode | null;
  annotations: MoveAnnotation[];
  onSave: (glyph: MoveGlyph | null, comment: string) => void;
};

export function AnalysisAnnotationPanel({
  selectedMove,
  annotations,
  onSave,
}: AnalysisAnnotationPanelProps) {
  const existing = useMemo(() => {
    if (!selectedMove) {
      return null;
    }

    return annotations.find((entry) => entry.moveId === selectedMove.id) ?? null;
  }, [annotations, selectedMove]);

  const [glyph, setGlyph] = useState<MoveGlyph | null>(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    setGlyph(existing?.glyph ?? null);
    setComment(existing?.comment ?? '');
  }, [existing?.comment, existing?.glyph]);

  return (
    <section className="panel-card analysis-annotation-card">
      <div className="eyebrow">Annotations</div>
      {selectedMove ? (
        <>
          <p className="muted-copy" style={{ marginBottom: 10 }}>
            Editing move {selectedMove.ply}: {selectedMove.san}
          </p>
          <div className="analysis-glyphs">
            {GLYPHS.map((value) => {
              const isActive = (value === 'none' && !glyph) || value === glyph;

              return (
                <button
                  key={value}
                  type="button"
                  className={`analysis-glyph ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setGlyph(value === 'none' ? null : value);
                  }}
                >
                  {value === 'none' ? 'None' : value}
                </button>
              );
            })}
          </div>
          <label className="analysis-comment-label" htmlFor="analysis-comment">
            Position comment
          </label>
          <textarea
            id="analysis-comment"
            className="analysis-comment-area"
            placeholder="Add your analysis notes for this move..."
            value={comment}
            onChange={(event) => {
              setComment(event.target.value);
            }}
            rows={4}
          />
          <div className="action-row" style={{ marginTop: 10 }}>
            <button
              type="button"
              className="action-button"
              onClick={() => {
                onSave(glyph, comment);
              }}
            >
              Save annotation
            </button>
          </div>
        </>
      ) : (
        <p className="muted-copy">Select a move from the list to annotate it.</p>
      )}
    </section>
  );
}
