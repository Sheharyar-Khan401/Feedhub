const ReactQuill = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
  <textarea
    data-testid="quill-editor"
    value={value}
    onChange={(e) => onChange(e.target.value)}
  />
);

export default ReactQuill; 