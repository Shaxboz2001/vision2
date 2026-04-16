import { useSelector } from "react-redux";
import { latinToCyrillic } from "@/utils/transliterate";

export function useScriptText() {
  const script = useSelector((s) => s.ui.script || "latin");

  const t = (value) => {
    if (value == null) return "";
    if (typeof value !== "string") return value;
    return script === "cyrillic" ? latinToCyrillic(value) : value;
  };

  return { script, t };
}
