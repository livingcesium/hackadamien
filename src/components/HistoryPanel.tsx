import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";

export default function HistoryPanel() {
  const [isOpen, setIsOpen] = useState(false);

  return <FontAwesomeIcon icon={faClock} />;
}
