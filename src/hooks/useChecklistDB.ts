import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getLocalDateStr } from "@/lib/dateUtils";

// ─── TYPES ───────────────────────────────────────────────────────────────────

export type ChecklistItemStatus = "done" | "skipped";

export interface CheckedItemInfo {
  horario_real: string | null;
  status: ChecklistItemStatus;
}

// ─── CHECKLIST ───────────────────────────────────────────────────────────────

export const loadCheckedFromDB = async (dayIdx: number, dateStr?: string): Promise<Map<string, CheckedItemInfo>> => {
  const d = dateStr || getLocalDateStr();
  const { data } = await supabase
    .from("checklist_items")
    .select("item_id, horario_real, status")
    .eq("data", d)
    .eq("dia_semana", dayIdx);
  const map = new Map<string, CheckedItemInfo>();
  if (data) data.forEach((r: any) => map.set(r.item_id, { 
    horario_real: r.horario_real, 
    status: (r.status || "done") as ChecklistItemStatus 
  }));
  return map;
};

export const toggleChecklistItem = async (
  dayIdx: number,
  itemId: string,
  isChecked: boolean,
  horarioReal?: string
) => {
  const dateStr = getLocalDateStr();
  if (isChecked) {
    await supabase
      .from("checklist_items")
      .delete()
      .eq("data", dateStr)
      .eq("dia_semana", dayIdx)
      .eq("item_id", itemId);
  } else {
    await supabase.from("checklist_items").upsert(
      { data: dateStr, dia_semana: dayIdx, item_id: itemId, horario_real: horarioReal || null, status: "done" },
      { onConflict: "data,dia_semana,item_id" }
    );
  }
};

export const skipChecklistItem = async (
  dayIdx: number,
  itemId: string,
  isSkipped: boolean
) => {
  const dateStr = getLocalDateStr();
  if (isSkipped) {
    // Unmark skip — remove the row
    await supabase
      .from("checklist_items")
      .delete()
      .eq("data", dateStr)
      .eq("dia_semana", dayIdx)
      .eq("item_id", itemId);
  } else {
    // Mark as skipped
    await supabase.from("checklist_items").upsert(
      { data: dateStr, dia_semana: dayIdx, item_id: itemId, horario_real: null, status: "skipped" },
      { onConflict: "data,dia_semana,item_id" }
    );
  }
};

export const updateChecklistTime = async (dayIdx: number, itemId: string, time: string | null) => {
  const dateStr = getLocalDateStr();
  if (time === null) {
    await supabase
      .from("checklist_items")
      .update({ horario_real: null })
      .eq("data", dateStr)
      .eq("dia_semana", dayIdx)
      .eq("item_id", itemId);
  } else {
    await supabase.from("checklist_items").upsert(
      { data: dateStr, dia_semana: dayIdx, item_id: itemId, horario_real: time, status: "done" },
      { onConflict: "data,dia_semana,item_id" }
    );
  }
};

// ─── TIPO DE DIA ─────────────────────────────────────────────────────────────

export const loadTipoDiaFromDB = async (dateStr?: string): Promise<string> => {
  const d = dateStr || getLocalDateStr();
  const { data } = await supabase
    .from("tipo_dia")
    .select("tipo")
    .eq("data", d)
    .limit(1);
  return data && data.length > 0 ? data[0].tipo : "normal";
};

export const saveTipoDia = async (tipo: string, dateStr?: string) => {
  const d = dateStr || getLocalDateStr();
  await supabase.from("tipo_dia").upsert(
    { data: d, tipo },
    { onConflict: "data" }
  );
};

// ─── ÁGUA ────────────────────────────────────────────────────────────────────

export const loadAguaFromDB = async (dateStr?: string): Promise<number> => {
  const d = dateStr || getLocalDateStr();
  const { data } = await supabase
    .from("agua_registros")
    .select("quantidade_ml")
    .eq("data", d)
    .limit(1);
  return data && data.length > 0 ? data[0].quantidade_ml : 0;
};

export const saveAgua = async (ml: number, dateStr?: string) => {
  const d = dateStr || getLocalDateStr();
  await supabase.from("agua_registros").upsert(
    { data: d, quantidade_ml: ml },
    { onConflict: "data" }
  );
};

// ─── HELPERS for Dashboard ──────────────────────────────────────────────────

export const getChecklistPctFromDB = async (dayIdx: number): Promise<{ pct: number; count: number; }> => {
  const d = getLocalDateStr();
  const { data, count } = await supabase
    .from("checklist_items")
    .select("item_id", { count: "exact" })
    .eq("data", d)
    .eq("dia_semana", dayIdx);
  const c = count || (data ? data.length : 0);
  return { pct: 0, count: c };
};
