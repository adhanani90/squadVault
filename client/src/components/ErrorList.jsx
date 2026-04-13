export default function ErrorList({ errors }) {
  if (!errors || errors.length === 0) return null;
  return (
    <ul>
      {errors.map((e, i) => (
        <li key={i}>{e.msg}</li>
      ))}
    </ul>
  );
}
