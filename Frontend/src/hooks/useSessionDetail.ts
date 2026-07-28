import { useEffect, useState } from "react";
import api from "../services/api";
import { getApiErrorMessage, safeJsonParse } from "../utils/errors";
import type { Report, Session, TranscriptMessage } from "../types/interview";

export function useSessionDetail(path: string, corruptedReportMessage: string) {
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    api.get(path)
      .then((res) => {
        setSession(res.data.session);
        setMessages(res.data.messages ?? []);

        const storedReport = res.data.session?.report ?? null;
        const parsedReport = safeJsonParse<Report>(storedReport, "session report");
        setReport(parsedReport);
        if (storedReport && !parsedReport) setError(corruptedReportMessage);
      })
      .catch((err) => {
        console.error("Failed to load session", path, err);
        setError(getApiErrorMessage(err, "Failed to load this interview session"));
      })
      .finally(() => setLoading(false));
  }, [path, corruptedReportMessage]);

  return { session, messages, report, loading, error };
}
