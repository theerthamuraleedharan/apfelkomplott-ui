import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { ASSET_BASE_URL } from "../api/gameApi";
import "./CardMedia.css";

function resolveSrc(src) {
  if (!src) return "";
  if (src.startsWith("http")) return src;
  return `${ASSET_BASE_URL}${src}`;
}

/**
 * Renders media attached to production or event cards.
 *
 * The component supports image assets, QR-code image assets, and QR-code values
 * that are generated in the browser. Missing or failed assets are represented
 * with placeholders so card layouts remain stable during demonstrations.
 *
 * @component
 * @param {object} props - Component props.
 * @param {object|null} props.item - Media
 * descriptor from the backend.
 * @param {string} [props.alt=""] - Accessible text for image media.
 * @param {string} [props.className=""] - Additional class for the outer media.
 * @param {string} [props.imageClassName=""] - Additional image class.
 * @param {string} [props.qrClassName=""] - Additional QR image class.
 * @param {string} [props.qrWrapClassName=""] - Additional generated-QR wrapper
 * class.
 * @param {string} [props.placeholderClassName=""] - Additional placeholder
 * class.
 * @returns {JSX.Element|null} Rendered media, placeholder, or null.
 */
export default function CardMedia({
  item,
  alt = "",
  className = "",
  imageClassName = "",
  qrClassName = "",
  qrWrapClassName = "",
  placeholderClassName = "",
}) {
  const [failed, setFailed] = useState(false);

  if (!item) return null;

  if (item.type === "image") {
    const src = resolveSrc(item.src);
    if (!src) {
      return (
        <div className={`card-media__placeholder ${placeholderClassName} ${className}`.trim()}>
          Image src missing
        </div>
      );
    }
    if (failed) {
      return (
        <div className={`card-media__placeholder ${placeholderClassName} ${className}`.trim()}>
          Image not found
        </div>
      );
    }

    return (
      <img
        className={`card-media card-media--image ${imageClassName} ${className}`.trim()}
        src={src}
        alt={alt}
        onError={() => setFailed(true)}
      />
    );
  }

  if (item.type === "qr" && item.src) {
    const src = resolveSrc(item.src);
    if (!src) {
      return (
        <div className={`card-media__placeholder ${placeholderClassName} ${className}`.trim()}>
          QR src missing
        </div>
      );
    }
    if (failed) {
      return (
        <div className={`card-media__placeholder ${placeholderClassName} ${className}`.trim()}>
          QR image not found
        </div>
      );
    }

    return (
      <img
        className={`card-media card-media--qr ${qrClassName} ${className}`.trim()}
        src={src}
        alt={alt || "QR"}
        onError={() => setFailed(true)}
      />
    );
  }

  if (item.type === "qr" && item.value) {
    return (
      <div className={`card-media card-media--qrWrap ${qrWrapClassName} ${className}`.trim()}>
        <QRCodeCanvas value={item.value} size={120} />
      </div>
    );
  }

  return null;
}
