export default function ErrorList({ errors }) {
  if (!errors || errors.length === 0) return null;
  return (
    <ul className="mb-4 space-y-1">
      {errors.map((e, i) => (
        <li key={i} className="error-text">{e.msg}</li>
      ))}
    </ul>
  );
}
