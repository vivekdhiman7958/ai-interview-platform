import { useEffect, useState } from "react";
import api from "../services/api";
import type { Report, Session, TranscriptMessage } from "../types/interview";

export function useSessionDetail(path: string) {
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(path)
      .then((res) => {
        setSession(res.data.session);
        setMessages(res.data.messages);
        setReport(
          res.data.session.report ? JSON.parse(res.data.session.report) : null
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [path]);

  return { session, messages, report, loading };
}
