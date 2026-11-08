/**
 * Renders text from the JSON, turning *wrapped words* into the brass italic
 * accent used in headings: "Selected *work*." → Selected <em>work</em>.
 */
export function Emphasis({ text }: { text: string }) {
  const parts = text.split(/\*([^*]+)\*/);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <em key={i} className="text-accent">
            {part}
          </em>
        ) : (
          part
        ),
      )}
    </>
  );
}
