import { useEffect } from "react";

export default function useDocumentTitle(title) {
  useEffect(() => {
    if (title) {
      document.title = `${title} | Lab Management`;
    } else {
      document.title = "Lab Management System";
    }
  }, [title]);
}
