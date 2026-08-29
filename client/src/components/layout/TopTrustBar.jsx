import "./TopTrustBar.css";

export default function TopTrustBar() {
  return (
    <div className="top-trust-bar">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <rect x="5" y="11" width="14" height="9" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </svg>
      <span>
        Alışverişleriniz 256 bit SSL sertifikası ile güvence altındadır.
      </span>
    </div>
  );
}
