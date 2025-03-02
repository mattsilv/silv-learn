import React, { useState, useEffect, useRef, useCallback } from "react";
import { GlossaryTerm } from "../types/glossary";
import { processTextWithTerms } from "../utils/termDetectionService";

interface TermHighlighterProps {
  content: string;
  glossaryTerms: GlossaryTerm[];
  userLearnedTerms: string[];
  manuallyTaggedTerms?: string[];
}

const TermHighlighter: React.FC<TermHighlighterProps> = ({
  content,
  glossaryTerms,
  userLearnedTerms,
  manuallyTaggedTerms = [],
}) => {
  const [activeTermId, setActiveTermId] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Process the content to highlight terms
  const processedContent = processTextWithTerms(
    content,
    glossaryTerms,
    userLearnedTerms,
    manuallyTaggedTerms
  );

  // Handle term hover events
  const handleMouseOver = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains("term-highlight")) {
      setActiveTermId(target.dataset.termId || null);

      // Position the tooltip
      if (containerRef.current) {
        const rect = target.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();

        setTooltipPosition({
          top: rect.bottom - containerRect.top,
          left: Math.max(0, rect.left - containerRect.left),
        });
      }
    }
  }, []);

  const handleMouseOut = useCallback(() => {
    setActiveTermId(null);
  }, []);

  // Set up event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("mouseover", handleMouseOver);
      container.addEventListener("mouseout", handleMouseOut);

      return () => {
        container.removeEventListener("mouseover", handleMouseOver);
        container.removeEventListener("mouseout", handleMouseOut);
      };
    }
  }, [handleMouseOver, handleMouseOut]);

  // Get active term details
  const activeTerm = activeTermId
    ? glossaryTerms.find((term) => term.id === activeTermId)
    : null;

  return (
    <div className="term-highlighter relative" ref={containerRef}>
      <div
        className="term-content"
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />

      {activeTerm && (
        <div
          className="term-tooltip absolute z-10 bg-white shadow-lg rounded-md p-3 max-w-xs"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          }}
        >
          <div className="font-bold">{activeTerm.term}</div>

          {activeTerm.full_form && (
            <div className="text-xs text-gray-500 mb-1">
              {activeTerm.full_form}
            </div>
          )}

          <div className="text-sm">{activeTerm.short_definition}</div>

          {activeTerm.related_terms && activeTerm.related_terms.length > 0 && (
            <div className="mt-2 text-xs">
              <span className="text-gray-600">Related: </span>
              {activeTerm.related_terms
                .filter((id) => userLearnedTerms.includes(id))
                .map((id) => {
                  const relatedTerm = glossaryTerms.find((t) => t.id === id);
                  return relatedTerm ? (
                    <span
                      key={id}
                      className="inline-block bg-blue-100 text-blue-800 px-1 rounded mr-1"
                    >
                      {relatedTerm.term}
                    </span>
                  ) : null;
                })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TermHighlighter;
