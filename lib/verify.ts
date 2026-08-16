import { File } from 'expo-file-system';
import { supabase } from './supabase';

export type ParsedTicket = {
  documentKind: 'flight' | 'hotel' | 'rail' | 'activity' | 'car' | 'other' | null;
  confidence: number;
  traveller: string | null;
  startDate: string | null;
  endDate: string | null;
  origin: { city: string | null; code: string | null; country: string | null } | null;
  destination: { city: string | null; code: string | null; country: string | null } | null;
  carrier: string | null;
  reference: string | null;
  notes: string | null;
};

export type ParseResult = { draftId: string; parsed: ParsedTicket };

function extOf(uri: string, mime?: string) {
  if (mime === 'application/pdf') return 'pdf';
  const m = uri.split('?')[0].match(/\.(\w+)$/);
  return (m?.[1] ?? 'jpg').toLowerCase();
}

/**
 * Uploads a ticket to the private documents bucket, records it, then asks the
 * parse-ticket Edge Function to read it. Returns a DRAFT — nothing reaches the
 * traveller's passport until they confirm it.
 */
export async function uploadAndParse(opts: {
  uri: string;
  mimeType?: string;
  fileName?: string;
  kind?: 'flight' | 'hotel' | 'rail' | 'activity' | 'car' | 'other';
}): Promise<ParseResult> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth?.user?.id;
  if (!userId) throw new Error('Not signed in.');

  const ext = extOf(opts.uri, opts.mimeType);
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const contentType = opts.mimeType ?? (ext === 'pdf' ? 'application/pdf' : 'image/jpeg');

  // React Native's fetch cannot stream a file:// URI into Storage reliably, so
  // read the raw bytes. SDK 54's File API gives us a Uint8Array directly —
  // readAsStringAsync is deprecated, and base64 round-tripping was wasteful anyway.
  const bytes = await new File(opts.uri).bytes();

  const { error: upErr } = await supabase.storage
    .from('documents')
    .upload(path, bytes, { contentType, upsert: false });
  if (upErr) throw new Error(`Upload failed: ${upErr.message}`);

  const { data: doc, error: docErr } = await supabase
    .from('documents')
    .insert({
      owner_id: userId,
      kind: opts.kind ?? 'other',
      storage_path: path,
      file_name: opts.fileName ?? null,
    })
    .select('id')
    .single();
  if (docErr) throw new Error(`Could not record the document: ${docErr.message}`);

  const { data, error } = await supabase.functions.invoke('parse-ticket', {
    body: { storagePath: path, documentId: doc.id },
  });

  // Non-2xx responses arrive as FunctionsHttpError with the body on context.
  if (error) {
    let body: any = null;
    try { body = await (error as any)?.context?.json?.(); } catch { /* ignore */ }
    throw new VerifyError(
      body?.error ?? readableFnError(error),
      { duplicate: !!body?.duplicate, existingTripId: body?.existingTripId ?? null }
    );
  }
  if ((data as any)?.error) {
    throw new VerifyError((data as any).error, {
      duplicate: !!(data as any).duplicate,
      existingTripId: (data as any).existingTripId ?? null,
    });
  }

  return data as ParseResult;
}

export class VerifyError extends Error {
  duplicate: boolean;
  existingTripId: string | null;
  constructor(message: string, opts: { duplicate?: boolean; existingTripId?: string | null } = {}) {
    super(message);
    this.duplicate = !!opts.duplicate;
    this.existingTripId = opts.existingTripId ?? null;
  }
}

function readableFnError(error: any) {
  const msg = error?.message ?? String(error);
  if (msg.includes('ANTHROPIC_API_KEY')) {
    return 'The parser is not configured yet — the API key is missing on the server.';
  }
  if (msg.includes('non-2xx')) {
    return 'Could not read that document. Try a sharper photo, or add the trip by hand.';
  }
  return msg;
}

/** Turns a DATE_MISMATCH from the confirm RPC into something a person can act on. */
export function readableSaveError(e: any): { message: string; mismatch: boolean } {
  const msg = e?.message ?? String(e);
  if (msg.includes('DATE_MISMATCH')) {
    const m = msg.match(/dated (\d{4}-\d{2}-\d{2})/);
    return {
      mismatch: true,
      message:
        `Your ticket is dated ${m?.[1] ?? 'a different day'}, which falls outside the trip dates you set. ` +
        `Either fix the dates so they include the ticket, or save it as an unverified trip.`,
    };
  }
  return { message: msg, mismatch: false };
}

/** Turns a parsed ticket into the shape the Add-a-trip screen expects. */
export function draftToTripFields(p: ParsedTicket) {
  const placeNames = [p.origin?.city, p.destination?.city].filter(Boolean) as string[];
  const title = p.destination?.city ? `${p.destination.city}` : null;
  return {
    placeNames,
    startDate: p.startDate,
    endDate: p.endDate ?? p.startDate,
    title,
    notes: [p.carrier, p.reference].filter(Boolean).join(' · ') || null,
  };
}
