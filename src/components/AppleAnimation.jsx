import "./AppleAnimation.css";

export default function AppleAnimation({ type }) {
  return (
    <div className={`apple-fly ${type}`}>
      🍎
    </div>
  );
}
