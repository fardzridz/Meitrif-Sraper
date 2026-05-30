"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Key, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";
import { getApiKeys, saveApiKey, deleteApiKey } from "@/lib/sentiment-api";
import type { UserApiKey } from "@/lib/sentiment-types";

export default function SettingsPage() {
  const [keys, setKeys] = useState<UserApiKey[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [openaiKey, setOpenaiKey] = useState("");
  const [googleKey, setGoogleKey] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadKeys();
  }, []);

  async function loadKeys() {
    setLoading(true);
    try {
      const data = await getApiKeys();
      setKeys(data);
    } catch {
      // API not available yet, show empty state
      setKeys([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveKey(provider: "openai" | "google") {
    const key = provider === "openai" ? openaiKey : googleKey;
    if (!key.trim()) return;

    setSaving(provider);
    setMessage("");
    try {
      await saveApiKey(provider, key);
      setMessage(`API key ${provider} berhasil disimpan.`);
      if (provider === "openai") setOpenaiKey("");
      else setGoogleKey("");
      await loadKeys();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Gagal menyimpan key");
    } finally {
      setSaving(null);
    }
  }

  async function handleDeleteKey(provider: string) {
    if (!confirm(`Hapus API key ${provider}?`)) return;
    try {
      await deleteApiKey(provider);
      setKeys((prev) => prev.filter((k) => k.provider !== provider));
      setMessage(`API key ${provider} berhasil dihapus.`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Gagal menghapus key");
    }
  }

  const openaiSaved = keys.find((k) => k.provider === "openai");
  const googleSaved = keys.find((k) => k.provider === "google");

  return (
    <>
      <PageHeader
        title="Pengaturan"
        description="Kelola API key dan preferensi analisis sentimen."
      />

      {message && (
        <div className="mb-4 rounded-md border border-primary/30 bg-primary/5 p-3 text-sm font-medium text-ink">
          {message}
        </div>
      )}

      {/* API Keys */}
      <section className="grid gap-6">
        <h2 className="text-lg font-bold text-ink">API Keys</h2>

        {/* OpenAI */}
        <Card>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-900">
              <Key size={18} className="text-white" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-semibold text-ink">OpenAI</h3>
              <p className="text-sm text-ink-muted">Untuk model GPT-4o dan GPT-4o Mini</p>
            </div>
          </div>

          {loading ? (
            <Skeleton className="mt-4 h-11" />
          ) : openaiSaved ? (
            <div className="mt-4 flex items-center justify-between rounded-md border border-line bg-slate-50 p-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" aria-hidden="true" />
                <span className="text-sm font-medium text-ink">
                  Key tersimpan: ****{openaiSaved.key_hint}
                </span>
                {openaiSaved.is_active && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    Active
                  </span>
                )}
              </div>
              <Button
                variant="secondary"
                onClick={() => handleDeleteKey("openai")}
                title="Hapus key"
              >
                <Trash2 size={15} aria-hidden="true" />
              </Button>
            </div>
          ) : (
            <div className="mt-4 grid gap-3">
              <Input
                label="OpenAI API Key"
                placeholder="sk-..."
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                helper="Dapatkan dari platform.openai.com. Key disimpan terenkripsi."
              />
              <Button
                onClick={() => handleSaveKey("openai")}
                disabled={!openaiKey.trim() || saving === "openai"}
              >
                {saving === "openai" ? "Menyimpan..." : "Simpan Key"}
              </Button>
            </div>
          )}
        </Card>

        {/* Google */}
        <Card>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-600">
              <Key size={18} className="text-white" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-semibold text-ink">Google Cloud NLP</h3>
              <p className="text-sm text-ink-muted">Untuk Google Natural Language API</p>
            </div>
          </div>

          {loading ? (
            <Skeleton className="mt-4 h-11" />
          ) : googleSaved ? (
            <div className="mt-4 flex items-center justify-between rounded-md border border-line bg-slate-50 p-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" aria-hidden="true" />
                <span className="text-sm font-medium text-ink">
                  Key tersimpan: ****{googleSaved.key_hint}
                </span>
                {googleSaved.is_active && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    Active
                  </span>
                )}
              </div>
              <Button
                variant="secondary"
                onClick={() => handleDeleteKey("google")}
                title="Hapus key"
              >
                <Trash2 size={15} aria-hidden="true" />
              </Button>
            </div>
          ) : (
            <div className="mt-4 grid gap-3">
              <Input
                label="Google Cloud API Key"
                placeholder="AIza..."
                value={googleKey}
                onChange={(e) => setGoogleKey(e.target.value)}
                helper="Dapatkan dari Google Cloud Console."
              />
              <Button
                onClick={() => handleSaveKey("google")}
                disabled={!googleKey.trim() || saving === "google"}
              >
                {saving === "google" ? "Menyimpan..." : "Simpan Key"}
              </Button>
            </div>
          )}
        </Card>
      </section>

      {/* Preferences */}
      <section className="mt-8 grid gap-6">
        <h2 className="text-lg font-bold text-ink">Preferensi Default</h2>
        <Card>
          <div className="grid gap-5">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-ink">Model Default</span>
              <select className="h-11 rounded-md border border-line bg-white px-3 text-sm text-ink focus:outline focus:outline-2 focus:outline-primary">
                <option value="indobert">IndoBERT (Lokal — Gratis)</option>
                <option value="openai-gpt4o-mini">OpenAI GPT-4o Mini</option>
                <option value="openai-gpt4o">OpenAI GPT-4o</option>
                <option value="google-nlp">Google Cloud NLP</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-ink">Jumlah Topik Default</span>
              <input
                type="number"
                min={3}
                max={10}
                defaultValue={5}
                className="h-11 w-24 rounded-md border border-line bg-white px-3 text-sm text-ink focus:outline focus:outline-2 focus:outline-primary"
              />
            </label>

            <fieldset className="grid gap-2">
              <legend className="text-sm font-medium text-ink">Analisis Default</legend>
              <div className="flex flex-wrap gap-3">
                {["Sentiment", "Emotion", "Aspect", "Keyword", "Topic"].map((type) => (
                  <label key={type} className="flex items-center gap-2 text-sm text-ink">
                    <input
                      type="checkbox"
                      defaultChecked={type === "Sentiment" || type === "Emotion"}
                      className="h-4 w-4 accent-primary"
                    />
                    {type}
                  </label>
                ))}
              </div>
            </fieldset>

            <Button className="w-fit">Simpan Preferensi</Button>
          </div>
        </Card>
      </section>
    </>
  );
}
